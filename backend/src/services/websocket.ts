import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { WSMessage, PriceUpdate } from '../types';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

let wss: WebSocket.Server;
const connectedClients = new Map<string, AuthenticatedWebSocket[]>();

export const setupWebSocket = (server: WebSocket.Server): void => {
  wss = server;

  wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
    console.log('🔌 New WebSocket connection');

    // Heartbeat mechanism
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'auth') {
          await authenticateWebSocket(ws, message.token);
        } else if (message.type === 'subscribe') {
          handleSubscription(ws, message.payload);
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket disconnected');
      removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      removeClient(ws);
    });
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (!ws.isAlive) {
        console.log('💀 Terminating dead connection');
        removeClient(ws);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

const authenticateWebSocket = async (
  ws: AuthenticatedWebSocket, 
  token: string
): Promise<void> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    ws.userId = decoded.userId;
    
    // Add to connected clients
    if (!connectedClients.has(decoded.userId)) {
      connectedClients.set(decoded.userId, []);
    }
    connectedClients.get(decoded.userId)!.push(ws);
    
    ws.send(JSON.stringify({
      type: 'auth_success',
      payload: { message: 'Authenticated successfully' }
    }));
    
    console.log(`✅ WebSocket authenticated for user ${decoded.userId}`);
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'auth_error',
      payload: { message: 'Invalid token' }
    }));
    ws.close();
  }
};

const handleSubscription = (
  ws: AuthenticatedWebSocket, 
  payload: any
): void => {
  // Handle subscription to price updates, position updates, etc.
  console.log('📡 Subscription request:', payload);
  
  ws.send(JSON.stringify({
    type: 'subscription_confirmed',
    payload: { subscriptions: payload }
  }));
};

const removeClient = (ws: AuthenticatedWebSocket): void => {
  if (ws.userId) {
    const userClients = connectedClients.get(ws.userId);
    if (userClients) {
      const index = userClients.indexOf(ws);
      if (index > -1) {
        userClients.splice(index, 1);
      }
      
      if (userClients.length === 0) {
        connectedClients.delete(ws.userId);
      }
    }
  }
};

// Broadcast functions
export const broadcastToUser = (userId: string, message: WSMessage): void => {
  const userClients = connectedClients.get(userId);
  if (userClients) {
    const messageStr = JSON.stringify(message);
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
};

export const broadcastPriceUpdate = (priceUpdate: PriceUpdate): void => {
  const message: WSMessage = {
    type: 'price_update',
    payload: priceUpdate
  };
  
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((client: AuthenticatedWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.userId) {
      client.send(messageStr);
    }
  });
};

export const broadcastToAll = (message: WSMessage): void => {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach((client: AuthenticatedWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.userId) {
      client.send(messageStr);
    }
  });
};

export const getConnectedUsers = (): string[] => {
  return Array.from(connectedClients.keys());
};

export const getConnectionCount = (): number => {
  let count = 0;
  connectedClients.forEach(clients => {
    count += clients.length;
  });
  return count;
}; 