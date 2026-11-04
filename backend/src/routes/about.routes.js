import { Router } from 'express';
import { getAbout } from '../controllers/about.controller.js';

export const aboutRouter = Router();

/**
 * @swagger
 * /about:
 *   get:
 *     summary: 获取关于我们
 *     description: 组织简介、使命与定位、团队整体介绍、联系方式（无鉴权）
 *     tags: [关于我们]
 *     responses:
 *       200: { description: 统一返回 {code,message,data} }
 */
aboutRouter.get('/', getAbout);
