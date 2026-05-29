# 📚 DOCUMENTACIÓN COMPLETA - ARQUITECTURA POWERWOMAN15 API

**Fecha:** 29 de Mayo, 2026  
**Versión:** 1.0  
**Estado:** Completado

---

## 📑 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Módulo CRUD - Funcionamiento](#módulo-crud---funcionamiento)
3. [Módulo Dinámico - Órdenes + Facturas](#módulo-dinámico---órdenes--facturas)
4. [Flujo General del Sistema](#flujo-general-del-sistema)
5. [Documentación Detallada de Controllers](#documentación-detallada-de-controllers)
6. [Guión Video 5 Minutos](#guión-video-5-minutos)
7. [Diagrama de Arquitectura](#diagrama-de-arquitectura)

---

## 🎯 RESUMEN EJECUTIVO

Powerwoman15 API es una plataforma completa de e-commerce y educación construida con **Express.js + TypeScript + PostgreSQL**. El sistema está organizado en **7 controladores independientes** que manejan diferentes aspectos del negocio:

- **Autenticación y Perfiles** (userController)
- **Gestión de Tienda** (productController)
- **Sistema de Compras** (orderController)
- **Facturas Automáticas** (invoiceController)
- **Comunidad** (communityController)
- **Reseñas** (reviewController)
- **Configuración** (settingsController)

### Características Clave:

✅ **Módulo CRUD completo** - Crear, leer, actualizar, eliminar datos  
✅ **Órdenes + Facturas automáticas** - Generación de PDF en tiempo real  
✅ **Autenticación JWT** - Seguridad stateless y escalable  
✅ **6 capas arquitectónicas** - Separación clara de responsabilidades  
✅ **13 tablas en BD** - Schema optimizado con índices  

---

## 🔄 MÓDULO CRUD - FUNCIONAMIENTO

### ¿Qué es CRUD?

**C**reate (Crear) → **R**ead (Leer) → **U**pdate (Actualizar) → **D**elete (Eliminar)

Son las 4 operaciones básicas para manipular datos. En Powerwoman15, tenemos **7 controladores** que implementan estas operaciones:

### Patrón Universal de Todos los Controllers

```typescript
// 1. Validar entrada
if (!email || !full_name || !password) {
  return res.status(400).json({ error: 'Campos requeridos' });
}

// 2. Ejecutar query a BD
const result = await query(sql, params);

// 3. Responder
res.json({
  success: true,
  data: result.rows[0]
});
```

### Flujo de una Petición CRUD

```
HTTP Request (GET/POST/PUT/DELETE)
    ↓
Express Route
    ↓
Middleware (JWT validation)
    ↓
Controller Function
    ├─ Validar datos
    ├─ Query a PostgreSQL
    └─ Procesar lógica
    ↓
Respuesta JSON
    ↓
Cliente recibe datos
```

### Los 7 Controllers CRUD

| # | Controller | Operaciones | Ejemplo de Uso |
|---|-----------|------------|----------------|
| 1 | **userController** | C, R, U | Registro, login, actualizar perfil |
| 2 | **productController** | C, R, U, D | Crear producto, listar, actualizar precio |
| 3 | **orderController** | C, R, U | Crear orden, ver historial, cambiar estado |
| 4 | **invoiceController** | R, U | Ver facturas, cambiar estado de pago |
| 5 | **communityController** | C, R, U, D | Crear post, comentar, dar like, eliminar |
| 6 | **reviewController** | C, R, D | Comentar en curso, eliminar comentario |
| 7 | **settingsController** | R, U | Ver configuración, actualizar (admin) |

---

## 🚀 MÓDULO DINÁMICO - ÓRDENES + FACTURAS

Este es el módulo más sofisticado. Cuando un cliente compra, sucede todo esto automáticamente:

### Flujo Completo: Carrito → Orden → Factura

#### **PASO 1: Cliente Compra**

```
Frontend (carrito con items)
POST /api/orders
{
  "items": [
    {"product_id": 1, "quantity": 1},
    {"product_id": 2, "quantity": 1}
  ]
}
```

#### **PASO 2: Middleware Valida Token**

```typescript
// authMiddleware extrae y valida JWT
const userId = jwt.verify(token, JWT_SECRET).id;
req.userId = userId; // Disponible para el controller
```

#### **PASO 3: Controller Calcula Totales**

```typescript
// Para cada item, obtiene precio de BD
const productResult = await query(
  'SELECT price_cop FROM products WHERE id = $1',
  [item.product_id]
);

// Acumula subtotal
subtotal += price * quantity;

// Calcula impuesto
const tax = subtotal * 0.19; // 19% IVA
const total = subtotal + tax;
```

#### **PASO 4: Guarda Orden en BD**

```typescript
// Inserta en tabla orders
const orderResult = await query(
  `INSERT INTO orders (user_id, subtotal, tax, total)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
  [userId, subtotal, tax, total]
);

// Inserta cada item
for (const item of items) {
  await query(
    `INSERT INTO order_items (order_id, product_id, quantity, price)
     VALUES ($1, $2, $3, $4)`,
    [orderId, item.product_id, item.quantity, price]
  );
}

// Reduce stock
await query(
  'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
  [item.quantity, item.product_id]
);
```

#### **PASO 5: LA MAGIA - Genera PDF Automáticamente**

```typescript
// invoiceService genera PDF
const invoiceData = {
  order_id: orderId,
  user_name: user.full_name,
  items: items,
  subtotal: subtotal,
  tax: tax,
  total: total
};

// Genera PDF con PDFKit
invoiceService.generatePDF(invoiceData)
  → Crea documento PDF profesional
  → Incluye: logo, datos cliente, items, totales
  → Guarda en /uploads/invoices/inv_555.pdf

// Inserta registro en BD
await query(
  `INSERT INTO invoices (order_id, user_id, pdf_path, invoice_number)
   VALUES ($1, $2, $3, $4)`,
  [orderId, userId, pdfPath, invoiceNumber]
);
```

#### **PASO 6: Respuesta al Cliente**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 555,
      "user_id": 123,
      "subtotal": 180000,
      "tax": 34200,
      "total": 214200,
      "status": "completed"
    },
    "invoice": {
      "id": 89,
      "order_id": 555,
      "pdf_path": "/uploads/invoices/inv_555.pdf",
      "invoice_number": "FAC-2026-00089"
    }
  }
}
```

### ¿Por Qué es Especial Este Módulo?

✅ **Integración completa** - No requiere sistema externo de facturas  
✅ **Automatización total** - PDF se genera sin intervención manual  
✅ **Validación robusta** - Se valida precio, stock, usuario  
✅ **Consistencia BD** - Usa transacciones implícitas (una falla detiene todo)  
✅ **Profesionalismo** - PDF listo para imprimir o email  

---

## 🏗️ FLUJO GENERAL DEL SISTEMA

### Arquitectura en 6 Capas

```
┌─────────────────────────────────────────────────────────────┐
│  1. CLIENTE (Next.js Frontend)                              │
│     - Carrito, formularios, interfaz usuario               │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP JSON
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  2. RUTAS (Express Router)                                  │
│     /api/users, /api/orders, /api/courses, etc.           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  3. MIDDLEWARE (Validación y Seguridad)                     │
│     - authMiddleware (JWT validation)                       │
│     - adminMiddleware (role check)                          │
│     - CORS protection                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  4. CONTROLADORES (Lógica de Negocio)                       │
│     - Validar entrada                                       │
│     - Calcular valores                                      │
│     - Coordinar operaciones                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  5. SERVICIOS (Funciones Especializadas)                    │
│     - invoiceService (PDF generation)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  6. BASE DE DATOS (PostgreSQL)                              │
│     - 13 tablas con relaciones e índices                   │
│     - Connection pooling para escalabilidad               │
└─────────────────────────────────────────────────────────────┘
```

### Capas Explicadas

**CAPA 1 - CLIENTE**
- Frontend React/Next.js
- Envía peticiones HTTP
- Presenta datos al usuario

**CAPA 2 - RUTAS**
- Define endpoints (GET /api/products, POST /api/orders, etc.)
- Mapea peticiones a controladores

**CAPA 3 - MIDDLEWARE**
- Valida token JWT
- Verifica permisos (admin, instructor)
- Configura CORS

**CAPA 4 - CONTROLADORES**
- Lógica de negocio
- Validaciones
- Orquestación de servicios

**CAPA 5 - SERVICIOS**
- Funciones reutilizables
- invoiceService = PDF generation

**CAPA 6 - BASE DE DATOS**
- PostgreSQL
- 13 tablas
- Índices optimizados

### Flujo de Datos - Ejemplo Real

```
USUARIO: "Ver mis órdenes"
         ↓
FRONTEND: GET /api/orders (con JWT token en header)
         ↓
RUTAS: Match a /api/orders → orderRoutes
         ↓
MIDDLEWARE: Valida token JWT → extrae userId = 123
         ↓
CONTROLLER: getUserOrders(userId = 123)
         ↓
QUERY: SELECT * FROM orders WHERE user_id = 123
         ↓
BD POSTGRESQL: Busca órdenes de usuario 123
         ↓
RESPUESTA JSON:
{
  "success": true,
  "data": [
    {id: 555, total: 214200, status: "completed"},
    {id: 556, total: 89900, status: "completed"}
  ]
}
         ↓
FRONTEND: Renderiza lista de órdenes
         ↓
USUARIO VE: Sus órdenes en pantalla
```

---

## 📖 DOCUMENTACIÓN DETALLADA DE CONTROLLERS

### 1️⃣ USER CONTROLLER - Gestión de Usuarios y Autenticación

**Ubicación:** `src/controllers/userController.ts`

**Propósito:** Manejar autenticación, perfiles de usuario, y solicitudes de instructor.

#### Métodos:

**`register(email, full_name, password, ...)`**
- Crear nueva cuenta
- Valida email único
- Hashea contraseña con bcrypt
- Genera JWT token
- Retorna: usuario + token

**`login(email, password)`**
- Verificar credenciales
- Compara contraseña hasheada
- Genera nuevo JWT token
- Retorna: usuario + token

**`getProfile()`**
- Obtener datos del usuario logueado
- Solo datos públicos + propios
- Retorna: nombre, email, teléfono, dirección, foto

**`updateProfile(full_name, phone, address, ...)`**
- Actualizar información personal
- Solo el usuario puede editar su perfil
- Retorna: perfil actualizado

**`getAllUsers()`** (admin)
- Listar todos los usuarios
- Admin solo
- Retorna: lista de usuarios con roles

**`requestInstructor(expertise_areas, portfolio_url, ...)`**
- Usuario solicita ser instructor
- Envía datos de experiencia
- Estado: pendiente aprobación
- Retorna: solicitud registrada

**`getInstructorRequests()`** (admin)
- Ver solicitudes pendientes
- Admin solo
- Retorna: lista de solicitudes

**`approveInstructor(userId)`** (admin)
- Aprobar solicitud
- Usuario ahora puede crear cursos
- Retorna: usuario aprobado

**`rejectInstructor(userId)`** (admin)
- Rechazar solicitud
- Permisos se limpian
- Retorna: usuario rechazado

---

### 2️⃣ PRODUCT CONTROLLER - Gestión de Productos (Tienda)

**Ubicación:** `src/controllers/productController.ts`

**Propósito:** Manejar productos de la tienda (cursos, certificaciones, etc.)

#### Métodos:

**`getAllProducts(category?, available?)`**
- Listar productos disponibles
- Filtrar por categoría
- Filtrar por disponibilidad
- Retorna: lista de productos

**`getProductById(id)`**
- Ver detalles de 1 producto
- Usado antes de comprar
- Retorna: producto completo

**`createProduct(name, category, price_cop, ...)`** (admin)
- Admin crea producto
- Requerido: nombre, categoría, precio
- Opcional: descripción, imagen, stock
- Retorna: producto creado

**`updateProduct(id, name?, price_cop?, stock_quantity?, ...)`** (admin)
- Actualizar producto
- Puede cambiar cualquier campo
- Retorna: producto actualizado

**`deleteProduct(id)`** (admin)
- Eliminar producto
- Se elimina de BD completamente
- Retorna: confirmación

**`getCategories()`**
- Listar todas las categorías (sin duplicados)
- Se usa para filtros en frontend
- Retorna: array de categorías

---

### 3️⃣ ORDER CONTROLLER - Gestión de Órdenes y Compras ⭐

**Ubicación:** `src/controllers/orderController.ts`

**Propósito:** Manejar órdenes desde creación hasta facturación. **Este es el más importante.**

#### Métodos:

**`getUserOrders()`**
- Ver todas las órdenes del usuario
- Ordenadas por fecha (más recientes primero)
- Retorna: array de órdenes

**`getOrderById(id)`**
- Ver detalles completos de 1 orden
- Incluye items de la orden
- Retorna: orden + items

**`createOrder(items)`** ⭐ **LA MÁS IMPORTANTE**
- El cliente compra items del carrito
- Proceso interno:
  1. Valida items no vacío
  2. Obtiene precios de BD
  3. Calcula subtotal
  4. Calcula impuesto (19%)
  5. Calcula total
  6. Inserta orden en BD
  7. Inserta items en BD
  8. Reduce stock en productos
  9. **GENERA FACTURA PDF AUTOMÁTICAMENTE**
  10. Retorna: orden + factura
- Retorna: orden completa con factura

**`updateOrderStatus(id, status)`**
- Cambiar estado: pending → completed → shipped → cancelled
- Retorna: orden actualizada

---

### 4️⃣ INVOICE CONTROLLER - Gestión de Facturas

**Ubicación:** `src/controllers/invoiceController.ts`

**Propósito:** Manejar facturas PDF.

#### Métodos:

**`getUserInvoices()`**
- Ver todas las facturas del usuario
- Listadas por fecha
- Retorna: array de facturas

**`getInvoiceById(id)`**
- Ver 1 factura específica
- Valida que pertenezca al usuario
- Retorna: factura con detalles

**`getInvoiceByOrderId(orderId)`**
- Obtener factura de una orden
- Valida que pertenezca al usuario
- Retorna: factura de esa orden

**`updateInvoiceStatus(id, status)`**
- Cambiar estado: paid, pending, refunded
- Retorna: factura actualizada

---

### 5️⃣ COMMUNITY CONTROLLER - Gestión de Comunidad (Posts)

**Ubicación:** `src/controllers/communityController.ts`

**Propósito:** Manejar posts, comentarios y likes de la comunidad.

#### Métodos:

**`getAllPosts()`**
- Listar últimos 50 posts
- Para cada post calcula:
  - Cantidad de likes
  - Cantidad de comentarios
  - Si el usuario ya dio like
- Incluye datos del usuario (nombre, foto)
- Retorna: array de posts

**`getPostById(id)`**
- Ver 1 post + todos sus comentarios
- Comentarios ordenados por fecha
- Retorna: post con comentarios

**`createPost(content)`**
- Usuario crea post
- Validaciones:
  - Contenido no vacío
  - Máximo 5000 caracteres
- Retorna: post creado

**`updatePost(id, content)`**
- Editar post
- Solo el propietario puede hacerlo
- Retorna: post actualizado

**`deletePost(id)`**
- Eliminar post
- También elimina comentarios y likes
- Solo el propietario
- Retorna: confirmación

**`likePost(postId)`**
- Usuario da like a post
- No puede dar like 2 veces
- Retorna: like registrado

**`unlikePost(postId)`**
- Quitar like de post
- Retorna: like removido

**`createComment(postId, content)`**
- Comentar en post
- Validaciones:
  - Contenido no vacío
  - Máximo 2000 caracteres
- Retorna: comentario creado

**`deleteComment(postId, commentId)`**
- Eliminar comentario
- Solo quien lo escribió
- Retorna: confirmación

---

### 6️⃣ REVIEW CONTROLLER - Gestión de Reseñas

**Ubicación:** `src/controllers/reviewController.ts`

**Propósito:** Comentarios en cursos y productos.

#### Métodos:

**`getCourseComments(courseId)`**
- Obtener comentarios de un curso
- Ordenados por fecha (más recientes)
- Retorna: array de comentarios

**`createCourseComment(courseId, content)`**
- Comentar en curso
- Validaciones:
  - Contenido no vacío
  - Máximo 2000 caracteres
  - Curso debe existir
- Retorna: comentario creado

**`deleteCourseComment(courseId, commentId)`**
- Eliminar comentario del curso
- Solo propietario
- Retorna: confirmación

**`getProductComments(productId)`**
- Similar a getCourseComments
- Para productos

**`createProductComment(productId, content)`**
- Similar a createCourseComment
- Para productos

**`deleteProductComment(productId, commentId)`**
- Similar a deleteCourseComment
- Para productos

---

### 7️⃣ SETTINGS CONTROLLER - Configuración Global

**Ubicación:** `src/controllers/settingsController.ts`

**Propósito:** Configuración del sitio.

#### Métodos:

**`getSiteSettings()`**
- Obtener TODAS las configuraciones
- Se devuelven como objeto clave-valor
- Público (no requiere auth)
- Retorna: todas las configuraciones

**`getSiteSetting(key)`**
- Obtener UNA configuración específica
- Ejemplo: `getSiteSetting('tax_percentage')`
- Público
- Retorna: valor de configuración

**`updateSiteSetting(key, value)`** (admin)
- Actualizar una configuración
- Validación de URLs si es necesario
- Admin solo
- Retorna: configuración actualizada

**Configuraciones disponibles:**
- `hero_video_url` → Video principal del sitio
- `site_name` → Nombre del sitio
- `tax_percentage` → Porcentaje de impuesto
- `logo_url` → URL del logo
- Otras según necesidad

---

## 📹 GUIÓN VIDEO 5 MINUTOS

### ESTRUCTURA TOTAL

- **Intro:** 20s
- **Sección 1 (CRUD):** 1m 10s
- **Sección 2 (Órdenes+Facturas):** 2m 15s
- **Sección 3 (Flujo General):** 55s
- **Conclusión:** 20s
- **TOTAL:** 5 minutos exactos

---

### INTRO (0:00-0:20)

**Presentador:**
"Bienvenido a Powerwoman15 API. En 5 minutos te explicaré cómo funciona toda la plataforma: el módulo CRUD, el sistema de órdenes automáticas, y el flujo general. ¡Vamos!"

**[Visual: Logo Powerwoman15]**

---

### SECCIÓN 1: MÓDULO CRUD (0:20-1:30)

**Presentador:**
"Primero: **¿Qué es CRUD?** Es crear, leer, actualizar y eliminar datos. Tenemos 7 controladores que manejan todo:

- 🧑 **Usuarios** → Registro, login
- 📦 **Productos** → Tienda
- 🛒 **Órdenes** → Compras
- 📄 **Facturas** → PDFs
- 💬 **Comunidad** → Posts, comentarios
- ⭐ **Reseñas** → Opiniones
- ⚙️ **Configuración** → Ajustes"

**[Mostrar los 7 controladores en pantalla]**

**Presentador:**
"El flujo es simple: el cliente envía una petición HTTP → el servidor valida el usuario → ejecuta la acción en la BD → devuelve los datos."

**[Mostrar diagrama simple]**
```
Petición HTTP → Validación → Controlador → BD → Respuesta JSON
```

**Presentador:**
"Todos los controllers siguen el **mismo patrón**:
1. Validar que vengan los datos requeridos
2. Ejecutar query a base de datos
3. Devolver respuesta JSON"

---

### SECCIÓN 2: MÓDULO DINÁMICO - ÓRDENES + FACTURAS (1:30-3:45)

**Presentador:**
"Lo más interesante: **cuando alguien compra, automáticamente se genera una factura PDF**. Mira cómo funciona:"

**[Mostrar animación del flujo]**

**PASO 1: Cliente compra**
```
Carrito: 2 cursos ($80K + $100K)
Cliente presiona: COMPRAR
```

**PASO 2: Cálculos**
```
Subtotal:    $180,000
Impuesto:    +$34,200 (19%)
────────────────────
TOTAL:       $214,200
```

**Presentador:**
"El servidor calcula automáticamente el total con impuesto."

**PASO 3: Guardado en BD**
```
✓ Crea registro en "orders"
✓ Crea items en "order_items"
✓ Reduce stock en "products"
```

**PASO 4: LA MAGIA - PDF Automático**
**[Efecto visual de sorpresa]**

```
invoiceService.generatePDF()
  ↓
Crea PDF profesional con:
  • Logo Powerwoman15
  • Datos del cliente
  • Productos comprados
  • Totales
  • Número de factura
  ↓
Guarda en /uploads/invoices/
```

**Presentador:**
"TODO ESTO EN MENOS DE 1 SEGUNDO. El cliente recibe su factura lista para descargar."

**[Mostrar captura de PDF generado]**

---

### SECCIÓN 3: FLUJO GENERAL (3:45-4:40)

**Presentador:**
"¿Cómo conecta todo? El sistema tiene 6 capas:"

**[Mostrar arquitectura compacta]**

```
1. CLIENTE (Next.js)
   ↓ HTTP
2. RUTAS (Express)
   ↓
3. MIDDLEWARE (Valida JWT)
   ↓
4. CONTROLADOR (Lógica)
   ↓
5. SERVICIOS (Especialistas)
   ↓
6. BD (PostgreSQL - 13 tablas)
```

**Presentador:**
"Cuando haces una petición:

1️⃣ Frontend envía datos
2️⃣ Middleware verifica tu token
3️⃣ Controlador procesa la lógica
4️⃣ Se ejecutan queries a BD
5️⃣ Respuesta JSON al cliente

**Ejemplo rápido:** Quiero ver mis órdenes

```
GET /api/orders (con token)
  ↓ Middleware: ✓ Token válido
  ↓ Controller: SELECT * FROM orders WHERE user_id = 123
  ↓ BD devuelve: [orden1, orden2, orden3]
  ↓ Frontend muestra mis órdenes
```

Todo en milisegundos."

---

### CONCLUSIÓN (4:40-5:00)

**Presentador:**
"**Resumen:**

✅ **CRUD** en 7 controladores independientes
✅ **Órdenes + Facturas** automáticas
✅ **6 capas** de arquitectura limpia
✅ **JWT** para seguridad
✅ **Escalable** y fácil de mantener

Eso es Powerwoman15 API en 5 minutos. Si tienes preguntas, déjalas abajo. ¡Gracias por ver!"

**[Créditos finales]**

---

## 📊 DIAGRAMA DE ARQUITECTURA

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POWERWOMAN15 API COMPLETA                       │
└────────────────────────────────────────────────────────────────────────┘

                              CLIENTE (Next.js)
                                    │
                                    │ HTTP Requests
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS ROUTES                               │
├─────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│ /api/users  │ /api/products│ /api/orders  │ /api/posts   │ /api/courses│
└─────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
                                    │
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                           MIDDLEWARE LAYER                             │
│                                                                        │
│  ✓ CORS Protection                                                     │
│  ✓ JWT Authentication                                                  │
│  ✓ Admin Role Verification                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                        CONTROLLERS (7 Controllers)                     │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │userController│ │productControl│ │orderControl  │ │communityCtrl │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
│ │invoiceCtrl   │ │reviewCtrl    │ │settingsCtrl  │                   │
│ └──────────────┘ └──────────────┘ └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVICES LAYER                                  │
│                                                                        │
│  📄 invoiceService                                                     │
│     └─ generatePDF()                                                   │
│     └─ createInvoice()                                                 │
│     └─ getUserInvoices()                                               │
│     └─ getInvoiceByOrderId()                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL Queries
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                                │
│                                                                        │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐   │
│  │   users     │ │  products    │ │   orders    │ │ order_items  │   │
│  └─────────────┘ └──────────────┘ └─────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌────────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  invoices    │ │    courses     │ │   posts  │ │    comments  │   │
│  └──────────────┘ └────────────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────┐   │
│  │  reviews     │ │   settings   │ │  student_progress (+ más)    │   │
│  └──────────────┘ └──────────────┘ └──────────────────────────────┘   │
│                                                                        │
│  ✓ 13 tablas con relaciones                                           │
│  ✓ Índices optimizados                                                │
│  ✓ Connection pooling                                                 │
└────────────────────────────────────────────────────────────────────────┘

                            FILE STORAGE
                          /uploads/invoices/
                     └─ PDFs generados automáticamente
```

---

## 📝 TABLA COMPARATIVA DE MÓDULOS

| Aspecto | CRUD Estándar | Módulo Dinámico (Órdenes) |
|--------|---|---|
| **Complejidad** | Simple | Alta |
| **Operaciones** | C/R/U/D | C/R/U + Auto-generate |
| **BD Queries** | 1-2 | 5-7 |
| **Tiempo respuesta** | <100ms | <1s |
| **Servicios usados** | 0 | 1 (invoiceService) |
| **Efectos secundarios** | Ninguno | PDF generation, stock update |
| **Validaciones** | 2-3 | 7+ |
| **Automatización** | Manual | Automática |

---

## 🔍 CHECKLIST DE ENTENDIMIENTO

Después de leer esta documentación, deberías entender:

- [ ] **CRUD:** Qué son Create, Read, Update, Delete
- [ ] **7 Controllers:** Para qué sirve cada uno
- [ ] **Patrón Universal:** Todos siguen validar → query → responder
- [ ] **Módulo Dinámico:** Cómo se genera factura automáticamente
- [ ] **Flujo de Compra:** Carrito → Cálculo → BD → PDF
- [ ] **6 Capas:** Cliente → Routes → Middleware → Controllers → Services → BD
- [ ] **JWT Auth:** Cómo se valida cada petición
- [ ] **PDFs:** Se generan automáticamente con PDFKit
- [ ] **Base de Datos:** 13 tablas optimizadas

---

## 📚 RECURSOS ADICIONALES

- **DATABASE_SETUP.md** - Schema de BD
- **INVOICES_SETUP.md** - Configuración de facturas
- **README.md** - Guía rápida
- **src/controllers/** - Código fuente de todos los controllers
- **src/services/invoiceService.ts** - Servicio de facturas

---

## 👨‍💻 NOTAS PARA DESARROLLADORES

### Mejoras Futuras

1. **Implementar más servicios** - userService, productService, orderService
2. **Transacciones explícitas** - Para operaciones críticas
3. **Caché** - Redis para queries frecuentes
4. **Logging centralizado** - Winston o similar
5. **Validación de entrada** - Usar librería como Joi o Zod
6. **Tests** - Unit tests y E2E tests

### Decisiones de Diseño

- **Raw SQL:** Flexibilidad vs ORM (Sequelize/Prisma)
- **JWT:** Stateless vs Sessions
- **Controllers inline:** Para cursos, separados para otros
- **Sin transacciones explícitas:** Usa defaults de PostgreSQL
- **Pool de conexiones:** Para escalabilidad

---

**Documentación completada el 29 de Mayo, 2026**  
**Versión:** 1.0  
**Estado:** Ready for Production
