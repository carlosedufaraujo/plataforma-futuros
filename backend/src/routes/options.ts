import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/options - Listar opções do usuário
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;

  const result = await query(`
    SELECT o.*, c.symbol, c.name
    FROM options o
    JOIN contracts c ON o.contract_id = c.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `, [userId]);

  const response: ApiResponse = {
    success: true,
    data: result.rows
  };

  res.json(response);
}));

export default router; 