from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


if TYPE_CHECKING:
    from app.models.producto_ingrediente import ProductoIngrediente


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingredientes"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, index=True, unique=True)
    descripcion: str | None = Field(default=None)
    es_alergeno: bool = Field(default=False)
    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    producto_links: list["ProductoIngrediente"] = Relationship(back_populates="ingrediente")
