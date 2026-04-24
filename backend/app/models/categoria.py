from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


if TYPE_CHECKING:
    from app.models.producto_categoria import ProductoCategoria


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    parent_id: int | None = Field(default=None, foreign_key="categorias.id", ondelete="SET NULL")
    nombre: str = Field(max_length=100, index=True, unique=True)
    descripcion: str | None = Field(default=None)
    imagen_url: str | None = Field(default=None)
    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    deleted_at: datetime | None = Field(default=None)

    producto_links: list["ProductoCategoria"] = Relationship(back_populates="categoria")
