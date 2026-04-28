/**
 * Real-Time WebSocket Integration
 * Live alerts and instant doctor notifications
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class RealtimeAlertService extends EventEmitter {
  constructor(httpServer) {
    super();
    this.wss = new WebSocket.Server({ server: httpServer });
    this.connectedClients = new Map();
    this.subscriptions = new Map();
    this.messageHistory = {};
    this.maxHistorySize = 100;

    this.setupWebSocketServer();
  }

  /**
   * Setup WebSocket server
   */
  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      console.log(`[WebSocket] Client connected: ${clientId}`);

      // Store connection
      this.connectedClients.set(clientId, {
        ws,
        userId: null,
        userRole: null,
        subscribedPatients: new Set(),
        connectedAt: new Date().toISOString(),
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        this.handleMessage(clientId, data);
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
        this.connectedClients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`[WebSocket] Error on ${clientId}:`, error);
      });

      // Send connection confirmation
      this.sendMessage(clientId, {
        type: 'CONNECTION_ESTABLISHED',
        clientId,
        timestamp: new Date().toISOString(),
      });
    });

    console.log('[RealtimeAlertService] ✅ WebSocket server initialized');
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(clientId, rawData) {
    try {
      const message = JSON.parse(rawData);
      const client = this.connectedClients.get(clientId);

      if (!client) return;

      switch (message.type) {
        case 'AUTHENTICATE':
          this.authenticateClient(clientId, message);
          break;

        case 'SUBSCRIBE_PATIENT':
          this.subscribeToPatient(clientId, message.patientId);
          break;

        case 'UNSUBSCRIBE_PATIENT':
          this.unsubscribeFromPatient(clientId, message.patientId);
          break;

        case 'PING':
          this.sendMessage(clientId, { type: 'PONG', timestamp: new Date().toISOString() });
          break;

        case 'GET_MESSAGE_HISTORY':
          this.sendMessageHistory(clientId, message.patientId);
          break;

        default:
          console.log(`[WebSocket] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[handleMessage] Error:', error);
    }
  }

  /**
   * Authenticate client (doctor, caregiver, etc.)
   */
  authenticateClient(clientId, authData) {
    const client = this.connectedClients.get(clientId);

    if (!client) return;

    // In production, verify JWT or session token
    client.userId = authData.userId;
    client.userRole = authData.userRole; // DOCTOR, CAREGIVER, etc.

    this.sendMessage(clientId, {
      type: 'AUTHENTICATED',
      userId: client.userId,
      userRole: client.userRole,
    });

    console.log(`[WebSocket] ${client.userRole} authenticated: ${client.userId}`);
  }

  /**
   * Subscribe to patient alerts
   */
  subscribeToPatient(clientId, patientId) {
    const client = this.connectedClients.get(clientId);

    if (!client) return;

    // In production, verify access permissions
    client.subscribedPatients.add(patientId);

    if (!this.subscriptions.has(patientId)) {
      this.subscriptions.set(patientId, new Set());
    }

    this.subscriptions.get(patientId).add(clientId);

    this.sendMessage(clientId, {
      type: 'SUBSCRIPTION_CONFIRMED',
      patientId,
      timestamp: new Date().toISOString(),
    });

    console.log(`[WebSocket] Client ${clientId} subscribed to patient ${patientId}`);
  }

  /**
   * Unsubscribe from patient alerts
   */
  unsubscribeFromPatient(clientId, patientId) {
    const client = this.connectedClients.get(clientId);

    if (!client) return;

    client.subscribedPatients.delete(patientId);

    const subscribers = this.subscriptions.get(patientId);
    if (subscribers) {
      subscribers.delete(clientId);
    }

    this.sendMessage(clientId, {
      type: 'UNSUBSCRIPTION_CONFIRMED',
      patientId,
    });
  }

  /**
   * Send alert to all subscribers
   */
  broadcastAlert(patientId, alert) {
    const subscribers = this.subscriptions.get(patientId);

    if (!subscribers || subscribers.size === 0) {
      console.log(`[WebSocket] No subscribers for patient ${patientId}`);
      return;
    }

    const alertMessage = {
      type: 'ALERT',
      patientId,
      alert: {
        ...alert,
        broadcastedAt: new Date().toISOString(),
      },
    };

    // Store in history
    this.addToMessageHistory(patientId, alertMessage);

    // Send to all subscribers
    let sentCount = 0;
    subscribers.forEach(clientId => {
      if (this.sendMessage(clientId, alertMessage)) {
        sentCount++;
      }
    });

    console.log(`[WebSocket] Alert sent to ${sentCount} subscribers for patient ${patientId}`);
  }

  /**
   * Send realtime dashboard update
   */
  broadcastDashboardUpdate(patientId, updateData) {
    const subscribers = this.subscriptions.get(patientId);

    if (!subscribers || subscribers.size === 0) return;

    const updateMessage = {
      type: 'DASHBOARD_UPDATE',
      patientId,
      data: {
        ...updateData,
        updatedAt: new Date().toISOString(),
      },
    };

    this.addToMessageHistory(patientId, updateMessage);

    subscribers.forEach(clientId => {
      this.sendMessage(clientId, updateMessage);
    });

    console.log(`[WebSocket] Dashboard update sent for patient ${patientId}`);
  }

  /**
   * Send message to specific client
   */
  sendMessage(clientId, data) {
    const client = this.connectedClients.get(clientId);

    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`[sendMessage] Error sending to ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Send message history to client
   */
  sendMessageHistory(clientId, patientId) {
    const history = this.messageHistory[patientId] || [];

    this.sendMessage(clientId, {
      type: 'MESSAGE_HISTORY',
      patientId,
      messages: history.slice(-20), // Last 20 messages
      totalMessages: history.length,
    });
  }

  /**
   * Store message in history
   */
  addToMessageHistory(patientId, message) {
    if (!this.messageHistory[patientId]) {
      this.messageHistory[patientId] = [];
    }

    this.messageHistory[patientId].push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    // Keep only last N messages
    if (this.messageHistory[patientId].length > this.maxHistorySize) {
      this.messageHistory[patientId] = this.messageHistory[patientId].slice(-this.maxHistorySize);
    }
  }

  /**
   * Get active connections info
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.connectedClients.size,
      subscriptions: {},
      byRole: {},
    };

    // Count subscriptions per patient
    this.subscriptions.forEach((subscribers, patientId) => {
      stats.subscriptions[patientId] = subscribers.size;
    });

    // Count by user role
    this.connectedClients.forEach(client => {
      if (client.userRole) {
        stats.byRole[client.userRole] = (stats.byRole[client.userRole] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close all connections (graceful shutdown)
   */
  shutdown() {
    console.log('[RealtimeAlertService] Shutting down...');

    this.connectedClients.forEach((client, clientId) => {
      this.sendMessage(clientId, {
        type: 'SERVER_SHUTDOWN',
        message: 'Server is shutting down',
      });

      if (client.ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1000, 'Server shutdown');
      }
    });

    this.wss.close();
    console.log('[RealtimeAlertService] ✅ Shutdown complete');
  }
}

module.exports = RealtimeAlertService;
