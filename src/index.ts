import 'reflect-metadata';
import express, { Request, Response, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from './config/swagger.config';
import { requestLogger } from './middleware/logger.middleware';
import config from './config/config';
import AppDataSource from './database/data-source';
import errorHandler from './middleware/globalErrorHandler.middleware';

const app: Application = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Security headers using Helmet
app.use(helmet());

// Enable CORS
app.use(cors());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rate Limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Basic route

app.get('/api', (req: Request, res: Response): void => {
  res.json('Thank you for visiting YAMAHA APP 👋🏻 !');
});

// Log requests
app.use(requestLogger);

// Global error handler
app.use(errorHandler);

// Start the database and server
AppDataSource.initialize()
  .then(() => {
    console.log('🟢 Database connection established');

    app.listen(config.app.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.app.port}`);
    });
  })
  .catch((error) => {
    console.error(
      `🔴 Error during Data Source initialization:', ${error.message}`,
    );
  });
