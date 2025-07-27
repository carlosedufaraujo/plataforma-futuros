import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query } from '../services/database';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  calculatePositionPnL, 
  calculateTargetPrice, 
  formatCurrency 
} from '../services/calculator';
import { 
  Position, 
  CreatePositionDto, 
  UpdatePositionDto, 
  ApiResponse,
  PositionDirection 
} from '../types';

const router = Router();

// GET /api/positions - Listar posições do usuário
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;
  const { status, direction } = req.query;

  let queryText = `
    SELECT p.*, c.symbol, c.name, c.contract_size, c.unit
    FROM positions p
    JOIN contracts c ON p.contract_id = c.id
    WHERE p.user_id = $1
  `;
  
  const queryParams = [userId];
  let paramIndex = 2;

  if (status) {
    queryText += ` AND p.status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }

  if (direction) {
    queryText += ` AND p.direction = $${paramIndex}`;
    queryParams.push(direction);
    paramIndex++;
  }

  queryText += ' ORDER BY p.created_at DESC';

  const result = await query(queryText, queryParams);
  
  // Calcular P&L para posições abertas
  const positionsWithPnL = result.rows.map((position: any) => {
    if (position.status === 'OPEN' && position.current_price) {
      const pnlCalc = calculatePositionPnL({
        direction: position.direction,
        quantity: position.quantity,
        entry_price: parseFloat(position.entry_price),
        current_price: parseFloat(position.current_price),
        contract_size: position.contract_size
      });
      
      return {
        ...position,
        unrealized_pnl: pnlCalc.pnl,
        pnl_percentage: pnlCalc.pnl_percentage,
        total_quantity: pnlCalc.total_quantity,
        exposure: pnlCalc.exposure
      };
    }
    return position;
  });

  const response: ApiResponse = {
    success: true,
    data: positionsWithPnL
  };

  res.json(response);
}));

// POST /api/positions - Criar nova posição
router.post('/', [
  body('contract_id').notEmpty().withMessage('Contract ID é obrigatório'),
  body('direction').isIn(['LONG', 'SHORT']).withMessage('Direction deve ser LONG ou SHORT'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity deve ser um número inteiro positivo'),
  body('entry_price').isFloat({ min: 0.01 }).withMessage('Entry price deve ser um número positivo'),
  body('stop_loss').optional().isFloat({ min: 0 }).withMessage('Stop loss deve ser um número positivo'),
  body('take_profit').optional().isFloat({ min: 0 }).withMessage('Take profit deve ser um número positivo')
], asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos',
      details: errors.array()
    } as ApiResponse);
  }

  const { userId } = req;
  const { 
    contract_id, 
    direction, 
    quantity, 
    entry_price, 
    stop_loss, 
    take_profit 
  }: CreatePositionDto = req.body;

  // Verificar se o contrato existe
  const contractResult = await query(
    'SELECT * FROM contracts WHERE id = $1 AND is_active = true',
    [contract_id]
  );

  if (contractResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Contrato não encontrado'
    } as ApiResponse);
  }

  const contract = contractResult.rows[0];

  // Calcular exposição e verificar limites (simplificado)
  const exposure = entry_price * quantity * contract.contract_size;
  const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  if (exposure > user.current_capital * 2) { // Máximo 200% de alavancagem
    return res.status(400).json({
      success: false,
      error: 'Exposição excede limite de capital disponível'
    } as ApiResponse);
  }

  // Inserir nova posição
  const insertResult = await query(`
    INSERT INTO positions (
      user_id, contract_id, direction, quantity, entry_price, 
      current_price, stop_loss, take_profit, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
    RETURNING *
  `, [
    userId, contract_id, direction, quantity, entry_price,
    entry_price, stop_loss, take_profit
  ]);

  // Criar transação
  const totalAmount = exposure;
  const fees = totalAmount * 0.001; // 0.1% de taxa

  await query(`
    INSERT INTO transactions (
      user_id, position_id, contract_id, transaction_type,
      quantity, price, total_amount, fees
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    userId, insertResult.rows[0].id, contract_id,
    direction === 'LONG' ? 'BUY' : 'SELL',
    quantity, entry_price, totalAmount, fees
  ]);

  const response: ApiResponse = {
    success: true,
    data: insertResult.rows[0],
    message: `Posição ${direction} criada com sucesso!`
  };

  res.status(201).json(response);
}));

