from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.producto import ProductoCreate, ProductoDetail, ProductoList, ProductoRead, ProductoUpdate
from app.services import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("", response_model=ProductoList)
def list_productos(
    session: Annotated[Session, Depends(get_session)],
    nombre: Annotated[str | None, Query(max_length=150, description="Filtrar por nombre")] = None,
    disponible: Annotated[bool | None, Query(description="Filtrar por disponibilidad")] = None,
    activo: Annotated[bool | None, Query(description="Filtrar por estado activo")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ProductoList:
    items, total = producto_service.get_all(
        session, offset=offset, limit=limit, nombre=nombre, disponible=disponible, activo=activo
    )
    return ProductoList(items=items, total=total)


@router.get("/{producto_id}", response_model=ProductoDetail)
def get_producto(
    session: Annotated[Session, Depends(get_session)],
    producto_id: Annotated[int, Path(ge=1, description="ID del producto")],
) -> ProductoDetail:
    return producto_service.get_detail(session, producto_id)


@router.post("", response_model=ProductoDetail, status_code=status.HTTP_201_CREATED)
def create_producto(
    session: Annotated[Session, Depends(get_session)],
    data: ProductoCreate,
) -> ProductoDetail:
    return producto_service.create(session, data)


@router.put("/{producto_id}", response_model=ProductoDetail)
def update_producto(
    session: Annotated[Session, Depends(get_session)],
    producto_id: Annotated[int, Path(ge=1)],
    data: ProductoUpdate,
) -> ProductoDetail:
    return producto_service.update(session, producto_id, data)


@router.delete("/{producto_id}", response_model=ProductoRead)
def inactivar_producto(
    session: Annotated[Session, Depends(get_session)],
    producto_id: Annotated[int, Path(ge=1)],
) -> ProductoRead:
    return producto_service.inactivar(session, producto_id)


@router.post("/{producto_id}/activar", response_model=ProductoRead)
def activar_producto(
    session: Annotated[Session, Depends(get_session)],
    producto_id: Annotated[int, Path(ge=1)],
) -> ProductoRead:
    return producto_service.activar(session, producto_id)
