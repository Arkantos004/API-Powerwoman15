# API POWERWOMAN 15

API REST para la plataforma e-commerce POWERWOMAN con cursos y tienda de belleza.

## 🚀 Inicio rápido

### Instalación

```bash
npm install
```

### Configuración

Copia `.env.example` a `.env` y ajusta los valores:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/powerwoman_db
PORT=5000
JWT_SECRET=tu_clave_secreta
CORS_ORIGIN=http://localhost:3000
```

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Producción

```bash
npm run build
npm start
```

## 📚 Documentación de Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## 👤 USUARIOS

### Registrar
```
POST /users/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "full_name": "Juan Pérez",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": { "id": 1, "email": "...", "full_name": "...", "is_admin": false },
    "token": "eyJhbGc..."
  }
}
```

### Login
```
POST /users/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Obtener Perfil
```
GET /users/profile
Authorization: Bearer <token>
```

### Actualizar Perfil
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Juan García",
  "phone": "+573151234567",
  "address": "Calle 10 #20-30",
  "city": "Bogotá",
  "country": "Colombia",
  "postal_code": "110221"
}
```

### Obtener Todos los Usuarios (Admin)
```
GET /users/all
Authorization: Bearer <token>
```

---

## 📦 PRODUCTOS

### Obtener Todos los Productos
```
GET /products
GET /products?category=Maquillaje
GET /products?available=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Paleta de Sombras Profesional",
      "category": "Maquillaje",
      "price_cop": 89000,
      "stock_quantity": 50,
      "is_available": true
    }
  ]
}
```

### Obtener un Producto
```
GET /products/:id
```

### Obtener Categorías
```
GET /products/categories
```

### Crear Producto (Admin)
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Base Líquida Premium",
  "description": "Base de larga duración con SPF 30",
  "category": "Maquillaje",
  "price_cop": 65000,
  "stock_quantity": 100,
  "image_url": "https://..."
}
```

### Actualizar Producto (Admin)
```
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price_cop": 55000,
  "stock_quantity": 80,
  "is_available": true
}
```

### Eliminar Producto (Admin)
```
DELETE /products/:id
Authorization: Bearer <token>
```

---

## 🛒 ÓRDENES

### Obtener Mis Órdenes
```
GET /orders
Authorization: Bearer <token>
```

### Obtener Una Orden
```
GET /orders/:id
Authorization: Bearer <token>
```

### Crear Orden
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 5,
      "quantity": 1
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id": 1,
    "order_number": "ORD-1712900000000-ABC123XYZ",
    "user_id": 1,
    "subtotal_cop": 243000,
    "tax_cop": 46170,
    "total_cop": 289170,
    "status": "pending"
  }
}
```

### Actualizar Estado de Orden (Admin)
```
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

Estados válidos: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

### Obtener Todas las Órdenes (Admin)
```
GET /orders/admin/all
Authorization: Bearer <token>
```

---

## � FACTURAS

### Obtener Mis Facturas
```
GET /invoices
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "invoice_number": "FAC-2026-00001",
      "user_id": 1,
      "pdf_path": "/uploads/invoices/inv_1.pdf",
      "status": "paid",
      "created_at": "2026-05-29T10:30:00Z"
    }
  ]
}
```

### Obtener Una Factura
```
GET /invoices/:id
Authorization: Bearer <token>
```

### Obtener Factura por Orden
```
GET /invoices/order/:orderId
Authorization: Bearer <token>
```

### Actualizar Estado de Factura
```
PATCH /invoices/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "paid"
}
```

Estados válidos: `pending`, `paid`, `refunded`

---

## 🧑‍🏫 INSTRUCTOR REQUESTS

### Solicitar ser Instructor
```
POST /users/request-instructor
Authorization: Bearer <token>
Content-Type: application/json

{
  "expertise_areas": "Maquillaje, Skincare",
  "portfolio_url": "https://portfolio.com",
  "years_experience": 5
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Solicitud de instructora registrada. El admin la revisará pronto.",
  "data": {
    "id": 1,
    "is_instructor": true,
    "instructor_approved": false,
    "expertise_areas": "Maquillaje, Skincare"
  }
}
```

