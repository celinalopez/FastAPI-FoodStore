from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.categoria import CategoriaCreate, CategoriaList, CategoriaRead, CategoriaUpdate
from app.services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("", response_model=CategoriaList)
def list_categorias(
    session: Annotated[Session, Depends(get_session)],
    nombre: Annotated[str | None, Query(max_length=100, description="Filtrar por nombre")] = None,
    activo: Annotated[bool | None, Query(description="Filtrar por estado activo")] = None,
    offset: Annotated[int, Query(ge=0, description="Registros a omitir")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Cantidad máxima")] = 20,
) -> CategoriaList:
    items, total = categoria_service.get_all(session, offset=offset, limit=limit, nombre=nombre, activo=activo)
    return CategoriaList(items=items, total=total)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    session: Annotated[Session, Depends(get_session)],
    categoria_id: Annotated[int, Path(ge=1, description="ID de la categoría")],
) -> CategoriaRead:
    return categoria_service.get_by_id(session, categoria_id)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    session: Annotated[Session, Depends(get_session)],
    data: CategoriaCreate,
) -> CategoriaRead:
    return categoria_service.create(session, data)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update_categoria(
    session: Annotated[Session, Depends(get_session)],
    categoria_id: Annotated[int, Path(ge=1)],
    data: CategoriaUpdate,
) -> CategoriaRead:
    return categoria_service.update(session, categoria_id, data)


@router.delete("/{categoria_id}", response_model=CategoriaRead)
def inactivar_categoria(
    session: Annotated[Session, Depends(get_session)],
    categoria_id: Annotated[int, Path(ge=1)],
) -> CategoriaRead:
    return categoria_service.inactivar(session, categoria_id)


@router.post("/{categoria_id}/activar", response_model=CategoriaRead)
def activar_categoria(
    session: Annotated[Session, Depends(get_session)],
    categoria_id: Annotated[int, Path(ge=1)],
) -> CategoriaRead:
    return categoria_service.activar(session, categoria_id)
