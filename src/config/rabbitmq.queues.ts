// Cron is a producer only — it publishes to these routing keys.
// Queue declaration and binding is the responsibility of the Worker (consumer).
export const CRON_RABBITMQ_ROUTING_KEYS = {
  NOTIFICATIONS_EMAIL: 'notifications.email',
  NOTIFICATIONS_REMINDER: 'notifications.reminder',
} as const;

export const CRON_RABBITMQ_EXCHANGES = {
  EVENTS: {
    name: 'zolve.events',
    type: 'topic',
    description: 'Main events exchange for platform event publishing',
  },
  DLX: {
    name: 'zolve.dlx',
    type: 'direct',
    description: 'Dead letter exchange for failed message handling',
  },
} as const;
