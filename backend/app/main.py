from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.routers import categoria_router, ingrediente_router, producto_router

# Import models so SQLModel registers them before create_all
from app.models.categoria import Categoria  # noqa: F401
from app.models.ingrediente import Ingrediente  # noqa: F401
from app.models.producto import Producto  # noqa: F401
from app.models.producto_categoria import ProductoCategoria  # noqa: F401
from app.models.producto_ingrediente import ProductoIngrediente  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    yield


app = FastAPI(
    title="Catálogo de Productos API",
    description="API para gestión de productos, categorías e ingredientes — Parcial 1",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categoria_router.router)
app.include_router(ingrediente_router.router)
app.include_router(producto_router.router)


@app.get("/", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Catálogo de Productos API"}
