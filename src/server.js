require('dotenv').config();
const port = Number(process.env.PORT) || 4000;
const connectDB = require('./config/db');
const app = require('./app');
const { startHarvestCron } = require('./jobs/harvestCron');
const { startHealthCron } = require('./jobs/healthCron');
const logger = require('./utils/logger');

async function start() {
  await connectDB();
  await startHarvestCron();
  startHealthCron();

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
