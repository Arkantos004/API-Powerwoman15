import { Request, Response } from 'express';
import { query } from '../config/database';
import { invoiceService } from '../services/invoiceService';

/**
 * Obtener todas las facturas del usuario
 */
export const getUserInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const invoices = await invoiceService.getUserInvoices(userId);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener facturas' });
  }
};

/**
 * Obtener una factura por ID
 */
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const result = await query('SELECT * FROM invoices WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Factura no encontrada' });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ success: false, error: 'Error al obtener factura' });
  }
};

/**
 * Obtener factura por número de orden
 */
export const getInvoiceByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;

    const invoice = await invoiceService.getInvoiceByOrderId(parseInt(orderId as string));

    if (!invoice) {
      res.status(404).json({ success: false, error: 'Factura no encontrada' });
      return;
    }

    // Verificar que la factura pertenezca al usuario
    if (invoice.user_id !== userId) {
      res.status(403).json({ success: false, error: 'No tienes acceso a esta factura' });
      return;
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ success: false, error: 'Error al obtener factura' });
  }
};

/**
 * Actualizar estado de factura
 */
export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).userId;

    const result = await query('SELECT * FROM invoices WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Factura no encontrada' });
      return;
    }

    const updatedInvoice = await invoiceService.updateInvoiceStatus(parseInt(id as string), status);

    res.json({
      success: true,
      message: 'Estado de factura actualizado',
      data: updatedInvoice,
    });
  } catch (error) {
    console.error('Error actualizando factura:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar factura' });
  }
};

/**
 * Obtener todas las facturas (solo admin)
 */
export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM invoices ORDER BY created_at DESC');

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener facturas' });
  }
};