### Obtener Solicitudes de Instructor (Admin)
```
GET /users/instructor-requests
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "email": "instructora@example.com",
      "full_name": "María López",
      "expertise_areas": "Maquillaje profesional",
      "portfolio_url": "https://...",
      "years_experience": 7,
      "instructor_request_date": "2026-05-28T15:45:00Z"
    }
  ]
}
```

### Aprobar Instructor (Admin)
```
PATCH /users/:userId/approve-instructor
Authorization: Bearer <token>
```

### Rechazar Instructor (Admin)
```
PATCH /users/:userId/reject-instructor
Authorization: Bearer <token>
```

---

## 💬 COMUNIDAD (Posts)

### Obtener Todos los Posts
```
GET /posts
Authorization: Bearer <token> (opcional)
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "content": "¡Nuevo tutorial de makeup! 💄",
      "full_name": "Laura García",
      "profile_image_url": "https://...",
      "likes_count": 24,
      "comments_count": 5,
      "is_liked_by_user": false,
      "created_at": "2026-05-29T08:00:00Z"
    }
  ]
}
```

### Obtener Un Post
```
GET /posts/:id
Authorization: Bearer <token> (opcional)
```

### Crear Post
```
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Mi experiencia con el nuevo curso de skincare fue increíble! 🌟"
}
```

**Validaciones:**
- Contenido no puede estar vacío
- Máximo 5000 caracteres

### Actualizar Post
```
PUT /posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Contenido actualizado..."
}
```

### Eliminar Post
```
DELETE /posts/:id
Authorization: Bearer <token>
```

### Dar Like a Post
```
POST /posts/:id/like
Authorization: Bearer <token>
```

### Quitar Like de Post
```
DELETE /posts/:id/like
Authorization: Bearer <token>
```

### Crear Comentario en Post
```
POST /posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "¡Excelente post! 👍"
}
```

**Validaciones:**
- Contenido no puede estar vacío
- Máximo 2000 caracteres

### Obtener Comentarios del Post
```
GET /posts/:id/comments
Authorization: Bearer <token> (opcional)
```

### Eliminar Comentario
```
DELETE /posts/:postId/comments/:commentId
Authorization: Bearer <token>
```

---

## ⭐ RESEÑAS Y COMENTARIOS

### Obtener Comentarios de Curso
```
GET /courses/:courseId/comments
Authorization: Bearer <token> (opcional)
```

### Crear Comentario en Curso
```
POST /courses/:courseId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excelente curso, aprendí mucho!"
}
```

### Eliminar Comentario de Curso
```
DELETE /courses/:courseId/comments/:commentId
Authorization: Bearer <token>
```

### Obtener Comentarios de Producto
```
GET /products/:productId/comments
Authorization: Bearer <token> (opcional)
```

### Crear Comentario en Producto
```
POST /products/:productId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excelente producto, muy recomendado!"
}
```

### Eliminar Comentario de Producto
```
DELETE /products/:productId/comments/:commentId
Authorization: Bearer <token>
```

---

## 🎓 CURSOS

### Obtener Todos los Cursos Publicados
```
GET /courses
```

### Obtener Mis Cursos (Instructor)
```
GET /courses/instructor/my-courses
Authorization: Bearer <token>
```

### Obtener Un Curso
```
GET /courses/:courseId
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Maquillaje Profesional Avanzado",
    "description": "Aprende técnicas de maquillaje profesional...",
    "instructor_id": 5,
    "full_name": "María López",
    "price_cop": 150000,
    "duration_hours": 20,
    "level": "Avanzado",
    "is_published": true,
    "modules": [
      {
        "id": 1,
        "order_number": 1,
        "title": "Fundamentos",
        "description": "Conceptos básicos",
        "lessons": [
          {
            "id": 1,
            "order_number": 1,
            "title": "Introducción",
            "description": "Bienvenida al curso",
            "video_url": "https://...",
            "duration_minutes": 15
          }
        ]
      }
    ]
  }
}
```

### Crear Curso (Instructor)
```
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Skincare para Principiantes",
  "description": "Aprende a cuidar tu piel desde cero",
  "price_cop": 89000,
  "duration_hours": 10,
  "level": "Principiante"
}
```

