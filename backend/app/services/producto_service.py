from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Session, select, func

from app.core.exceptions import not_found, bad_request
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.ingrediente import Ingrediente
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente
from app.schemas.producto import (
    ProductoCreate, ProductoUpdate, ProductoDetail,
    IngredienteInput, CategoriaInput, CategoriaEnProducto,
)
from app.schemas.producto_ingrediente import IngredienteConCantidad


def get_all(
    session: Session,
    offset: int = 0,
    limit: int = 20,
    nombre: str | None = None,
    disponible: bool | None = None,
    activo: bool | None = None,
) -> tuple[list[Producto], int]:
    query = select(Producto)
    count_query = select(func.count()).select_from(Producto)

    if nombre:
        query = query.where(Producto.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
        count_query = count_query.where(Producto.nombre.ilike(f"%{nombre}%"))  # type: ignore[union-attr]
    if disponible is not None:
        query = query.where(Producto.disponible == disponible)
        count_query = count_query.where(Producto.disponible == disponible)
    if activo is not None:
        query = query.where(Producto.activo == activo)
        count_query = count_query.where(Producto.activo == activo)

    total = session.exec(count_query).one()
    items = session.exec(query.offset(offset).limit(limit).order_by(Producto.id)).all()
    return list(items), total


def get_by_id(session: Session, producto_id: int) -> Producto:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise not_found("Producto no encontrado")
    return producto


def get_detail(session: Session, producto_id: int) -> ProductoDetail:
    producto = get_by_id(session, producto_id)

    cat_links = session.exec(
        select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
    ).all()
    categorias_out: list[CategoriaEnProducto] = []
    for link in cat_links:
        cat = session.get(Categoria, link.categoria_id)
        if cat:
            categorias_out.append(CategoriaEnProducto(
                id=cat.id,  # type: ignore[arg-type]
                nombre=cat.nombre,
                descripcion=cat.descripcion,
                es_principal=link.es_principal,
            ))

    ing_links = session.exec(
        select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
    ).all()
    ingredientes_out: list[IngredienteConCantidad] = []
    for link in ing_links:
        ing = session.get(Ingrediente, link.ingrediente_id)
        if ing:
            ingredientes_out.append(IngredienteConCantidad(
                id=ing.id,  # type: ignore[arg-type]
                nombre=ing.nombre,
                descripcion=ing.descripcion,
                es_alergeno=ing.es_alergeno,
                cantidad=link.cantidad,
                es_removible=link.es_removible,
            ))

    return ProductoDetail(
        id=producto.id,  # type: ignore[arg-type]
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio_base=producto.precio_base,
        imagenes_url=producto.imagenes_url or [],
        stock_cantidad=producto.stock_cantidad,
        disponible=producto.disponible,
        activo=producto.activo,
        created_at=producto.created_at,
        updated_at=producto.updated_at,
        deleted_at=producto.deleted_at,
        categorias=categorias_out,
        ingredientes=ingredientes_out,
    )


def _sync_categorias(session: Session, producto_id: int, categorias: list[CategoriaInput]) -> None:
    existing = session.exec(
        select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
    ).all()
    for link in existing:
        session.delete(link)

    for item in categorias:
        cat = session.get(Categoria, item.categoria_id)
        if cat:
            session.add(ProductoCategoria(
                producto_id=producto_id,
                categoria_id=item.categoria_id,
                es_principal=item.es_principal,
            ))


def _sync_ingredientes(session: Session, producto_id: int, ingredientes: list[IngredienteInput]) -> None:
    existing = session.exec(
        select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
    ).all()
    for link in existing:
        session.delete(link)

    for item in ingredientes:
        ing = session.get(Ingrediente, item.ingrediente_id)
        if ing:
            session.add(ProductoIngrediente(
                producto_id=producto_id,
                ingrediente_id=item.ingrediente_id,
                cantidad=item.cantidad,
                es_removible=item.es_removible,
            ))


def create(session: Session, data: ProductoCreate) -> ProductoDetail:
    producto = Producto(
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio_base=data.precio_base,
        imagenes_url=data.imagenes_url,
        stock_cantidad=data.stock_cantidad,
        disponible=data.disponible,
    )
    session.add(producto)
    session.flush()

    _sync_categorias(session, producto.id, data.categorias)  # type: ignore[arg-type]
    _sync_ingredientes(session, producto.id, data.ingredientes)  # type: ignore[arg-type]

    session.commit()
    session.refresh(producto)
    return get_detail(session, producto.id)  # type: ignore[arg-type]


def update(session: Session, producto_id: int, data: ProductoUpdate) -> ProductoDetail:
    producto = get_by_id(session, producto_id)
    update_data = data.model_dump(exclude_unset=True)

    categorias_input = update_data.pop("categorias", None)
    ingredientes_input = update_data.pop("ingredientes", None)

    for key, value in update_data.items():
        setattr(producto, key, value)
    producto.updated_at = datetime.now(timezone.utc)

    session.add(producto)
    session.flush()

    if categorias_input is not None:
        cats = [CategoriaInput(**c) if isinstance(c, dict) else c for c in categorias_input]
        _sync_categorias(session, producto_id, cats)
    if ingredientes_input is not None:
        ings = [IngredienteInput(**i) if isinstance(i, dict) else i for i in ingredientes_input]
        _sync_ingredientes(session, producto_id, ings)

    session.commit()
    session.refresh(producto)
    return get_detail(session, producto_id)


def inactivar(session: Session, producto_id: int) -> Producto:
    producto = get_by_id(session, producto_id)
    if not producto.activo:
        raise bad_request("El producto ya está inactivo")

    producto.activo = False
    producto.updated_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


def activar(session: Session, producto_id: int) -> Producto:
    producto = get_by_id(session, producto_id)
    if producto.activo:
        raise bad_request("El producto ya está activo")

    cat_ids = session.exec(
        select(ProductoCategoria.categoria_id).where(
            ProductoCategoria.producto_id == producto_id
        )
    ).all()
    for cid in cat_ids:
        cat = session.get(Categoria, cid)
        if cat and not cat.activo:
            raise bad_request(
                f"No se puede activar: la categoría '{cat.nombre}' está inactiva"
            )

    ing_ids = session.exec(
        select(ProductoIngrediente.ingrediente_id).where(
            ProductoIngrediente.producto_id == producto_id
        )
    ).all()
    for iid in ing_ids:
        ing = session.get(Ingrediente, iid)
        if ing and not ing.activo:
            raise bad_request(
                f"No se puede activar: el ingrediente '{ing.nombre}' está inactivo"
            )

    producto.activo = True
    producto.updated_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto
