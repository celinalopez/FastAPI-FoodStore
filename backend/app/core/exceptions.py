from fastapi import HTTPException, status


def not_found(detail: str = "Recurso no encontrado") -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def bad_request(detail: str = "Datos inválidos") -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def conflict(detail: str = "El recurso ya existe") -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
