from fastapi.testclient import TestClient


def _crear_categoria(client: TestClient, nombre: str = "General") -> dict:
    return client.post("/categorias", json={"nombre": nombre}).json()


def test_create_producto_with_relations(client: TestClient):
    cat = _crear_categoria(client, "Pizzas")
    ing = client.post("/ingredientes", json={"nombre": "Mozzarella", "es_alergeno": True}).json()

    response = client.post("/productos", json={
        "nombre": "Pizza Margherita",
        "precio_base": 1500.0,
        "disponible": True,
        "categorias": [{"categoria_id": cat["id"], "es_principal": True}],
        "ingredientes": [{"ingrediente_id": ing["id"], "cantidad": 200, "es_removible": True}],
    })
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Pizza Margherita"
    assert data["activo"] is True
    assert len(data["categorias"]) == 1
    assert data["categorias"][0]["es_principal"] is True
    assert len(data["ingredientes"]) == 1
    assert data["ingredientes"][0]["cantidad"] == 200
    assert data["ingredientes"][0]["es_removible"] is True
    assert data["ingredientes"][0]["es_alergeno"] is True


def test_create_producto_sin_categoria_falla(client: TestClient):
    response = client.post("/productos", json={"nombre": "SinCat", "precio_base": 100})
    assert response.status_code == 422


def test_get_producto_detail(client: TestClient):
    cat = _crear_categoria(client, "Postres")
    prod = client.post("/productos", json={
        "nombre": "Tiramisú", "precio_base": 800.0,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    response = client.get(f"/productos/{prod['id']}")
    assert response.status_code == 200
    assert response.json()["categorias"][0]["nombre"] == "Postres"


def test_update_producto(client: TestClient):
    cat = _crear_categoria(client)
    prod = client.post("/productos", json={
        "nombre": "Viejo", "precio_base": 100,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    response = client.put(f"/productos/{prod['id']}", json={"nombre": "Nuevo", "precio_base": 200})
    assert response.status_code == 200
    assert response.json()["nombre"] == "Nuevo"


def test_stock_cantidad(client: TestClient):
    cat = _crear_categoria(client, "Stock")
    prod = client.post("/productos", json={
        "nombre": "ConStock", "precio_base": 50, "stock_cantidad": 10,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    assert prod["stock_cantidad"] == 10


def test_inactivar_producto(client: TestClient):
    cat = _crear_categoria(client, "Inact")
    prod = client.post("/productos", json={
        "nombre": "Borrar", "precio_base": 50,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    response = client.delete(f"/productos/{prod['id']}")
    assert response.status_code == 200
    assert response.json()["activo"] is False


def test_activar_producto(client: TestClient):
    cat = _crear_categoria(client, "Act")
    prod = client.post("/productos", json={
        "nombre": "Reactivar", "precio_base": 75,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    client.delete(f"/productos/{prod['id']}")
    response = client.post(f"/productos/{prod['id']}/activar")
    assert response.status_code == 200
    assert response.json()["activo"] is True


def test_activar_producto_con_categoria_inactiva(client: TestClient):
    cat = _crear_categoria(client, "CatInact")
    prod = client.post("/productos", json={
        "nombre": "ProdBlock", "precio_base": 100,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    client.delete(f"/categorias/{cat['id']}")
    response = client.post(f"/productos/{prod['id']}/activar")
    assert response.status_code == 400


def test_activar_producto_con_ingrediente_inactivo(client: TestClient):
    cat = _crear_categoria(client, "CatOk")
    ing = client.post("/ingredientes", json={"nombre": "IngInact"}).json()
    prod = client.post("/productos", json={
        "nombre": "ProdBlock2", "precio_base": 100,
        "categorias": [{"categoria_id": cat["id"]}],
        "ingredientes": [{"ingrediente_id": ing["id"], "cantidad": 1}],
    }).json()
    client.delete(f"/ingredientes/{ing['id']}")
    response = client.post(f"/productos/{prod['id']}/activar")
    assert response.status_code == 400


def test_list_productos_filter(client: TestClient):
    cat = _crear_categoria(client, "Filtro")
    client.post("/productos", json={
        "nombre": "Hamburguesa", "precio_base": 900,
        "categorias": [{"categoria_id": cat["id"]}],
    })
    response = client.get("/productos?nombre=Hambur")
    assert response.status_code == 200
    assert response.json()["total"] >= 1
