import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/transactions - Listar transações do usuário
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;

  const result = await query(`
    SELECT t.*, c.symbol, c.name
    FROM transactions t
    JOIN contracts c ON t.contract_id = c.id
    WHERE t.user_id = $1
    ORDER BY t.executed_at DESC
    LIMIT 100
  `, [userId]);

  const response: ApiResponse = {
    success: true,
    data: result.rows
  };

  res.json(response);
}));

export default router; 