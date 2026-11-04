import { Router } from 'express';
import { getProjects } from '../controllers/projects.controller.js';

export const projectsRouter = Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: 获取项目成果列表（分页）
 *     tags: [项目成果]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 }, description: 页码 }
 *       - { name: size, in: query, schema: { type: integer, default: 10, maximum: 50 }, description: 每页条数 }
 *     responses:
 *       200: { description: 统一返回 {code,message,data:{list,total,page,size}} }
 */
projectsRouter.get('/', getProjects);
