// post.controller.js
// 接收请求、解析参数、调用 service、统一返回

import { success } from '../common/response.js';
import {
  getProjects as fetchProjects,
  getNews as fetchNews,
  getRecruitment as fetchRecruitment,
} from '../services/post.service.js';

/**
 * 解析分页参数
 * v1.1 约定：page 默认1最小1；pageSize 默认20最小1最大100
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let pageSize = parseInt(query.pageSize, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;
  return { page, pageSize };
}

export async function getProjects(req, res, next) {
  try {
    const data = await fetchProjects();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getNews(req, res, next) {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const data = await fetchNews(page, pageSize);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getRecruitment(req, res, next) {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const data = await fetchRecruitment(page, pageSize);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
