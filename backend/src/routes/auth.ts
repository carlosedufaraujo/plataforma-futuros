import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query } from '../services/database';
import { generateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Email válido é obrigatório'),
  body('password').isLength({ min: 1 }).withMessage('Senha é obrigatória')
], asyncHandler(async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    } as ApiResponse);
  }

  const { email, password } = req.body;

  // Buscar usuário
  const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    } as ApiResponse);
  }

  const user = userResult.rows[0];

  // Verificar senha
  const validPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!validPassword) {
    return res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    } as ApiResponse);
  }

  // Gerar token
  const token = generateToken(user.id, user.email);

  const response: ApiResponse = {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        current_capital: user.current_capital,
        theme: user.theme
      }
    },
    message: 'Login realizado com sucesso'
  };

  res.json(response);
}));

// GET /api/auth/me
router.get('/me', asyncHandler(async (req: any, res: any) => {
  // Para demo, retorna usuário padrão
  const userResult = await query('SELECT * FROM users WHERE email = $1', ['admin@futurestrader.com']);
  
  if (userResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    } as ApiResponse);
  }

  const user = userResult.rows[0];

  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      current_capital: user.current_capital,
      theme: user.theme
    }
  };

  res.json(response);
}));

export default router; 