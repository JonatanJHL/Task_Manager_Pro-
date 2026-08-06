<div align="center">

<img src="task_manager_pro.png" width="220" alt="Task Manager Pro Logo"/>

# Task Manager Pro

**Aplicación full-stack para gestión de tareas con sistema Kanban, drag & drop, comentarios, archivos adjuntos, analytics con gráficos interactivos y notificaciones por email automatizadas.**

[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20MySQL%20%7C%20Docker-blue)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## 🚀 Quick Start (Docker — recomendado para equipos)

Requisito único: tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado. No necesitas instalar Node.js, MySQL ni nada más.

```bash
./setup.sh
```

Esto crea tu `.env` (con un `JWT_SECRET` generado automáticamente) y levanta base de datos, backend y frontend con un solo comando. Al terminar, abre **http://localhost:8080**.

Para que el resto del equipo entre desde su propia computadora (misma red privada/VPN/oficina), comparten la URL `http://<IP-de-esta-máquina>:8080` — el frontend detecta solo a qué servidor hablarle, no hay que reconfigurar nada por persona.

Comandos útiles:
```bash
docker compose logs -f       # ver logs
docker compose down          # apagar todo (los datos persisten)
docker compose down -v       # apagar y borrar también los datos
```

## 🛠️ Quick Start (desarrollo local, sin Docker)

Si vas a programar sobre el proyecto y prefieres correrlo directo con Node:

### 1. Backend

```bash
cd task-manager-api
npm install
cp .env.example .env
# Edita .env con tus credenciales de MySQL local
mysql -u root -p < schema.sql
npm run dev
```

### 2. Frontend

```bash
cd task-manager-frontend
npm install
npm run dev
```

### 3. Abre http://localhost:5173

## 📋 Requisitos

