// site.service.js
// 业务组装层：调用 Repository 获取数据，做简单加工
// 使用 Prisma 真实 Repository 读取数据库

import * as repository from '../repositories/databaseRepository.js';

export async function getSiteInfo() {
  return await repository.getSite();
}
