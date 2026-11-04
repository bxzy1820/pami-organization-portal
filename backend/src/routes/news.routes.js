import { Router } from 'express';
import { getNews } from '../controllers/news.controller.js';

export const newsRouter = Router();

/**
 * @swagger
 * /news:
 *   get:
 *     summary: 获取公告动态列表（分页）
 *     tags: [公告动态]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 }, description: 页码 }
 *       - { name: size, in: query, schema: { type: integer, default: 10, maximum: 50 }, description: 每页条数 }
 *     responses:
 *       200: { description: 统一返回 {code,message,data:{list,total,page,size}} }
 */
newsRouter.get('/', getNews);
