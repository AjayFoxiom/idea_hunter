const pino = require('pino');
const nodeEnv = process.env.NODE_ENV || 'development';

const logger = pino(
  nodeEnv === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}
);

module.exports = logger;
