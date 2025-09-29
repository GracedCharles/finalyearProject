import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

// Get the backend URL
const getBackendUrl = () => {
  const COMPUTER_IP = '192.168.43.72'; // Default IP from your setup
  const backendIp = process.env.EXPO_PUBLIC_BACKEND_IP || COMPUTER_IP;
  
  if (Platform.OS === 'android') {
    return `http://${backendIp}:5000`;
  } else if (Platform.OS === 'ios') {
    return `http://${backendIp}:5000`;
  } else {
    return 'http://localhost:5000';
  }
};

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = getBackendUrl();
    console.log('Connecting to Socket.IO server:', backendUrl);
    
    this.socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', this.socket?.id);
      if (this.userId) {
        this.socket?.emit('registerUser', this.userId);
      }
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.emit('error', error);
    });

    // Listen for fine issued events
    this.socket.on('fineIssued', (data) => {
      console.log('Received fine issued event:', data);
      this.emit('fineIssued', data);
    });

    // Listen for payment processed events
    this.socket.on('paymentProcessed', (data) => {
      console.log('Received payment processed event:', data);
      this.emit('paymentProcessed', data);
    });

    // Listen for officer-specific events
    this.socket.on('fineIssued:*', (data) => {
      console.log('Received officer-specific fine issued event:', data);
      this.emit('officerFineIssued', data);
    });

    this.socket.on('paymentProcessed:*', (data) => {
      console.log('Received officer-specific payment processed event:', data);
      this.emit('officerPaymentProcessed', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
    if (this.socket?.connected) {
      this.socket.emit('registerUser', userId);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export a singleton instance
export const realtimeService = new RealtimeService();

export default realtimeService;