# 🚀 Content Publisher API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

API robusta y moderna diseñada para programar, gestionar y automatizar la publicación de contenido dinámico en redes sociales y otros canales. Desarrollada en **TypeScript** utilizando **Node.js** y **Express**, con persistencia en **PostgreSQL** y un sistema de calendarización automatizada mediante cron jobs.

> [!IMPORTANT]
> **Proyecto Privado y Confidencial.** Este repositorio contiene código propietario exclusivo. Consulta el archivo [LICENSE](./LICENSE) para conocer los términos de uso y restricciones.

---

## 📌 Tabla de Contenidos

- [📐 Patrón de Diseño y Arquitectura](#-patrón-de-diseño-y-arquitectura)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [🗄️ Modelo de Datos (Base de Datos)](#️-modelo-de-datos-base-de-datos)
- [📡 API Endpoints (Documentación)](#-api-endpoints-documentación)
- [🤖 Publicador y Calendarización (Background Jobs)](#-publicador-y-calendarización-background-jobs)
- [🔒 Seguridad y Middlewares](#-seguridad-y-middlewares)
- [🚀 Instalación y Despliegue](#-instalación-y-despliegue)

---

## 📐 Patrón de Diseño y Arquitectura

El proyecto está diseñado bajo el patrón **Controller-Service-Repository** (Arquitectura Multicapa). Esta separación de responsabilidades asegura un código altamente testeable, escalable y mantenible.

```mermaid
graph TD
    Client[Cliente / Cliente HTTP] -->|Petición HTTP| Routes[Routes Layer]
    Routes -->|Enruta la petición| Controllers[Controllers Layer]
    Controllers -->|Extrae datos y delega| Services[Services Layer]
    Services -->|Ejecuta lógica de negocio| Repositories[Repositories Layer]
    Repositories -->|Queries SQL| DB[(PostgreSQL Database)]
    
    Scheduler[Cron Job Scheduler] -->|Cada minuto trigger| Services
```

### Capas de la Aplicación

1. **Capa de Rutas (`routes/`)**:
   Define los endpoints HTTP expuestos por la aplicación y asocia cada uno con su respectivo controlador.
2. **Capa de Controladores (`controllers/`)**:
   Se encarga de interactuar con el protocolo HTTP. Recibe el request, extrae los parámetros/body, valida el formato básico de los datos y delega la ejecución al servicio correspondiente. Finalmente, formatea y retorna la respuesta HTTP (`200 OK`, `201 Created`, `400 Bad Request`, etc.).
3. **Capa de Servicios (`services/`)**:
   Contiene la **lógica de negocio** pura de la aplicación. Es la capa responsable de tomar decisiones, procesar y transformar datos, y orquestar las llamadas a los repositorios.
4. **Capa de Repositorios (`repositories/`)**:
   Abstrae la base de datos. Es la única capa que conoce las sentencias SQL y se comunica directamente con PostgreSQL para realizar operaciones CRUD (Create, Read, Update, Delete).
5. **Capa de Modelos (`models/`)**:
   Define las interfaces de TypeScript que representan las entidades del negocio (ej. `Post`).

---

## 📂 Estructura del Proyecto

A continuación se detalla la organización del código fuente dentro del directorio `backend`:

```text
backend/
├── src/
│   ├── app.ts                 # Configuración principal de la aplicación Express
│   ├── server.ts              # Punto de entrada del servidor y arranque de servicios
│   ├── config/
│   │   └── env.ts             # Carga y validación de variables de entorno
│   ├── controllers/
│   │   └── post.controller.ts # Controladores HTTP para la gestión de Posts
│   ├── database/
│   │   └── postgres.ts        # Inicialización del Pool de PostgreSQL y creación de tablas
│   ├── jobs/
│   │   └── scheduler.job.ts   # Definición del Cron Job (Node-Cron) ejecutado en background
│   ├── middlewares/
│   │   └── auth.middleware.ts # Middleware para autenticación por API Key
│   ├── models/
│   │   └── post.model.ts      # Definición de la interfaz de la entidad Post
│   ├── repositories/
│   │   └── post.repository.ts # Operaciones SQL directas contra PostgreSQL
│   ├── routes/
│   │   └── post.routes.ts     # Mapeo de rutas a controladores de posts
│   ├── services/
│   │   └── post.service.ts    # Lógica de negocio y motor de publicación
│   └── utils/                 # Directorio destinado a utilidades generales
├── tsconfig.json              # Configuración de compilación de TypeScript
├── package.json               # Dependencias y scripts del proyecto
└── .env.example               # Plantilla de variables de entorno
```

---

## ⚙️ Tecnologías Utilizadas

- **Runtime**: Node.js (v20+)
- **Lenguaje**: TypeScript
- **Framework Web**: Express.js
- **Base de Datos**: PostgreSQL
- **Conector DB**: `pg` (Node-Postgres)
- **Ejecución en Background**: `node-cron`
- **Variables de Entorno**: `dotenv`
- **Herramienta de Desarrollo**: `ts-node-dev` (para reinicio automático en cambios)

---

## 🗄️ Modelo de Datos (Base de Datos)

El motor de base de datos utilizado es **PostgreSQL**. La tabla principal es `posts`, la cual se crea automáticamente al iniciar el servidor si no existe (`CREATE TABLE IF NOT EXISTS`):

### Estructura de la Tabla `posts`

| Campo | Tipo SQL | Descripción |
| :--- | :--- | :--- |
| `id` | `SERIAL` (PK) | Identificador único autoincrementable. |
| `title` | `TEXT NOT NULL` | Título del post. |
| `text` | `TEXT` | Contenido principal del post. |
| `image` | `TEXT` | URL o path de la imagen asociada al post. |
| `schedule_days`| `VARCHAR(50)` | Días de la semana programados en formato string separado por comas (ej: `'1,3,5'`). |
| `schedule_time`| `VARCHAR(10)` | Hora de publicación programada en formato de 24 horas `HH:MM` (ej: `'14:30'`). |
| `last_posted` | `TIMESTAMP` | Marca de tiempo que registra cuándo se publicó por última vez este post. Evita duplicados diarios. |
| `active` | `BOOLEAN` | Indica si el post está activo para ser procesado por el programador (por defecto `true`). |
| `created_at` | `TIMESTAMP` | Fecha de creación del registro (por defecto `NOW()`). |

> [!NOTE]
> En la capa de desarrollo de TypeScript, el repositorio mapea de manera transparente el campo `schedule_days` de tipo `VARCHAR` a un arreglo de números (`number[]`), facilitando su uso en la lógica del negocio.
> Los números representan los días de la semana: `0` (Domingo) a `6` (Sábado).

---

## 📡 API Endpoints (Documentación)

El prefijo base para todos los endpoints de publicaciones es `/api/posts`.

### 1. Crear una Publicación
* **Método**: `POST`
* **Ruta**: `/api/posts`
* **Body esperado (`application/json`)**:
  ```json
  {
    "title": "Gran Lanzamiento de Producto",
    "text": "Estamos emocionados de presentar nuestro nuevo servicio...",
    "image": "https://midominio.com/assets/banner.jpg",
    "schedule_days": [1, 3, 5],
    "schedule_time": "09:00",
    "active": true
  }
  ```
* **Respuesta Exitosa (`201 Created`)**:
  ```json
  {
    "ok": true,
    "post": {
      "id": 1,
      "title": "Gran Lanzamiento de Producto",
      "text": "Estamos emocionados de presentar nuestro nuevo servicio...",
      "image": "https://midominio.com/assets/banner.jpg",
      "schedule_days": [1, 3, 5],
      "schedule_time": "09:00",
      "active": true,
      "created_at": "2026-05-30T03:00:00.000Z"
    }
  }
  ```

### 2. Obtener Todas las Publicaciones
* **Método**: `GET`
* **Ruta**: `/api/posts`
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "ok": true,
    "posts": [
      {
        "id": 1,
        "title": "Gran Lanzamiento de Producto",
        ...
      }
    ]
  }
  ```

### 3. Obtener Publicación por ID
* **Método**: `GET`
* **Ruta**: `/api/posts/:id`
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "ok": true,
    "post": {
      "id": 1,
      "title": "Gran Lanzamiento de Producto",
      ...
    }
  }
  ```
* **Respuesta Errónea (`404 Not Found`)**:
  ```json
  {
    "ok": false,
    "message": "Post with ID 999 not found"
  }
  ```

### 4. Actualizar Publicación
* **Método**: `PUT`
* **Ruta**: `/api/posts/:id`
* **Body parcial (`application/json`)**:
  ```json
  {
    "schedule_time": "10:30",
    "active": false
  }
  ```
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "ok": true,
    "post": {
      "id": 1,
      "title": "Gran Lanzamiento de Producto",
      "schedule_time": "10:30",
      "active": false,
      ...
    }
  }
  ```

### 5. Eliminar Publicación
* **Método**: `DELETE`
* **Ruta**: `/api/posts/:id`
* **Respuesta Exitosa (`200 OK`)**:
  ```json
  {
    "ok": true,
    "message": "Post deleted successfully"
  }
  ```

---

## 🤖 Publicador y Calendarización (Background Jobs)

La API cuenta con un motor integrado de ejecución en segundo plano que funciona de la siguiente manera:

1. **Cron Job (`scheduler.job.ts`)**: Se ejecuta cada minuto (`* * * * *`) e invoca a `postService.processPendingPosts()`.
2. **Filtrado Activo**: El servicio busca los posts que cumplan con los siguientes criterios concurrentemente:
   - Que estén marcados como activos (`active = true`).
   - Que tengan configurados los campos `schedule_days` y `schedule_time`.
3. **Cálculo Temporal**:
   - Compara el día actual (de 0 a 6) con el arreglo `schedule_days`.
   - Compara la hora y minuto actuales (`HH:MM`) con la propiedad `schedule_time`.
   - **Protección contra duplicados**: Valida el campo `last_posted`. Si el post ya fue publicado en el día en curso (mismo año, mes y día), el sistema lo ignora para evitar publicaciones repetidas en la misma ventana de tiempo de un minuto.
4. **Lanzamiento (`publishPost`)**: Si pasa todas las validaciones, se ejecuta la publicación (donde se integraría la lógica para APIs de Twitter, Facebook, etc.) y se actualiza de forma automática el campo `last_posted` en la base de datos con la marca de tiempo actual.

---

## 🔒 Seguridad y Middlewares

La aplicación tiene un middleware de seguridad listo para su uso:

* **Auth Middleware (`auth.middleware.ts`)**:
  Verifica que las peticiones entrantes incluyan la cabecera `x-api-key`. Compara este valor con el token configurado en la variable de entorno `API_KEY`.
  Si la cabecera no está presente o no coincide, el servidor bloquea la petición inmediatamente respondiendo con un error `401 Unauthorized`.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos

- Tener instalado **Node.js** (v20 o superior).
- Contar con una base de datos **PostgreSQL** activa y accesible.

### Configuración del Entorno

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Crea una copia del archivo de ejemplo y configúralo con tus credenciales:
   ```bash
   cp .env.example .env
   ```
3. Edita el archivo `.env` configurando los valores requeridos:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_de_datos?sslmode=require
   API_KEY=tu_clave_secreta_aqui
   ```

### Comandos de Desarrollo y Producción

* **Instalar dependencias**:
  ```bash
  npm install
  ```
* **Correr en desarrollo (con Live Reload)**:
  ```bash
  npm run dev
  ```
* **Compilar para producción (TypeScript a JavaScript)**:
  ```bash
  npm run build
  ```
* **Iniciar en producción**:
  ```bash
  npm run start
  ```

---

## 📄 Licencia

Este proyecto está bajo una licencia propietaria privada. Para más detalles, consulta el archivo [LICENSE](./LICENSE) adjunto en la raíz del proyecto.