- **Con Docker:** solo Docker Desktop.
- **Sin Docker:** Node.js 18+ y MySQL 8+.
- Cuenta en [Resend.com](https://resend.com) para emails reales — opcional, sin ella los emails solo se registran en el log.

## 📁 Estructura

```
task-manager-api/      # Backend Node.js + Express
task-manager-frontend/ # Frontend React + Vite
docker-compose.yml     # Orquesta db + api + web
setup.sh               # Setup de un solo comando
```

## ✨ Características y Acciones Disponibles

- 📋 **Tablero Kanban Interactivo**: Organización visual de tareas por columnas (`To Do`, `In Progress`, `Done`) con soporte de **Drag & Drop** en tiempo real.
- 🎯 **Gestión Completa de Proyectos y Tareas**: Creación, edición, eliminación y filtrado por prioridad (`Baja`, `Media`, `Alta`) y fechas de vencimiento.
- 💬 **Comentarios en Hilo (Threaded Comments)**: Discusión estructurada por tarea con soporte para respuestas anidadas y eliminación por autor.
- 📎 **Archivos Adjuntos**: Carga y descarga dinámica de archivos directamente desde el panel de tareas.
- 📊 **Analytics e Informes de Productividad**: Gráficos interactivos de barra y dona (vía Recharts) para medir tareas por estado, prioridad y tasa de completado.
- 🛡️ **Protección Anti-IDOR Integrada**: Validación de pertenencia en todas las rutas de API para garantizar que ningún usuario acceda o modifique recursos ajenos.
- ✉️ **Notificaciones por Email (Resend)**: Envío automático de correos en eventos clave (creación de tarea, cambio de estado, nuevos comentarios).

## 📖 Guía Visual de Funcionamiento y Mockups de Pantalla

A continuación se muestra en detalle cómo se interactúa con cada módulo y acción de **Task Manager Pro**:

### 1. 📋 Tablero Kanban & Drag & Drop
El tablero organiza las tareas en 3 columnas principales. Al arrastrar una tarjeta entre columnas, el estado se actualiza dinámicamente.

```text
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ 🟡 POR HACER (To Do)      │ 🔵 EN PROGRESO            │ 🟢 COMPLETADO (Done)      │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ ┌───────────────────────┐ │ ┌───────────────────────┐ │ ┌───────────────────────┐ │
│ │ 🔴 Alta               │ │ │ 🟡 Media              │ │ │ 🟢 Baja               │ │
│ │ Crear API Autenticación│ │ │ Implementar Dashboard │ │ │ Setup Docker Compose  │ │
│ │ 📅 Vence: 15/Aug      │ │ │ 📅 Vence: 12/Aug      │ │ │ 📅 Vence: 05/Aug      │ │
│ │ 💬 (3)  📎 (2)        │ │ │ 💬 (1)  📎 (0)        │ │ │ 💬 (5)  📎 (1)        │ │
│ └───────────────────────┘ │ └───────────────────────┘ │ └───────────────────────┘ │
│           │               │        🖱️ Arrastrar ───►  │                           │
│ ┌───────────────────────┐ │                           │                           │
│ │ 🟡 Media              │ │                           │                           │
│ │ Diseñar Mockups UI    │ │                           │                           │
│ └───────────────────────┘ │                           │                           │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

#### Acciones en el Tablero:
1. **Crear Tarea**: Haz clic en `+ Nueva Tarea`, ingresa título, descripción, prioridad (`Baja`, `Media`, `Alta`) y fecha límite.
2. **Arrastrar & Soltar**: Arrastra cualquier tarjeta hacia la columna de destino. El servidor recibe la petición y actualiza el estado.
3. **Filtros**: Selecciona un proyecto en la lista desplegable superior para filtrar las tarjetas del proyecto activo.

---

### 2. 💬 Sistema de Comentarios en Hilo (Threaded Comments)
Cada tarjeta cuenta con su propio panel modal de discusión estructurada.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 💬 Comentarios de la Tarea: "Crear API Autenticación"                  │
├────────────────────────────────────────────────────────────────────────┤
│ 👤 Carlos Dev  (01/Aug 14:30)                                          │
│ └─ "Ya agregué el middleware de JWT. Falta probar las cookies."        │
│    [ ↩️ Responder ]  [ 🗑️ Eliminar ]                                   │
│                                                                        │
│    └─ 👤 Ana Tech Lead  (01/Aug 14:35)                                │
│       └─ "Excelente Carlos. Recuerda validar la expiración a 24h."     │
│          [ ↩️ Responder ]                                               │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ ✍️ Escribe un comentario...                                         │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ [ 🚀 Publicar Comentario ]                                             │
└────────────────────────────────────────────────────────────────────────┘
```

#### Acciones en Comentarios:
- **Publicar en Hilo**: Haz clic en el ícono `💬` de cualquier tarjeta.
- **Respuestas Anidadas**: Haz clic en `Responder` debajo de un comentario para abrir el cuadro de respuesta hijo.
- **Eliminación Segura**: Solo el autor original puede eliminar su propio comentario.

---

### 3. 📎 Gestión de Archivos Adjuntos (Attachments)
Permite subir evidencias, diagramas de arquitectura o requerimientos en PDF, PNG, ZIP, etc.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 📎 Archivos Adjuntos                                                   │
├────────────────────────────────────────────────────────────────────────┤
│ 📤 [ Subir archivo ]  (Arrastra o selecciona de tu equipo)             │
│                                                                        │
│ 📄 diagram_arquitectura.png   (Subido por Carlos Dev)                  │
│    [ 📥 Descargar ]  [ 🗑️ Eliminar ]                                   │
│                                                                        │
│ 📦 requerimientos_v1.pdf      (Subido por Ana Tech Lead)               │
│    [ 📥 Descargar ]  [ 🗑️ Eliminar ]                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. 📊 Analytics e Informes de Productividad (Recharts)
Dashboard visual interactivo accesible desde la barra superior (`/analytics`).

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ 📊 Tareas por Estado                  │ 🎨 Distribución por Prioridad         │
├───────────────────────────────────────┼───────────────────────────────────────┤
│                                       │                                       │
│  10 ┤  █                              │              ██████ (45% Alta)        │
│   8 ┤  █      █                       │            ██        ██               │
│   6 ┤  █      █      █                │           ██  (35%)   ██ (20% Baja)   │
│   4 ┤  █      █      █                │            ██        ██               │
│   2 ┤  █      █      █                │              ██████ (Media)           │
│   0 └────┬──────┬──────┬──            │                                       │
│        Por    Progreso Completado     │                                       │
│        Hacer                          │                                       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

#### Métricas desplegadas:
- **Resumen Global**: Total de tareas, tareas completadas y % de tasa de éxito.
- **Desglose de Estados**: Gráficos de barras comparativos.
- **Distribución de Carga**: Gráfico circular (Dona) por severidad/prioridad.

---

### 5. ✉️ Notificaciones de Email Automatizadas (Resend Flow)

```mermaid
flowchart LR
    A[👨‍💻 Usuario crea Tarea / Comentario / Push] --> B(☁️ Express API Backend)
    B --> C{Resend API Key?}
    C -- Sí --> D[✉️ Envío de Email HTML a Admin / Asignados]
    C -- No --> E[📝 Log de consola de desarrollo]
```

## 🔒 Notas de seguridad al compartir con el equipo

- Cambia `JWT_SECRET` y `DB_PASSWORD` en `.env` antes de usarlo con gente real (el script ya genera el `JWT_SECRET` por ti).
- Si el servidor va a tener una URL fija dentro de tu red, define `ALLOWED_ORIGIN` en `.env` para que la API solo acepte pedidos desde ahí.
- MySQL no expone ningún puerto fuera de la red interna de Docker — solo el backend puede hablarle.

## 📝 Licencia

MIT - Ver archivo LICENSE
