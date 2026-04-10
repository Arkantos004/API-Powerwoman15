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

## 🔐 Autenticación

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
│   └── database.ts          # Configuración de BD
├── controllers/
│   ├── userController.ts    # Lógica de usuarios
│   ├── productController.ts # Lógica de productos
│   └── orderController.ts   # Lógica de órdenes
├── middleware/
│   └── auth.ts              # Autenticación JWT
├── routes/
│   ├── userRoutes.ts        # Rutas de usuarios
│   ├── productRoutes.ts     # Rutas de productos
│   └── orderRoutes.ts       # Rutas de órdenes
├── types/
│   └── index.ts             # Interfaces TypeScript
└── index.ts                 # Entrada principal
```

---

## 📞 Soporte

Para preguntas o problemas, abre un issue en el repositorio.
