import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

const LIFECYCLE_LOG_PREFIX = '🔌 RabbitMQ';

@Injectable()
export class RabbitConnectionLifecycleListener implements OnModuleInit {
  private connectionAttempts = 0;
  private lastConnectionAttemptTime: Date | null = null;

  constructor(private readonly amqpConnection: AmqpConnection) {}

  onModuleInit() {
    console.log(`${LIFECYCLE_LOG_PREFIX} [LIFECYCLE] Module init started - setting up event listeners`);

    const connection = this.amqpConnection.managedConnection;
    if (!connection) {
      console.log(`${LIFECYCLE_LOG_PREFIX} [LIFECYCLE] No managed connection available yet`);
      return;
    }

    // Listen for connection attempts
    connection.on('connection', () => {
      this.lastConnectionAttemptTime = new Date();
      this.connectionAttempts++;
      console.log(`${LIFECYCLE_LOG_PREFIX} [CONNECT] Connection established (attempt #${this.connectionAttempts})`);
    });

    connection.on('disconnect', (params: any) => {
      console.log(`${LIFECYCLE_LOG_PREFIX} [DISCONNECT] Connection closed - error: ${params?.err?.message || 'clean close'}`);
    });

    connection.on('blocked', (reason: string) => {
      console.log(`${LIFECYCLE_LOG_PREFIX} [BLOCKED] Connection blocked: ${reason}`);
    });

    connection.on('unblocked', () => {
      console.log(`${LIFECYCLE_LOG_PREFIX} [UNBLOCKED] Connection unblocked`);
    });

    console.log(`${LIFECYCLE_LOG_PREFIX} [LIFECYCLE] Event listeners attached`);
  }

  getConnectionStats() {
    return {
      totalAttempts: this.connectionAttempts,
      lastAttempt: this.lastConnectionAttemptTime,
      isConnected: this.amqpConnection.connected,
    };
  }
}
