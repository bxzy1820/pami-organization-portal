// post.service.js
// projects / news / recruitment 共用：按 type 调用 Repository
// 业务组装层：不写死数据，不直接操作数据库，只调用 Repository

import * as repository from '../repositories/databaseRepository.js';

/**
 * 获取项目成果列表
 * Repository: getProjects()
 */
export async function getProjects() {
  return await repository.getProjects();
}

/**
 * 获取公告动态列表（分页）
 * Repository: getNews(page, pageSize)
 */
export async function getNews(page, pageSize) {
  return await repository.getNews(page, pageSize);
}

/**
 * 获取招聘列表（分页）
 * Repository: getRecruitment(page, pageSize)
 */
export async function getRecruitment(page, pageSize) {
  return await repository.getRecruitment(page, pageSize);
}
