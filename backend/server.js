const app = require('./app');
const { connectDB } = require('./config/database');
const env = require('./config/environment');

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`================================================`);
      console.log(`🏨 Hotel Booking Backend running in ${env.NODE_ENV} mode`);
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`📖 API Documentation at http://localhost:${PORT}/api/docs`);
      console.log(`================================================`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
