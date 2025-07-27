import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/prices/current - Preços atuais
router.get('/current', asyncHandler(async (req: any, res: any) => {
  const result = await query(`
    SELECT p.*, c.symbol, c.name
    FROM prices p
    JOIN contracts c ON p.contract_id = c.id
    WHERE p.is_current = true
    ORDER BY c.contract_type, c.symbol
  `);

  const response: ApiResponse = {
    success: true,
    data: result.rows
  };

  res.json(response);
}));

export default router; 