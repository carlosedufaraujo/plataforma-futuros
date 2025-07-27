import { Router } from 'express';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { calculateRentabilityMetrics } from '../services/calculator';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/analytics/rentability - Métricas de rentabilidade
router.get('/rentability', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;

  // Buscar dados do usuário
  const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  // Buscar todas as posições
  const positionsResult = await query(`
    SELECT * FROM positions WHERE user_id = $1
  `, [userId]);

  // Calcular métricas
  const metrics = calculateRentabilityMetrics(positionsResult.rows, user.initial_capital);

  const response: ApiResponse = {
    success: true,
    data: {
      ...metrics,
      current_capital: user.current_capital,
      initial_capital: user.initial_capital
    }
  };

  res.json(response);
}));

export default router; 