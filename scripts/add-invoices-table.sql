-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL UNIQUE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  subtotal_cop DECIMAL(12, 2) NOT NULL,
  tax_cop DECIMAL(12, 2) NOT NULL,
  total_cop DECIMAL(12, 2) NOT NULL,
  pdf_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'generated', -- 'generated', 'sent', 'viewed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índice para buscar facturas por usuario
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
