from fastapi.testclient import TestClient


def test_create_categoria(client: TestClient):
    response = client.post("/categorias", json={"nombre": "Bebidas", "descripcion": "Bebidas varias"})
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Bebidas"
    assert data["activo"] is True
    assert data["parent_id"] is None


def test_create_subcategoria(client: TestClient):
    parent = client.post("/categorias", json={"nombre": "Comidas"}).json()
    response = client.post("/categorias", json={"nombre": "Pastas", "parent_id": parent["id"]})
    assert response.status_code == 201
    assert response.json()["parent_id"] == parent["id"]


def test_create_categoria_duplicada(client: TestClient):
    client.post("/categorias", json={"nombre": "Unica"})
    response = client.post("/categorias", json={"nombre": "Unica"})
    assert response.status_code == 409


def test_list_categorias(client: TestClient):
    client.post("/categorias", json={"nombre": "Cat 1"})
    client.post("/categorias", json={"nombre": "Cat 2"})
    response = client.get("/categorias")
    assert response.status_code == 200
    assert response.json()["total"] == 2


def test_list_categorias_filter_activo(client: TestClient):
    client.post("/categorias", json={"nombre": "Activa"})
    borrada = client.post("/categorias", json={"nombre": "Borrada"}).json()
    client.delete(f"/categorias/{borrada['id']}")
    response = client.get("/categorias?activo=true")
    assert response.status_code == 200
    assert all(c["activo"] for c in response.json()["items"])


def test_get_categoria(client: TestClient):
    create = client.post("/categorias", json={"nombre": "Test"})
    cat_id = create.json()["id"]
    response = client.get(f"/categorias/{cat_id}")
    assert response.status_code == 200
    assert response.json()["nombre"] == "Test"


def test_update_categoria(client: TestClient):
    create = client.post("/categorias", json={"nombre": "Viejo"})
    cat_id = create.json()["id"]
    response = client.put(f"/categorias/{cat_id}", json={"nombre": "Nuevo"})
    assert response.status_code == 200
    assert response.json()["nombre"] == "Nuevo"


def test_inactivar_categoria(client: TestClient):
    create = client.post("/categorias", json={"nombre": "Borrar"})
    cat_id = create.json()["id"]
    response = client.delete(f"/categorias/{cat_id}")
    assert response.status_code == 200
    assert response.json()["activo"] is False


def test_inactivar_categoria_cascada_productos(client: TestClient):
    cat = client.post("/categorias", json={"nombre": "Pizzas"}).json()
    prod = client.post("/productos", json={
        "nombre": "Margh", "precio_base": 100,
        "categorias": [{"categoria_id": cat["id"]}],
    }).json()
    client.delete(f"/categorias/{cat['id']}")
    detail = client.get(f"/productos/{prod['id']}").json()
    assert detail["activo"] is False


def test_activar_categoria(client: TestClient):
    cat = client.post("/categorias", json={"nombre": "Reactiva"}).json()
    client.delete(f"/categorias/{cat['id']}")
    response = client.post(f"/categorias/{cat['id']}/activar")
    assert response.status_code == 200
    assert response.json()["activo"] is True


def test_get_categoria_not_found(client: TestClient):
    response = client.get("/categorias/9999")
    assert response.status_code == 404
