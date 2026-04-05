import type { Channel, ConsumeMessage } from 'amqplib';

const RETRY_HEADER = 'x-retry-count';
const MAX_RETRIES = Number(process.env.WORKER_MAX_RETRIES ?? 3);

export function getRetryCount(msg: ConsumeMessage): number {
  const headers = msg.properties.headers ?? {};
  return Number(headers[RETRY_HEADER] ?? 0);
}

export function ackMessage(channel: Channel, msg: ConsumeMessage): void {
  channel.ack(msg);
}

/**
 * NACK recoverable: sends to DLX for retry. Returns false after max retries.
 */
export function nackMessage(channel: Channel, msg: ConsumeMessage): boolean {
  const retries = getRetryCount(msg);
  if (retries >= MAX_RETRIES) {
    // Exhausted retries — ACK to remove from queue (already in DLQ via DLX)
    channel.ack(msg);
    return false;
  }
  // Send to DLX (requeue: false)
  channel.nack(msg, false, false);
  return true;
}
