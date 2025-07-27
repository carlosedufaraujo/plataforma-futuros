import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      } as ApiResponse);
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      } as ApiResponse);
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      req.userId = decoded.userId;
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token.'
      } as ApiResponse);
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in authentication.'
    } as ApiResponse);
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
  );
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    req.userId = decoded.userId;
    req.user = decoded;
  } catch (error) {
    // Token inválido, mas não bloqueia a requisição
    console.warn('⚠️ Invalid token in optional auth:', error);
  }
  
  next();
}; 