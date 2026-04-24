from sqlmodel import Field, Relationship, SQLModel

from app.models.ingrediente import Ingrediente
from app.models.producto import Producto


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "producto_ingredientes"

    producto_id: int = Field(foreign_key="productos.id", primary_key=True, ondelete="CASCADE")
    ingrediente_id: int = Field(foreign_key="ingredientes.id", primary_key=True, ondelete="RESTRICT")
    cantidad: float = Field(default=1, ge=0)
    es_removible: bool = Field(default=False)

    producto: Producto = Relationship(back_populates="ingrediente_links")
    ingrediente: Ingrediente = Relationship(back_populates="producto_links")
