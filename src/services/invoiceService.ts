import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

export interface InvoiceData {
  orderId: number;
  userId: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  userEmail: string;
  userName: string;
  userAddress?: string;
  userPhone?: string;
}

export class InvoiceService {
  private uploadsDir = path.join(__dirname, '../../uploads/invoices');

  constructor() {
    // Crear directorio de invoices si no existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generar PDF de factura
   */
  private generatePDF(data: InvoiceData, invoiceNumber: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `invoice-${invoiceNumber}-${Date.now()}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        const stream = fs.createWriteStream(filepath);

        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
        });

        doc.pipe(stream);

        // Encabezado
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('FACTURA', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Número: ${invoiceNumber}`, { align: 'center' })
          .text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'center' })
          .moveDown(1);

        // Información de la empresa
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Powerwoman', 0, 150)
          .fontSize(10)
          .font('Helvetica')
          .text('Empresa de capacitación y venta de productos')
          .text('Colombia')
          .moveDown(0.5);

        // Información del cliente
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Cliente:', 300, 150)
          .fontSize(10)
          .font('Helvetica')
          .text(data.userName, 300)
          .text(data.userEmail, 300)
          .text(data.userPhone || '', 300)
          .text(data.userAddress || '', 300)
          .moveDown(1);

        // Línea separadora
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        // Tabla de items
        const tableTop = doc.y;
        const itemX = 40;
        const nameX = 100;
        const qtyX = 350;
        const priceX = 430;
        const subtotalX = 500;

        // Encabezados de tabla
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Item', itemX, tableTop)
          .text('Descripción', nameX, tableTop)
          .text('Cantidad', qtyX, tableTop)
          .text('Precio', priceX, tableTop)
          .text('Subtotal', subtotalX, tableTop);

        doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke();
        doc.moveDown(0.5);

        // Items
        let itemNumber = 1;
        data.items.forEach((item) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc
            .fontSize(10)
            .font('Helvetica')
            .text(itemNumber.toString(), itemX, doc.y)
            .text(item.name, nameX, doc.y)
            .text(item.quantity.toString(), qtyX, doc.y, { align: 'right' })
            .text(`$${item.price.toLocaleString('es-CO')}`, priceX, doc.y, { align: 'right' })
            .text(`$${item.subtotal.toLocaleString('es-CO')}`, subtotalX, doc.y, { align: 'right' });

          doc.moveDown(0.8);
          itemNumber++;
        });

        // Línea separadora
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        // Totales
        const totalsX = 400;
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Subtotal:', totalsX, doc.y)
          .text(`$${data.subtotal.toLocaleString('es-CO')}`, subtotalX, doc.y, { align: 'right' });

        doc.moveDown(0.5);
        doc
          .text('IVA (19%):', totalsX, doc.y)
          .text(`$${data.tax.toLocaleString('es-CO')}`, subtotalX, doc.y, { align: 'right' });

        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Total:', totalsX, doc.y)
          .text(`$${data.total.toLocaleString('es-CO')}`, subtotalX, doc.y, { align: 'right' });

        doc.moveDown(2);

        // Pie de página
        doc
          .fontSize(8)
          .font('Helvetica')
          .text('Gracias por tu compra', { align: 'center' })
          .text('Para preguntas, contacta a: info@powerwoman.com', { align: 'center' })
          .moveDown(0.5)
          .text('© 2026 Powerwoman. Todos los derechos reservados.', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(`/uploads/invoices/${filename}`);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Crear factura en la base de datos
   */
  async createInvoice(data: InvoiceData): Promise<any> {
    try {
      // Generar número de factura
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Generar PDF
      const pdfUrl = await this.generatePDF(data, invoiceNumber);

      // Guardar en base de datos
      const result = await query(
        `INSERT INTO invoices (order_id, invoice_number, user_id, subtotal_cop, tax_cop, total_cop, pdf_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.orderId,
          invoiceNumber,
          data.userId,
          data.subtotal,
          data.tax,
          data.total,
          pdfUrl,
          'generated',
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creando factura:', error);
      throw error;
    }
  }

  /**
   * Obtener factura por orden
   */
  async getInvoiceByOrderId(orderId: number): Promise<any> {
    try {
      const result = await query('SELECT * FROM invoices WHERE order_id = $1', [orderId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo factura:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las facturas del usuario
   */
  async getUserInvoices(userId: number): Promise<any[]> {
    try {
      const result = await query(
        'SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo facturas del usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de factura
   */
  async updateInvoiceStatus(invoiceId: number, status: string): Promise<any> {
    try {
      const result = await query(
        'UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, invoiceId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando factura:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
