# Sistema de Generación de Facturas Automáticas

## 📋 Descripción General

Se ha implementado un sistema completo de generación automática de facturas en PDF cuando un cliente realiza una compra. Las facturas se generan automáticamente en el momento en que se crea una orden, se guardan en la base de datos y se pueden descargar en cualquier momento.

## 🎯 Características Principales

✅ **Generación Automática**: Se crea una factura en PDF automáticamente cuando se realiza una compra
✅ **Almacenamiento en BD**: La información de la factura se guarda en la base de datos
✅ **Acceso a Facturas**: Los usuarios pueden ver todas sus facturas
✅ **Formatos Profesionales**: PDFs con formato profesional con logo de empresa, totales, detalles de productos, etc.
✅ **Seguridad**: Las facturas solo pueden ser vistas por el usuario propietario
✅ **Admin Panel**: Los administradores pueden ver todas las facturas del sistema

## 📦 Dependencias Instaladas

- **pdfkit** (^0.18.0): Librería para generar PDFs en Node.js
- **@types/pdfkit** (^0.17.6): Tipos de TypeScript para pdfkit

## 🗄️ Base de Datos

### Tabla: `invoices`

```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  subtotal_cop DECIMAL(12, 2) NOT NULL,
  tax_cop DECIMAL(12, 2) NOT NULL,
  total_cop DECIMAL(12, 2) NOT NULL,
  pdf_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: ID único de la factura
- `order_id`: Referencia única a la orden (cada orden tiene una sola factura)
- `invoice_number`: Número único de factura (ej: INV-1234567890-ABC123)
- `user_id`: ID del usuario que realizó la compra
- `subtotal_cop`: Subtotal en pesos colombianos
- `tax_cop`: Impuesto (IVA 19%)
- `total_cop`: Total incluyendo impuestos
- `pdf_url`: URL del archivo PDF generado
- `status`: Estado de la factura ('generated', 'sent', 'viewed')

## 🔌 Nuevos Endpoints API

### 1. Obtener todas las facturas del usuario
```
GET /api/invoices
Headers: Authorization: Bearer {token}
Response: 
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "invoice_number": "INV-1234567890-ABC123",
      "user_id": 1,
      "subtotal_cop": 100000,
      "tax_cop": 19000,
      "total_cop": 119000,
      "pdf_url": "/uploads/invoices/invoice-INV-1234567890-ABC123-1234567890.pdf",
      "status": "generated",
      "created_at": "2026-05-20T10:30:00Z",
      "updated_at": "2026-05-20T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 2. Obtener factura por ID
```
GET /api/invoices/:id
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": { ... } }
```

### 3. Obtener factura por ID de orden
```
GET /api/invoices/order/:orderId
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": { ... } }
```

### 4. Actualizar estado de factura
```
PATCH /api/invoices/:id/status
Headers: Authorization: Bearer {token}
Body: { "status": "sent" | "viewed" }
Response: { "success": true, "data": { ... } }
```

### 5. Obtener todas las facturas (solo admin)
```
GET /api/invoices/admin/all
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": [...], "count": 10 }
```

## 🔄 Flujo de Funcionamiento

### Cuando se crea una orden:

1. **Usuario realiza compra** → Llama a `POST /api/orders`
2. **Sistema crea la orden** → Se inserta en tabla `orders`
3. **Se agregan items** → Se insertan en tabla `order_items`
4. **Se obtienen detalles** → Se consultan datos del usuario y productos
5. **Se genera factura PDF** → Se crea archivo PDF con pdfkit
6. **Se guarda en BD** → Se inserta registro en tabla `invoices`
7. **Respuesta al cliente** → Se devuelve orden + factura creada

```
POST /api/orders
├─ Crear orden
├─ Agregar items
├─ Obtener detalles del usuario
├─ Obtener detalles de productos
├─ Generar PDF (pdfkit)
├─ Guardar en uploads/invoices/
├─ Registrar en BD
└─ Devolver orden + factura
```

## 📁 Archivos Creados/Modificados

