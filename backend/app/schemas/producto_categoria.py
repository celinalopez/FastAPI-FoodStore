from sqlmodel import SQLModel


class ProductoCategoriaCreate(SQLModel):
    producto_id: int
    categoria_id: int
    es_principal: bool = False


class ProductoCategoriaRead(SQLModel):
    producto_id: int
    categoria_id: int
    es_principal: bool
