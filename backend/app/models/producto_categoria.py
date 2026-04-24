from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel

from app.models.categoria import Categoria
from app.models.producto import Producto


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "producto_categorias"

    producto_id: int = Field(foreign_key="productos.id", primary_key=True, ondelete="CASCADE")
    categoria_id: int = Field(foreign_key="categorias.id", primary_key=True, ondelete="RESTRICT")
    es_principal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=_utcnow)

    producto: Producto = Relationship(back_populates="categoria_links")
    categoria: Categoria = Relationship(back_populates="producto_links")
