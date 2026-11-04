import { Router } from 'express';
import { getSite } from '../controllers/site.controller.js';

export const siteRouter = Router();

/**
 * @swagger
 * /site:
 *   get:
 *     summary: 获取站点基础信息
 *     description: 组织名称、简介、使命、团队介绍、联系方式、外部链接（无鉴权）
 *     tags: [站点]
 *     responses:
 *       200: { description: 统一返回 {code,message,data} }
 */
siteRouter.get('/', getSite);
