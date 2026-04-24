from collections.abc import Generator

from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:  # type: ignore[no-untyped-def]
        if self.session is None:
            return
        if exc_type is not None:
            self.session.rollback()
        self.session.close()

    def commit(self) -> None:
        if self.session:
            self.session.commit()

    def rollback(self) -> None:
        if self.session:
            self.session.rollback()


def get_uow() -> Generator[UnitOfWork, None, None]:
    with UnitOfWork() as uow:
        yield uow
