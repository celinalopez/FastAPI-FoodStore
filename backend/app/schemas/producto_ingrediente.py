from sqlmodel import SQLModel


class ProductoIngredienteCreate(SQLModel):
    producto_id: int
    ingrediente_id: int
    cantidad: float = 1
    es_removible: bool = False


class ProductoIngredienteRead(SQLModel):
    producto_id: int
    ingrediente_id: int
    cantidad: float
    es_removible: bool


class IngredienteConCantidad(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    es_alergeno: bool
    cantidad: float
    es_removible: bool
