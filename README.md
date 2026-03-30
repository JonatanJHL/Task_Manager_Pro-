# Task Manager Pro

Aplicación full-stack para gestión de tareas con sistema Kanban, drag & drop, comentarios, archivos adjuntos, analytics con gráficos interactivos y notificaciones por email automatizadas.

**Stack:** Node.js, Express, React, MySQL, JWT, Resend

## 🚀 Quick Start

### 1. Backend

```bash
cd task-manager-api
npm install
cp .env.example .env
# Edita .env con tus credenciales
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

- Node.js 18+
- MySQL 8+
- Cuenta en [Resend.com](https://resend.com) (para emails)

## 📁 Estructura

```
task-manager-api/      # Backend Node.js + Express
task-manager-frontend/ # Frontend React + Vite
```

## 📝 Licencia

MIT - Ver archivo LICENSE
