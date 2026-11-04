import prisma from '../prisma/client.js'
import { createSiteRepository } from './site.repository.js'
import { createHomeRepository } from './home.repository.js'
import { createAboutRepository } from './about.repository.js'
import { createBusinessRepository } from './business.repository.js'
import { createPostRepository } from './post.repository.js'
import { createExternalLinkRepository } from './external-link.repository.js'
import { createMediaFileRepository } from './media-file.repository.js'

/**
 * 默认数据访问层（使用共享的 Prisma 客户端）
 * 测试时可直接调用各 createXRepository(fakeDb) 注入内存实现。
 */
export const siteRepository = createSiteRepository(prisma)
export const homeRepository = createHomeRepository(prisma)
export const aboutRepository = createAboutRepository(prisma)
export const businessRepository = createBusinessRepository(prisma)
export const postRepository = createPostRepository(prisma)
export const externalLinkRepository = createExternalLinkRepository(prisma)
export const mediaFileRepository = createMediaFileRepository(prisma)

export const repositories = Object.freeze({
  site: siteRepository,
  home: homeRepository,
  about: aboutRepository,
  business: businessRepository,
  post: postRepository,
  externalLink: externalLinkRepository,
  mediaFile: mediaFileRepository
})

export default repositories
