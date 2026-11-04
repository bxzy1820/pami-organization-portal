import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Swagger 在线文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 业务接口
app.use(API_PREFIX, apiRouter);

// 404 + 全局异常
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ 后端已启动: http://localhost:${PORT}`);
  console.log(`📚 Swagger 文档: http://localhost:${PORT}/api-docs`);
  console.log(`🔌 API 前缀: ${API_PREFIX}`);
});

export default app;
