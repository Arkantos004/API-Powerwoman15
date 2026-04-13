# Configuración de Base de Datos - API Powerwoman

## 📋 Requisitos

- PostgreSQL 12 o superior instalado
- Node.js 18 o superior

## 🔧 Pasos de Configuración

### 1. **Crear la Base de Datos**

Abre PostgreSQL y ejecuta:

```sql
CREATE DATABASE powerwoman_db;
```

### 2. **Configurar Variables de Entorno**

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Actualiza `.env` con tu configuración:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/powerwoman_db
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta
CORS_ORIGIN=http://localhost:3000
```

### 3. **Inicializar las Tablas**

Ejecuta el script de inicialización:

```bash
npm run init-db
```

Esto creará automáticamente:
- ✅ Tabla `users` - Usuarios registrados
- ✅ Tabla `products` - Catálogo de productos
- ✅ Tabla `orders` - Órdenes de compra
- ✅ Tabla `order_items` - Items de cada orden
- ✅ Índices para optimizar queries

### 4. **Iniciar el Servidor**

```bash
npm run dev
```

## 🔗 Estructura de Base de Datos

### Tabla: users
```
id (PK)         | SERIAL
email           | VARCHAR (UNIQUE)
full_name       | VARCHAR
password_hash   | VARCHAR
is_admin        | BOOLEAN (DEFAULT: false)
created_at      | TIMESTAMP
updated_at      | TIMESTAMP
```

### Tabla: products
```
id (PK)            | SERIAL
name               | VARCHAR
description        | TEXT
category           | VARCHAR
price_cop          | DECIMAL
image_url          | VARCHAR
stock_quantity     | INTEGER (DEFAULT: 0)
is_available       | BOOLEAN (DEFAULT: true)
created_at         | TIMESTAMP
updated_at         | TIMESTAMP
```

### Tabla: orders
```
id (PK)         | SERIAL
user_id (FK)    | INTEGER
total_amount    | DECIMAL
status          | VARCHAR (DEFAULT: 'pending')
created_at      | TIMESTAMP
updated_at      | TIMESTAMP
```

### Tabla: order_items
```
id (PK)         | SERIAL
order_id (FK)   | INTEGER
product_id (FK) | INTEGER
quantity        | INTEGER
price_cop       | DECIMAL
created_at      | TIMESTAMP
```

## 🧪 Verificar Conexión

Para verificar que todo funciona correctamente:

```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{
  "status": "API POWERWOMAN funcionando ✅"
}
```

## 📝 Operaciones Básicas

### Registrar Usuario
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "full_name": "Nombre Completo",
    "password": "password123"
  }'
```

### Obtener Productos
```bash
curl http://localhost:5000/api/products
```

### Crear Orden
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_jwt" \
  -d '{
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

## ⚠️ Solución de Problemas

### Error: "ECONNREFUSED"
- PostgreSQL no está ejecutándose
- Verifica: `psql -U postgres`

### Error: "password authentication failed"
- Usuario o contraseña incorrectos en DATABASE_URL
- Verifica tu `.env`

### Error: "relation does not exist"
- Las tablas no fueron creadas
- Ejecuta: `npm run init-db`

## 🔐 Seguridad

- Las contraseñas se hashean con bcryptjs
- JWT se valida en cada request autenticado
- CORS está configurado para URLs específicas
- Usa variables de entorno para datos sensibles

---

¡API lista para usar! 🚀
