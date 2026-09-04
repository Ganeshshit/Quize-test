// src/services/socket.service.js
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * STEP 9: Connect to proctor socket
     * Called after generating proctor token
     */
    connect(token) {
        return new Promise((resolve, reject) => {
            try {
                // Disconnect existing connection if any
                if (this.socket) {
                    this.disconnect();
                }

                // Create socket connection with auth
                this.socket = io(SOCKET_URL, {
                    auth: {
                        token
                    },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: this.maxReconnectAttempts
                });

                // Connection success
                this.socket.on('connect', () => {
                    console.log('✅ Socket connected:', this.socket.id);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve(this.socket);
                });

                // Connection error
                this.socket.on('connect_error', (error) => {
                    console.error('❌ Socket connection error:', error);
                    this.isConnected = false;
                    this.reconnectAttempts++;

                    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                        toast.error('Unable to establish proctoring connection');
                        reject(error);
                    }
                });

                // Disconnection
                this.socket.on('disconnect', (reason) => {
                    console.log('⚠️ Socket disconnected:', reason);
                    this.isConnected = false;

                    if (reason === 'io server disconnect') {
                        // Server disconnected the client, try to reconnect manuallyV

                        toast('⚠️ Proctoring connection lost. Reconnecting...', {
                            icon: '⚠️'
                        });

                        this.socket.connect();
                    }
                });

                // Reconnection attempt
                this.socket.on('reconnect_attempt', (attemptNumber) => {
                    console.log(`🔄 Reconnection attempt ${attemptNumber}`);
                    toast.loading(`Reconnecting... (${attemptNumber}/${this.maxReconnectAttempts})`);
                });

                // Reconnection success
                this.socket.on('reconnect', (attemptNumber) => {
                    console.log('✅ Reconnected after', attemptNumber, 'attempts');
                    toast.success('Proctoring connection restored');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                });

                // Reconnection failed
                this.socket.on('reconnect_failed', () => {
                    console.error('❌ Reconnection failed');
                    toast.error('Failed to restore proctoring connection');
                    this.isConnected = false;
                });

            } catch (error) {
                console.error('Socket connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Join proctor room for specific attempt
     */
    joinProctorRoom(attemptId, token, nonce) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.isConnected) {
                reject(new Error('Socket not connected'));
                return;
            }

            this.socket.emit('join-proctor', {
                attemptId,
                token,
                nonce
            }, (response) => {
                if (response.success) {
                    console.log('✅ Joined proctor room:', attemptId);
                    resolve(response);
                } else {
                    console.error('❌ Failed to join proctor room:', response.error);
                    reject(new Error(response.error));
                }
            });
        });
    }

    /**
     * Leave proctor room
     */
    leaveProctorRoom(attemptId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-proctor', { attemptId });
            console.log('👋 Left proctor room:', attemptId);
        }
    }

    /**
     * Listen for admin commands (terminate, warn, etc.)
     */
    onAdminCommand(callback) {
        if (this.socket) {
            this.socket.on('admin-command', callback);
        }
    }

    /**
     * Listen for proctor alerts
     */
    onProctorAlert(callback) {
        if (this.socket) {
            this.socket.on('proctor-alert', callback);
        }
    }

    /**
     * Remove admin command listener
     */
    offAdminCommand(callback) {
        if (this.socket) {
            this.socket.off('admin-command', callback);
        }
    }

    /**
     * Remove proctor alert listener
     */
    offProctorAlert(callback) {
        if (this.socket) {
            this.socket.off('proctor-alert', callback);
        }
    }

    /**
     * Send WebRTC signal (for peer connection)
     */
    sendSignal(signal, targetSocketId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('webrtc-signal', {
                signal,
                to: targetSocketId
            });
        }
    }

    /**
     * Listen for WebRTC signals
     */
    onSignal(callback) {
        if (this.socket) {
            this.socket.on('webrtc-signal', callback);
        }
    }

    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('👋 Socket disconnected');
        }
    }

    /**
     * Check if socket is connected
     */
    isSocketConnected() {
        return this.socket && this.isConnected;
    }

    /**
     * Get socket instance
     */
    getSocket() {
        return this.socket;
    }
}

// Export singleton instance
export const socketService = new SocketService();