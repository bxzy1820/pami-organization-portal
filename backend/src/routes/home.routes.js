import { Router } from 'express';
import { getHome } from '../controllers/home.controller.js';

export const homeRouter = Router();

/**
 * @swagger
 * /home:
 *   get:
 *     summary: 获取首页内容
 *     description: 标语、首页简介、研究方向预览（无鉴权）
 *     tags: [首页]
 *     responses:
 *       200: { description: 统一返回 {code,message,data} }
 */
homeRouter.get('/', getHome);
