# Lista de Verificación del Proyecto Integrador

## Backend (FastAPI + SQLModel)
● [X] Entorno: Uso de .venv, requirements.txt y FastAPI funcionando en modo
dev.
● [X] Modelado: Tablas creadas con SQLModel incluyendo relaciones
Relationship (1:N y N:N).
● [X] Validación: Uso de Annotated, Query y Path para reglas de negocio (ej.
longitudes, rangos).
● [X] CRUD Persistente: Endpoints funcionales para Crear, Leer, Actualizar y
Borrar en PostgreSQL.
● [X] Seguridad de Datos: Implementación de response_model para no filtrar
datos sensibles o innecesarios.
● [X] Estructura: Código organizado por módulos (routers, schemas, services,
models, uow).

## Frontend (React + TypeScript + Tailwind)
● [X] Setup: Proyecto creado con Vite + TS y estructura de carpetas limpia.
● [X] Componentes: Uso de componentes funcionales y Props debidamente
tipadas con interfaces.
● [X] Estilos: Interfaz construida íntegramente con clases de utilidad de Tailwind
CSS 4.
● [X] Navegación: Configuración de react-router-dom con al menos una ruta
dinámica (ej. /detalle/:id).
● [X] Estado Local: Uso de useState para el manejo de formularios o UI
interactiva.
Integración y Server State
● [X] Lectura (useQuery): Listados y detalles consumiendo datos reales de la
API.
● [X] Escritura (useMutation): Formularios que envían datos al backend con
éxito.
● [X] Sincronización: Uso de invalidateQueries para refrescar la UI
automáticamente tras un cambio.
● [X] Feedback: Gestión visual de estados de "Cargando..." y "Error" en las
peticiones.

## Video de Presentación
● [ ] Duración: El video dura 15 minutos o menos.
● [X] Audio/Video: La voz es clara y la resolución de pantalla permite leer el
código.
● [X] Demo: Se muestra el flujo completo desde la creación hasta la persistencia
en la DB.
