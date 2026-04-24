from datetime import datetime
from typing import Annotated

from pydantic import Field
from sqlmodel import SQLModel


class IngredienteCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    descripcion: str | None = None
    es_alergeno: bool = False


class IngredienteUpdate(SQLModel):
    nombre: Annotated[str | None, Field(min_length=1, max_length=100)] = None
    descripcion: str | None = None
    es_alergeno: bool | None = None


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    es_alergeno: bool
    activo: bool
    created_at: datetime
    updated_at: datetime


class IngredienteList(SQLModel):
    items: list[IngredienteRead]
    total: int
