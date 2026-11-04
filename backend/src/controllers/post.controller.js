import { success, BizError, ErrorCode } from '../common/response.js';
import { getPostList } from '../services/post.service.js';

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let size = parseInt(query.size, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(size) || size < 1) size = 10;
  if (size > 50) size = 50; // 契约已定稿：最大 50
  return { page, size };
}

export async function getProjects(req, res, next) {
  try {
    const { page, size } = parsePagination(req.query);
    const data = await getPostList('achievement', page, size);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getNews(req, res, next) {
  try {
    const { page, size } = parsePagination(req.query);
    const data = await getPostList('announcement', page, size);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getRecruitment(req, res, next) {
  try {
    const { page, size } = parsePagination(req.query);
    const data = await getPostList('recruitment', page, size);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
