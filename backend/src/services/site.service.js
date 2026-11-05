// site.service.js
// 业务组装层：调用 Repository 获取数据，做简单加工
// 当前使用 Mock Repository，后续切换到赵天硕的真实 Repository 只需改 import

import * as repository from '../repositories/mockRepository.js';

export async function getSiteInfo() {
  return await repository.getSite();
}