### Actualizar Curso (Instructor)
```
PUT /courses/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Skincare Avanzado",
  "price_cop": 129000
}
```

### Publicar Curso (Instructor)
```
PATCH /courses/:courseId/publish
Authorization: Bearer <token>
```

### Eliminar Curso (Instructor)
```
DELETE /courses/:courseId
Authorization: Bearer <token>
```

### Crear Módulo
```
POST /courses/:courseId/modules
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Módulo 1: Fundamentos",
  "description": "Conceptos básicos",
  "order_number": 1
}
```

### Actualizar Módulo
```
PUT /courses/:courseId/modules/:moduleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Módulo 1: Fundamentos Actualizado",
  "order_number": 1
}
```

### Eliminar Módulo
```
DELETE /courses/:courseId/modules/:moduleId
Authorization: Bearer <token>
```

### Crear Lección
```
POST /courses/:courseId/modules/:moduleId/lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lección 1: Introducción",
  "description": "Bienvenida al módulo",
  "video_url": "https://youtube.com/watch?v=...",
  "duration_minutes": 15,
  "order_number": 1
}
```

### Actualizar Lección
```
PUT /courses/:courseId/modules/:moduleId/lessons/:lessonId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lección 1: Intro Actualizada",
  "duration_minutes": 20
}
```

### Eliminar Lección
```
DELETE /courses/:courseId/modules/:moduleId/lessons/:lessonId
Authorization: Bearer <token>
```

### Obtener Progreso en Curso
```
GET /courses/:courseId/progress
Authorization: Bearer <token>
```

### Marcar Lección como Completada
```
POST /courses/:courseId/lessons/:lessonId/complete
Authorization: Bearer <token>
```

---

## ⚙️ CONFIGURACIÓN DEL SITIO

### Obtener Todas las Configuraciones
```
GET /settings
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "hero_video_url": "https://youtube.com/embed/...",
    "site_name": "Powerwoman15",
    "tax_percentage": 19,
    "logo_url": "https://...",
    "footer_text": "© 2026 Powerwoman15"
  }
}
```

### Obtener Una Configuración
```
GET /settings/:key
```

Ejemplo:
```
GET /settings/tax_percentage
```

### Actualizar Configuración (Admin)
```
PUT /settings/:key
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "https://youtube.com/embed/..."
}
```

Ejemplos de keys:
- `hero_video_url` - URL del video principal
- `site_name` - Nombre del sitio
- `tax_percentage` - Porcentaje de impuesto
- `logo_url` - URL del logo
- `footer_text` - Texto del pie de página

---

## �🔐 Autenticación

La API utiliza JWT (JSON Web Tokens). Todos los endpoints protegidos requieren:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login o registrarse.

---

## 💱 Precios en Pesos Colombianos (COP)

Todos los precios se manejan en pesos colombianos:
- 1 precio = 1 peso colombiano
- No usar decimales
- Ejemplo: 89.000 COP = `89000`

---

## ✅ Códigos de Respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Solicitud inválida |
| 401 | No autorizado |
| 404 | No encontrado |
| 409 | Conflicto (ej: email duplicado) |
| 500 | Error del servidor |

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install
```

### Error: "DATABASE_URL no está definida"
- Verifica que `.env` existe
- Asegúrate de que `DATABASE_URL` está configurada correctamente

### Error de conexión a PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Verifica que PostgreSQL está corriendo
- Revisa las credenciales en `.env`

---

## 📝 Estructura del Proyecto

```
src/
├── config/
│   └── database.ts                # Configuración de PostgreSQL
├── controllers/
│   ├── userController.ts          # Gestión de usuarios y auth
│   ├── productController.ts       # Gestión de productos (tienda)
│   ├── orderController.ts         # Gestión de órdenes y compras ⭐
│   ├── invoiceController.ts       # Gestión de facturas
│   ├── communityController.ts     # Posts, comentarios, likes
│   ├── reviewController.ts        # Reseñas y comentarios
│   └── settingsController.ts      # Configuración del sitio
├── middleware/
│   └── auth.ts                    # Autenticación JWT
├── routes/
│   ├── userRoutes.ts              # Rutas: POST /register, POST /login, etc.
│   ├── productRoutes.ts           # Rutas: GET /products, POST /products, etc.
│   ├── orderRoutes.ts             # Rutas: GET /orders, POST /orders, etc.
│   ├── invoiceRoutes.ts           # Rutas: GET /invoices, etc.
│   ├── communityRoutes.ts         # Rutas: GET /posts, POST /posts, etc.
│   ├── reviewRoutes.ts            # Rutas: comentarios de cursos/productos
│   ├── settingsRoutes.ts          # Rutas: GET /settings, PUT /settings/:key
│   ├── courseRoutes.ts            # Rutas: cursos (handlers inline)
│   ├── courseModuleRoutes.ts      # Rutas: módulos de cursos
│   ├── courseLessonRoutes.ts      # Rutas: lecciones de cursos
│   └── uploadRoutes.ts            # Rutas: subida de archivos
├── services/
│   └── invoiceService.ts          # Generación de PDFs de facturas
├── types/
│   └── index.ts                   # Interfaces TypeScript
└── index.ts                       # Entrada principal (Express setup)
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Capas Arquitectónicas

