import { PrismaClient } from '@prisma/client'

/**
 * Prisma 客户端单例
 * 开发环境挂到 globalThis，避免热重载时重复创建连接。
 * 连接串、超时等配置由根目录 .env 的 DATABASE_URL 提供，不在代码里写死。
 */
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__pamiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__pamiPrisma = prisma
}

export default prisma