// PUT /api/positions/:id - Atualizar posição
router.put('/:id', [
  param('id').isUUID().withMessage('ID da posição deve ser UUID válido'),
  body('stop_loss').optional().isFloat({ min: 0 }),
  body('take_profit').optional().isFloat({ min: 0 }),
  body('current_price').optional().isFloat({ min: 0 })
], asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    } as ApiResponse);
  }

  const { userId } = req;
  const { id } = req.params;
  const updates: UpdatePositionDto = req.body;

  // Verificar se a posição pertence ao usuário
  const positionResult = await query(
    'SELECT * FROM positions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (positionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Posição não encontrada'
    } as ApiResponse);
  }

  // Construir query de update dinamicamente
  const setFields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.stop_loss !== undefined) {
    setFields.push(`stop_loss = $${paramIndex++}`);
    values.push(updates.stop_loss);
  }
  
  if (updates.take_profit !== undefined) {
    setFields.push(`take_profit = $${paramIndex++}`);
    values.push(updates.take_profit);
  }
  
  if (updates.current_price !== undefined) {
    setFields.push(`current_price = $${paramIndex++}`);
    values.push(updates.current_price);
  }

  if (setFields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nenhum campo para atualizar'
    } as ApiResponse);
  }

  setFields.push(`updated_at = NOW()`);
  values.push(id, userId);

  const updateResult = await query(`
    UPDATE positions 
    SET ${setFields.join(', ')}
    WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
    RETURNING *
  `, values);

  const response: ApiResponse = {
    success: true,
    data: updateResult.rows[0],
    message: 'Posição atualizada com sucesso'
  };

  res.json(response);
}));

// DELETE /api/positions/:id/close - Fechar posição
router.delete('/:id/close', [
  param('id').isUUID().withMessage('ID da posição deve ser UUID válido'),
  body('exit_price').isFloat({ min: 0.01 }).withMessage('Preço de saída é obrigatório')
], asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    } as ApiResponse);
  }

  const { userId } = req;
  const { id } = req.params;
  const { exit_price } = req.body;

  // Buscar posição com contrato
  const positionResult = await query(`
    SELECT p.*, c.contract_size 
    FROM positions p
    JOIN contracts c ON p.contract_id = c.id
    WHERE p.id = $1 AND p.user_id = $2 AND p.status = 'OPEN'
  `, [id, userId]);

  if (positionResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Posição aberta não encontrada'
    } as ApiResponse);
  }

  const position = positionResult.rows[0];

  // Calcular P&L final
  const pnlCalc = calculatePositionPnL({
    direction: position.direction,
    quantity: position.quantity,
    entry_price: parseFloat(position.entry_price),
    current_price: exit_price,
    contract_size: position.contract_size
  });

  // Atualizar posição
  const updateResult = await query(`
    UPDATE positions 
    SET status = 'CLOSED', exit_date = NOW(), exit_price = $1, realized_pnl = $2
    WHERE id = $3
    RETURNING *
  `, [exit_price, pnlCalc.pnl, id]);

  // Criar transação de fechamento
  const totalAmount = exit_price * position.quantity * position.contract_size;
  const fees = totalAmount * 0.001;

  await query(`
    INSERT INTO transactions (
      user_id, position_id, contract_id, transaction_type,
      quantity, price, total_amount, fees, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    userId, id, position.contract_id,
    position.direction === 'LONG' ? 'SELL' : 'BUY',
    position.quantity, exit_price, totalAmount, fees,
    `Fechamento de posição ${position.direction}`
  ]);

  // Atualizar capital do usuário
  await query(`
    UPDATE users 
    SET current_capital = current_capital + $1
    WHERE id = $2
  `, [pnlCalc.pnl - fees, userId]);

  const response: ApiResponse = {
    success: true,
    data: {
      position: updateResult.rows[0],
      pnl: pnlCalc.pnl,
      pnl_formatted: formatCurrency(pnlCalc.pnl),
      fees: fees
    },
    message: `Posição fechada! ${pnlCalc.pnl >= 0 ? 'Lucro' : 'Prejuízo'}: ${formatCurrency(pnlCalc.pnl)}`
  };

  res.json(response);
}));

// GET /api/positions/summary - Resumo das posições
router.get('/summary', asyncHandler(async (req: any, res: any) => {
  const { userId } = req;

  // Posições abertas
  const openPositions = await query(`
    SELECT p.*, c.contract_size, c.symbol
    FROM positions p
    JOIN contracts c ON p.contract_id = c.id
    WHERE p.user_id = $1 AND p.status = 'OPEN'
  `, [userId]);

  // Calcular métricas
  let totalExposure = 0;
  let unrealizedPnL = 0;

  const positionsWithPnL = openPositions.rows.map((position: any) => {
    if (position.current_price) {
      const pnlCalc = calculatePositionPnL({
        direction: position.direction,
        quantity: position.quantity,
        entry_price: parseFloat(position.entry_price),
        current_price: parseFloat(position.current_price),
        contract_size: position.contract_size
      });
      
      totalExposure += pnlCalc.exposure;
      unrealizedPnL += pnlCalc.pnl;
      
      return { ...position, ...pnlCalc };
    }
    return position;
  });

  // P&L realizado (últimos 30 dias)
  const realizedPnLResult = await query(`
    SELECT COALESCE(SUM(realized_pnl), 0) as total_realized_pnl
    FROM positions 
    WHERE user_id = $1 AND status = 'CLOSED' 
    AND exit_date >= NOW() - INTERVAL '30 days'
  `, [userId]);

  const summary = {
    total_positions: openPositions.rows.length,
    total_exposure: totalExposure,
    unrealized_pnl: unrealizedPnL,
    realized_pnl: parseFloat(realizedPnLResult.rows[0].total_realized_pnl),
    positions: positionsWithPnL
  };

  const response: ApiResponse = {
    success: true,
    data: summary
  };

  res.json(response);
}));

export default router; 