### Nuevos archivos:
- `src/services/invoiceService.ts` - Servicio de generación de facturas
- `src/controllers/invoiceController.ts` - Controlador de facturas
- `src/routes/invoiceRoutes.ts` - Rutas de facturas
- `scripts/add-invoices-table.sql` - SQL para crear tabla
- `scripts/add-invoices-migration.ts` - Script de migración
- `uploads/invoices/` - Carpeta para almacenar PDFs

### Archivos modificados:
- `src/index.ts` - Agregadas rutas de facturas
- `src/controllers/orderController.ts` - Agregada lógica de generación de facturas
- `package.json` - Agregadas dependencias y script npm

## 🚀 Cómo Usar

### 1. Ejecutar la migración (ya hecha):
```bash
npm run add-invoices
```

### 2. Crear una orden (ahora genera factura automáticamente):
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 3, "quantity": 1 }
    ]
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Orden creada exitosamente y factura generada",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-1234567890-ABC123",
      "subtotal_cop": 100000,
      "total_cop": 119000,
      "status": "pending"
    },
    "invoice": {
      "id": 1,
      "invoice_number": "INV-1234567890-ABC123",
      "pdf_url": "/uploads/invoices/invoice-INV-1234567890-ABC123-1234567890.pdf"
    }
  }
}
```

### 3. Obtener facturas del usuario:
```bash
curl -X GET http://localhost:5000/api/invoices \
  -H "Authorization: Bearer {token}"
```

### 4. Descargar PDF de factura:
El cliente puede descargar el PDF desde la URL devuelta en `pdf_url`:
```
GET http://localhost:5000/uploads/invoices/invoice-INV-1234567890-ABC123-1234567890.pdf
```

## 🎨 Contenido del PDF

Cada factura PDF incluye:

```
┌─────────────────────────────────────┐
│          FACTURA                    │
│    Número: INV-1234567890-ABC123   │
│    Fecha: 20/05/2026               │
├─────────────────────────────────────┤
│ Powerwoman                          │
│ Empresa de capacitación             │
│                                     │
│ Cliente: Juan Pérez                 │
│ juan@email.com                      │
│ +57 300 1234567                     │
├─────────────────────────────────────┤
│ Item | Descripción | Qty | Precio  │
├─────────────────────────────────────┤
│ 1    | Producto A  │ 2   | $50.000 │
│ 2    | Producto B  │ 1   | $30.000 │
├─────────────────────────────────────┤
│ Subtotal:  $100.000                 │
│ IVA (19%): $ 19.000                 │
│ Total:     $119.000                 │
└─────────────────────────────────────┘
```

## 🔒 Seguridad

- ✅ Solo usuarios autenticados pueden acceder a sus facturas
- ✅ Los usuarios no pueden ver facturas de otros usuarios
- ✅ Los administradores pueden ver todas las facturas
- ✅ Las URLs de PDFs no se exponen directamente
- ✅ Se valida que el usuario sea propietario de la factura antes de devolverla

## 📊 Estados de Factura

- `generated` - Factura creada (estado inicial)
- `sent` - Factura enviada al email del cliente
- `viewed` - Factura visualizada por el cliente

## ⚙️ Configuración Futura

Para completar el sistema, se puede:

1. **Envío por Email**: Usar un servicio como SendGrid o Nodemailer para enviar facturas por email
2. **Descarga Directa**: Crear un endpoint para descargar facturas como PDF
3. **Numeración Correlativa**: Cambiar el formato del invoice_number a formato correlativo (1, 2, 3...)
4. **Impuestos Variables**: Permitir diferentes tasas de IVA por región o tipo de producto
5. **Retenciones**: Agregar soporte para retenciones automáticas
6. **Remisiones**: Crear remisiones de venta adicionales

## 🐛 Manejo de Errores

Si la generación de la factura falla:
- Se sigue creando la orden
- Se devuelve un mensaje indicando que la factura no se pudo generar
- El administrador puede generar la factura manualmente después

## 📝 Notas Importantes

- Las facturas se generan automáticamente en memoria y se guardan en `/uploads/invoices/`
- El nombre del archivo PDF incluye timestamp para evitar duplicados
- Si un usuario cancela una orden, la factura se mantiene registrada (para auditoría)
- La tabla `invoices` tiene una restricción UNIQUE en `order_id` (una orden = una factura)

---

✅ **Sistema listo para usar. Las facturas se generarán automáticamente en cada compra.**
