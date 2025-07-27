import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/contracts - Listar contratos disponíveis
router.get('/', asyncHandler(async (req: any, res: any) => {
  const result = await query(`
    SELECT c.*, p.price as current_price, p.volume
    FROM contracts c
    LEFT JOIN prices p ON c.id = p.contract_id AND p.is_current = true
    WHERE c.is_active = true
    ORDER BY c.contract_type, c.expiration_date
  `);

  const response: ApiResponse = {
    success: true,
    data: result.rows
  };

  res.json(response);
}));

export default router; 