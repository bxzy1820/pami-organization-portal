import { Router } from 'express';
import { getBusiness } from '../controllers/business.controller.js';

export const businessRouter = Router();

/**
 * @swagger
 * /business:
 *   get:
 *     summary: 获取业务/研究方向
 *     description: 研究方向列表（无鉴权）
 *     tags: [研究方向]
 *     responses:
 *       200: { description: 统一返回 {code,message,data} }
 */
businessRouter.get('/', getBusiness);
