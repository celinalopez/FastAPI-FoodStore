from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import Field
from sqlmodel import SQLModel

from app.schemas.categoria import CategoriaRead
from app.schemas.producto_ingrediente import IngredienteConCantidad


class CategoriaInput(SQLModel):
    categoria_id: int
    es_principal: bool = False


class IngredienteInput(SQLModel):
    ingrediente_id: int
    cantidad: float = 1
    es_removible: bool = False


class ProductoCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=1, max_length=150)]
    descripcion: str | None = None
    precio_base: Annotated[Decimal, Field(ge=0)]
    imagenes_url: list[str] = []
    stock_cantidad: Annotated[int, Field(ge=0)] = 0
    disponible: bool = True
    categorias: Annotated[list[CategoriaInput], Field(min_length=1)]
    ingredientes: list[IngredienteInput] = []


class ProductoUpdate(SQLModel):
    nombre: Annotated[str | None, Field(min_length=1, max_length=150)] = None
    descripcion: str | None = None
    precio_base: Annotated[Decimal | None, Field(ge=0)] = None
    imagenes_url: list[str] | None = None
    stock_cantidad: Annotated[int | None, Field(ge=0)] = None
    disponible: bool | None = None
    categorias: list[CategoriaInput] | None = None
    ingredientes: list[IngredienteInput] | None = None


class CategoriaEnProducto(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    es_principal: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: Decimal
    imagenes_url: list[str]
    stock_cantidad: int
    disponible: bool
    activo: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ProductoDetail(ProductoRead):
    categorias: list[CategoriaEnProducto] = []
    ingredientes: list[IngredienteConCantidad] = []


class ProductoList(SQLModel):
    items: list[ProductoRead]
    total: int
