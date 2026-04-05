import * as Joi from 'joi';

export default Joi.object({
  // ============================================
  // Cron Configuration
  // ============================================
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3003),

  // ============================================
  // Database — PostgreSQL
  // ============================================
  DATABASE_POSTGRES_HOST: Joi.string().default('localhost'),
  DATABASE_POSTGRES_PORT: Joi.number().default(5432),
  DATABASE_POSTGRES_NAME: Joi.string().default('backend_database_postgres'),
  DATABASE_POSTGRES_USER: Joi.string().default('postgres'),
  DATABASE_POSTGRES_PASSWORD: Joi.string().required(),
  DATABASE_POSTGRES_SYNCHRONIZE: Joi.boolean().default(false),
  DATABASE_POSTGRES_LOGGING: Joi.boolean().optional(),
  DATABASE_POSTGRES_TIMEZONE: Joi.string().default('UTC'),

  // ============================================
  // Redis (distributed lock)
  // ============================================
  CACHE_REDIS_HOST: Joi.string().default('localhost'),
  CACHE_REDIS_PORT: Joi.number().default(6379),
  CACHE_REDIS_PASSWORD: Joi.string().optional().allow(''),

  // ============================================
  // RabbitMQ (producer para lembretes)
  // ============================================
  RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
  RABBITMQ_EXCHANGE: Joi.string().default('zolve.events'),

  // ============================================
  // Schedules (cron expressions)
  // ============================================
  CRON_RATING_RECALCULATOR: Joi.string().default('0 5 * * *'),
  CRON_ACCOUNT_CLEANUP: Joi.string().default('0 6 * * 0'),
  CRON_REQUEST_REMINDER: Joi.string().default('0 12 * * *'),
  CRON_WEEKLY_REPORT: Joi.string().default('0 10 * * 1'),

  // ============================================
  // Business thresholds
  // ============================================
  PENDING_ACCOUNT_EXPIRY_DAYS: Joi.number().default(7),
  PENDING_REQUEST_REMINDER_HOURS: Joi.number().default(24),
  RATING_RECALC_WINDOW_DAYS: Joi.number().default(30),
});