La API está organizada en **6 capas**:

```
CLIENT (Next.js Frontend)
    ↓ HTTP JSON
ROUTES (Express Router)
    ↓
MIDDLEWARE (JWT Auth, Validation)
    ↓
CONTROLLERS (Business Logic)
    ↓
SERVICES (Specialized Functions)
    ↓
DATABASE (PostgreSQL)
```

### Controllers Disponibles

| Controller | Propósito | Métodos |
|-----------|----------|---------|
| **userController** | Usuarios, autenticación, instructor requests | 8 |
| **productController** | Productos de la tienda | 6 |
| **orderController** | Órdenes y compras ⭐ | 4 |
| **invoiceController** | Facturas automáticas | 4 |
| **communityController** | Posts, comentarios, likes | 10+ |
| **reviewController** | Comentarios en cursos/productos | 6 |
| **settingsController** | Configuración global | 3 |

### Características Clave

✅ **CRUD Completo** - Crear, leer, actualizar, eliminar datos en todas las entidades  
✅ **Autenticación JWT** - Seguridad stateless y escalable  
✅ **Generación de Facturas** - PDFs automáticos en cada compra  
✅ **Comunidad Social** - Posts con likes y comentarios dinámicos  
✅ **Sistema de Cursos** - Jerarquía: Cursos → Módulos → Lecciones  
✅ **Instructor Requests** - Flujo de aprobación para instructores  
✅ **Base de Datos Optimizada** - 13 tablas con índices y relaciones  

---

## 🎯 MÓDULOS ESPECIALES

### 1. Módulo CRUD
7 controllers que implementan operaciones CRUD estándar:
- Validación de entrada
- Query a BD
- Respuesta JSON

### 2. Módulo Dinámico - Órdenes + Facturas ⭐
Cuando un cliente compra:
1. Controller recibe items del carrito
2. Calcula subtotal, impuesto (19%), total
3. Inserta orden en BD
4. Crea items de orden
5. Reduce stock en productos
6. **Genera PDF de factura automáticamente** ← ESPECIAL
7. Retorna orden + factura

### 3. Módulo Comunidad
Posts interactivos con:
- Likes dinámicos (cuenta en tiempo real)
- Comentarios anidados
- Información del usuario (nombre, foto)

---

## 📊 ESTADÍSTICAS DEL PROYECTO

- **Controllers:** 7
- **Endpoints:** 50+
- **Tablas en BD:** 13
- **Métodos de Lógica:** 50+
- **Líneas de Código:** ~5000+

---

## 🎓 COMO ENTENDER EL CÓDIGO

1. **Empieza por** `src/index.ts` - Punto de entrada
2. **Luego lee** `src/routes/` - Define endpoints
3. **Después** `src/controllers/` - Lógica de negocio
4. **Finalmente** `src/services/` - Funciones especializadas

Todos los controllers siguen el **mismo patrón**:
```typescript
export const functionName = async (req: Request, res: Response) => {
  try {
    // 1. Validar entrada
    // 2. Query a BD
    // 3. Responder
  } catch (error) {
    // Manejo de errores
  }
};
```

---

## 📞 Soporte

Para preguntas o problemas, abre un issue en el repositorio.
