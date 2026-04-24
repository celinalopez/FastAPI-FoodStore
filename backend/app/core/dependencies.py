from typing import Annotated

from fastapi import Query


class PaginationParams:
    def __init__(
        self,
        offset: Annotated[int, Query(ge=0, description="Registros a omitir")] = 0,
        limit: Annotated[int, Query(ge=1, le=100, description="Cantidad máxima de registros")] = 20,
    ):
        self.offset = offset
        self.limit = limit
