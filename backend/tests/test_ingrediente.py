from fastapi.testclient import TestClient


def test_create_ingrediente(client: TestClient):
    response = client.post("/ingredientes", json={"nombre": "Tomate", "descripcion": "Rojo", "es_alergeno": False})
    assert response.status_code == 201
    assert response.json()["nombre"] == "Tomate"
    assert response.json()["es_alergeno"] is False
    assert response.json()["activo"] is True


def test_create_ingrediente_alergeno(client: TestClient):
    response = client.post("/ingredientes", json={"nombre": "Maní", "es_alergeno": True})
    assert response.status_code == 201
    assert response.json()["es_alergeno"] is True


def test_create_ingrediente_duplicado(client: TestClient):
    client.post("/ingredientes", json={"nombre": "Sal"})
    response = client.post("/ingredientes", json={"nombre": "Sal"})
    assert response.status_code == 409


def test_list_ingredientes(client: TestClient):
    client.post("/ingredientes", json={"nombre": "Ing1"})
    response = client.get("/ingredientes")
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_inactivar_ingrediente(client: TestClient):
    create = client.post("/ingredientes", json={"nombre": "Borrar"})
    ing_id = create.json()["id"]
    response = client.delete(f"/ingredientes/{ing_id}")
    assert response.status_code == 200
    assert response.json()["activo"] is False


def test_inactivar_ingrediente_cascada_productos(client: TestClient):
    cat = client.post("/categorias", json={"nombre": "CatCascIng"}).json()
    ing = client.post("/ingredientes", json={"nombre": "Queso"}).json()
    prod = client.post("/productos", json={
        "nombre": "Pizza", "precio_base": 500,
        "categorias": [{"categoria_id": cat["id"]}],
        "ingredientes": [{"ingrediente_id": ing["id"], "cantidad": 100}],
    }).json()
    client.delete(f"/ingredientes/{ing['id']}")
    detail = client.get(f"/productos/{prod['id']}").json()
    assert detail["activo"] is False


def test_activar_ingrediente(client: TestClient):
    ing = client.post("/ingredientes", json={"nombre": "React"}).json()
    client.delete(f"/ingredientes/{ing['id']}")
    response = client.post(f"/ingredientes/{ing['id']}/activar")
    assert response.status_code == 200
    assert response.json()["activo"] is True
