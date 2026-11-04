import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '葩米科技组织门户 API',
      version: '1.0.0',
      description: '一期公开只读接口，无鉴权，统一返回 {code,message,data}',
    },
    servers: [
      { url: 'http://localhost:3000', description: '本地开发' },
    ],
  },
  // 扫描 routes 目录里的 JSDoc 注解
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
