from datetime import datetime, timezone

from sqlmodel import Session, select, func

from app.core.exceptions import not_found, bad_request, conflict
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.producto_categoria import ProductoCategoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate


def get_all(
    session: Session,
    offset: int = 0,
    limit: int = 20,
    nombre: str | None = None,
    activo: bool | None = None,
) -> tuple[list[Categoria], int]:
    query = select(Categoria)
    count_query = select(func.count()).select_from(Categoria)

    if nombre:
        query = query.where(Categoria.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
        count_query = count_query.where(Categoria.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
    if activo is not None:
        query = query.where(Categoria.activo == activo)
        count_query = count_query.where(Categoria.activo == activo)

    total = session.exec(count_query).one()
    items = session.exec(query.offset(offset).limit(limit).order_by(Categoria.id)).all()
    return list(items), total


def get_by_id(session: Session, categoria_id: int) -> Categoria:
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise not_found("Categoría no encontrada")
    return categoria


def create(session: Session, data: CategoriaCreate) -> Categoria:
    existing = session.exec(
        select(Categoria).where(Categoria.nombre == data.nombre)
    ).first()
    if existing:
        raise conflict("Ya existe una categoría con ese nombre")
    categoria = Categoria.model_validate(data)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def update(session: Session, categoria_id: int, data: CategoriaUpdate) -> Categoria:
    categoria = get_by_id(session, categoria_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(categoria, key, value)
    categoria.updated_at = datetime.now(timezone.utc)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def inactivar(session: Session, categoria_id: int) -> Categoria:
    categoria = get_by_id(session, categoria_id)
    if not categoria.activo:
        raise bad_request("La categoría ya está inactiva")

    categoria.activo = False
    categoria.updated_at = datetime.now(timezone.utc)
    session.add(categoria)

    # Cascade: inactivar productos relacionados
    producto_ids = session.exec(
        select(ProductoCategoria.producto_id).where(
            ProductoCategoria.categoria_id == categoria_id
        )
    ).all()
    for pid in producto_ids:
        producto = session.get(Producto, pid)
        if producto and producto.activo:
            producto.activo = False
            producto.updated_at = datetime.now(timezone.utc)
            session.add(producto)

    session.commit()
    session.refresh(categoria)
    return categoria


def activar(session: Session, categoria_id: int) -> Categoria:
    categoria = get_by_id(session, categoria_id)
    if categoria.activo:
        raise bad_request("La categoría ya está activa")

    categoria.activo = True
    categoria.updated_at = datetime.now(timezone.utc)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria
