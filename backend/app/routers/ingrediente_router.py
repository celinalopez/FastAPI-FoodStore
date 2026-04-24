from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.ingrediente import IngredienteCreate, IngredienteList, IngredienteRead, IngredienteUpdate
from app.services import ingrediente_service

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("", response_model=IngredienteList)
def list_ingredientes(
    session: Annotated[Session, Depends(get_session)],
    nombre: Annotated[str | None, Query(max_length=100, description="Filtrar por nombre")] = None,
    activo: Annotated[bool | None, Query(description="Filtrar por estado activo")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> IngredienteList:
    items, total = ingrediente_service.get_all(session, offset=offset, limit=limit, nombre=nombre, activo=activo)
    return IngredienteList(items=items, total=total)


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def get_ingrediente(
    session: Annotated[Session, Depends(get_session)],
    ingrediente_id: Annotated[int, Path(ge=1, description="ID del ingrediente")],
) -> IngredienteRead:
    return ingrediente_service.get_by_id(session, ingrediente_id)


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create_ingrediente(
    session: Annotated[Session, Depends(get_session)],
    data: IngredienteCreate,
) -> IngredienteRead:
    return ingrediente_service.create(session, data)


@router.put("/{ingrediente_id}", response_model=IngredienteRead)
def update_ingrediente(
    session: Annotated[Session, Depends(get_session)],
    ingrediente_id: Annotated[int, Path(ge=1)],
    data: IngredienteUpdate,
) -> IngredienteRead:
    return ingrediente_service.update(session, ingrediente_id, data)


@router.delete("/{ingrediente_id}", response_model=IngredienteRead)
def inactivar_ingrediente(
    session: Annotated[Session, Depends(get_session)],
    ingrediente_id: Annotated[int, Path(ge=1)],
) -> IngredienteRead:
    return ingrediente_service.inactivar(session, ingrediente_id)


@router.post("/{ingrediente_id}/activar", response_model=IngredienteRead)
def activar_ingrediente(
    session: Annotated[Session, Depends(get_session)],
    ingrediente_id: Annotated[int, Path(ge=1)],
) -> IngredienteRead:
    return ingrediente_service.activar(session, ingrediente_id)
