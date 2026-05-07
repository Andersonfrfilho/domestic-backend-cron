export const CRON_RABBITMQ_QUEUES = {
  // Provider approval events
  PROVIDER_APPROVAL: {
    name: 'worker.provider.approval',
    routingKeys: ['provider.approved', 'provider.rejected'],
    exchange: 'zolve.events',
    description: 'Provider approval/rejection events from API',
  },

  // Rating calculation events
  RATING: {
    name: 'worker.rating',
    routingKeys: ['review.created'],
    exchange: 'zolve.events',
    description: 'Review creation events triggering rating recalculation',
  },

  // Service request events
  SERVICE_REQUESTS: {
    name: 'worker.service-requests',
    routingKeys: ['service_request.*'],
    exchange: 'zolve.events',
    description: 'Service request lifecycle events',
  },

  // Notifications (email and push)
  NOTIFICATIONS: {
    name: 'worker.notifications',
    routingKeys: ['notifications.email', 'notifications.push'],
    exchange: 'zolve.events',
    description: 'Email and push notification events',
  },

  // Dead letter queue for failed messages
  DLQ: {
    name: 'worker.dlq',
    routingKeys: [''],
    exchange: 'zolve.dlx',
    description: 'Dead letter queue for failed message processing',
  },
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
