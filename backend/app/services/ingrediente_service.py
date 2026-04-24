from datetime import datetime, timezone

from sqlmodel import Session, select, func

from app.core.exceptions import not_found, conflict, bad_request
from app.models.ingrediente import Ingrediente
from app.models.producto import Producto
from app.models.producto_ingrediente import ProductoIngrediente
from app.schemas.ingrediente import IngredienteCreate, IngredienteUpdate


def get_all(
    session: Session,
    offset: int = 0,
    limit: int = 20,
    nombre: str | None = None,
    activo: bool | None = None,
) -> tuple[list[Ingrediente], int]:
    query = select(Ingrediente)
    count_query = select(func.count()).select_from(Ingrediente)

    if nombre:
        query = query.where(Ingrediente.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
        count_query = count_query.where(Ingrediente.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
    if activo is not None:
        query = query.where(Ingrediente.activo == activo)
        count_query = count_query.where(Ingrediente.activo == activo)

    total = session.exec(count_query).one()
    items = session.exec(query.offset(offset).limit(limit).order_by(Ingrediente.id)).all()
    return list(items), total


def get_by_id(session: Session, ingrediente_id: int) -> Ingrediente:
    ingrediente = session.get(Ingrediente, ingrediente_id)
    if not ingrediente:
        raise not_found("Ingrediente no encontrado")
    return ingrediente


def create(session: Session, data: IngredienteCreate) -> Ingrediente:
    existing = session.exec(
        select(Ingrediente).where(Ingrediente.nombre == data.nombre)
    ).first()
    if existing:
        raise conflict("Ya existe un ingrediente con ese nombre")

    ingrediente = Ingrediente.model_validate(data)
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    return ingrediente


def update(session: Session, ingrediente_id: int, data: IngredienteUpdate) -> Ingrediente:
    ingrediente = get_by_id(session, ingrediente_id)
    update_data = data.model_dump(exclude_unset=True)

    if "nombre" in update_data and update_data["nombre"]:
        existing = session.exec(
            select(Ingrediente).where(
                Ingrediente.nombre == update_data["nombre"],
                Ingrediente.id != ingrediente_id,
            )
        ).first()
        if existing:
            raise conflict("Ya existe un ingrediente con ese nombre")

    for key, value in update_data.items():
        setattr(ingrediente, key, value)
    ingrediente.updated_at = datetime.now(timezone.utc)
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    return ingrediente


def inactivar(session: Session, ingrediente_id: int) -> Ingrediente:
    ingrediente = get_by_id(session, ingrediente_id)
    if not ingrediente.activo:
        raise bad_request("El ingrediente ya está inactivo")

    ingrediente.activo = False
    ingrediente.updated_at = datetime.now(timezone.utc)
    session.add(ingrediente)

    # Cascade: inactivar productos que usan este ingrediente
    producto_ids = session.exec(
        select(ProductoIngrediente.producto_id).where(
            ProductoIngrediente.ingrediente_id == ingrediente_id
        )
    ).all()
    for pid in producto_ids:
        producto = session.get(Producto, pid)
        if producto and producto.activo:
            producto.activo = False
            producto.updated_at = datetime.now(timezone.utc)
            session.add(producto)

    session.commit()
    session.refresh(ingrediente)
    return ingrediente


def activar(session: Session, ingrediente_id: int) -> Ingrediente:
    ingrediente = get_by_id(session, ingrediente_id)
    if ingrediente.activo:
        raise bad_request("El ingrediente ya está activo")

    ingrediente.activo = True
    ingrediente.updated_at = datetime.now(timezone.utc)
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    return ingrediente
