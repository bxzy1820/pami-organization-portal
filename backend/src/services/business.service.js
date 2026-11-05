// business.service.js
// 业务组装层：调用 Repository 获取数据，做简单加工

import * as repository from '../repositories/databaseRepository.js';

export async function getBusinessList() {
  return await repository.getBusiness();
}
