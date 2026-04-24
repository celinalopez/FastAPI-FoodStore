# Parcial 1 - Programación IV

## Catálogo de Productos — FastAPI + React

Aplicación fullstack para gestión de un catálogo de productos con categorías e ingredientes.  
Relaciones N:N entre Producto↔Categoría y Producto↔Ingrediente.

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI · SQLModel · PostgreSQL · psycopg · Uvicorn |
| Frontend | React · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · react-router-dom |
| Infraestructura | Docker · Docker Compose |

### Requisitos previos

- Python 3.11+
- Node.js 20+
- PostgreSQL 16 (o Docker)

### Ejecución con Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend (Swagger): http://localhost:8000/docs

### Ejecución local (desarrollo)

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Link al video

> _Completar con el link de YouTube/Drive_

