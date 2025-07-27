import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/settings - Buscar configurações do usuário
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;

  const result = await query(`
    SELECT * FROM user_settings WHERE user_id = $1
  `, [userId]);

  const response: ApiResponse = {
    success: true,
    data: result.rows[0] || {}
  };

  res.json(response);
}));

export default router; 