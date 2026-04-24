from datetime import datetime
from typing import Annotated

from pydantic import Field
from sqlmodel import SQLModel


class CategoriaCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    descripcion: str | None = None
    imagen_url: str | None = None
    parent_id: int | None = None


class CategoriaUpdate(SQLModel):
    nombre: Annotated[str | None, Field(min_length=1, max_length=100)] = None
    descripcion: str | None = None
    imagen_url: str | None = None
    parent_id: int | None = None


class CategoriaRead(SQLModel):
    id: int
    parent_id: int | None
    nombre: str
    descripcion: str | None
    imagen_url: str | None
    activo: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class CategoriaList(SQLModel):
    items: list[CategoriaRead]
    total: int
