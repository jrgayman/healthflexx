import express from 'express';
import cors from 'cors';
import pinoHttp from 'express-pino-logger';
import { logger } from './logger.js';

export const configureExpress = (app) => {
  app.use(cors());
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ 
      error: 'Something broke!',
      message: err.message 
    });
  });
};