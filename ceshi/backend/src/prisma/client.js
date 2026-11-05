// Prisma 客户端单例
// ---------------------------------------------------------------------------
// 复用 Node 全局变量在热重载/多模块间共享，避免重复创建连接池。
// 测试中通过 createFakeDb() 注入假客户端，不会走到这里。

import { PrismaClient } from '@prisma/client'

const GLOBAL_KEY = 'pami_prisma_client'

/** 返回共享 Prisma 单例。进程退出时无需手动断开。 */
export function getPrisma() {
  if (globalThis[GLOBAL_KEY]) return globalThis[GLOBAL_KEY]

  const client = new PrismaClient()
  globalThis[GLOBAL_KEY] = client
  return client
}

export default getPrisma
