from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel, Column
from sqlalchemy import Numeric, JSON


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


if TYPE_CHECKING:
    from app.models.producto_categoria import ProductoCategoria
    from app.models.producto_ingrediente import ProductoIngrediente


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: str | None = Field(default=None)
    precio_base: Decimal = Field(default=Decimal("0"), sa_column=Column(Numeric(10, 2), nullable=False, default=0))
    imagenes_url: list[str] | None = Field(default_factory=list, sa_column=Column(JSON, nullable=False, default=[]))
    stock_cantidad: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    deleted_at: datetime | None = Field(default=None)

    categoria_links: list["ProductoCategoria"] = Relationship(back_populates="producto")
    ingrediente_links: list["ProductoIngrediente"] = Relationship(back_populates="producto")
