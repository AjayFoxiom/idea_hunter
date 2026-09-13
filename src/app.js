const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const ideasRoutes = require('./modules/idea/idea.routes');
const harvestRoutes = require('./modules/harvest/harvest.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const { sendSuccess } = require('./utils/response');

app.get('/health', (req, res) => sendSuccess(res, null, 'Healthy'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/harvest', harvestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res, next) => next(new AppError(404, 'Route not found')));
app.use(errorHandler);

module.exports = app;
