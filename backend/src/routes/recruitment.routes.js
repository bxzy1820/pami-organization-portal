import { Router } from 'express';
import { getRecruitment } from '../controllers/recruitment.controller.js';

export const recruitmentRouter = Router();

/**
 * @swagger
 * /recruitment:
 *   get:
 *     summary: 获取加入我们/招聘列表（分页）
 *     tags: [加入我们]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 }, description: 页码 }
 *       - { name: size, in: query, schema: { type: integer, default: 10, maximum: 50 }, description: 每页条数 }
 *     responses:
 *       200: { description: 统一返回 {code,message,data:{list,total,page,size}} }
 */
recruitmentRouter.get('/', getRecruitment);
