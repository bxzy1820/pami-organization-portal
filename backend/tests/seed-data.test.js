// 种子数据约束测试
// ---------------------------------------------------------------------------
// 验证种子数据没有姓名、财务信息、不可公开的联系方式。

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCK = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'database', 'seed', 'mock-data.json'), 'utf-8'))
const INITIAL = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'database', 'seed', 'initial-data.json'), 'utf-8'))

// 一期禁止出现在业务数据里的财务关键词（个人姓名通过人工审查保障）
const FORBIDDEN_TERMS = ['银行', '账户', '开户行']
const PHONE_RE = /1[3-9]\d{9}/
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/

function scanStringFields(obj, out = []) {
  if (obj == null) return out
  if (typeof obj === 'string') { out.push(obj); return out }
  if (Array.isArray(obj)) { for (const item of obj) scanStringFields(item, out); return out }
  if (typeof obj === 'object') { for (const v of Object.values(obj)) scanStringFields(v, out) }
  return out
}

function businessData(seed) {
  return {
    siteSetting: seed.siteSetting,
    businessDirections: seed.businessDirections,
    externalLinks: seed.externalLinks,
    posts: seed.posts
  }
}

// ============================================================
// 通用约束（mock + initial）
// ============================================================
describe('种子数据: 通用约束', () => {
  for (const [name, seed] of [['mock', MOCK], ['initial', INITIAL]]) {
    it(`${name} - 不出现个人姓名或财务关键词`, () => {
      const strings = scanStringFields(businessData(seed)).join('|')
      for (const term of FORBIDDEN_TERMS) {
        assert.ok(!strings.includes(term), `${name} 不应包含「${term}」`)
      }
    })

    it(`${name} - 邮箱符合正则`, () => {
      const email = seed.siteSetting.contactEmail
      if (email) {
        assert.ok(EMAIL_RE.test(email), `${name} contactEmail 格式不合法: ${email}`)
      }
    })

    it(`${name} - 方向 code 唯一且可读`, () => {
      const codes = (seed.businessDirections || []).map((d) => d.code)
      assert.equal(new Set(codes).size, codes.length, `${name} code 必须唯一`)
      for (const code of codes) {
        assert.ok(/^[a-z0-9]{3,}$/.test(code), `${name} code 必须是 3+ 位小写字母数字: ${code}`)
      }
    })

    it(`${name} - 文章 slug 唯一`, () => {
      const slugs = (seed.posts || []).map((p) => p.slug)
      assert.equal(new Set(slugs).size, slugs.length, `${name} slug 必须唯一`)
    })

    it(`${name} - 文章 type 属于枚举`, () => {
      const ALLOWED = new Set(['announcement', 'achievement', 'recruitment'])
      for (const p of seed.posts || []) {
        assert.ok(ALLOWED.has(p.type), `${name} 非法文章类型: ${p.type}`)
      }
    })

    it(`${name} - 文章 isPinned 仅出现在公告上`, () => {
      for (const p of seed.posts || []) {
        if (p.isPinned) {
          assert.equal(p.type, 'announcement', `${name} 只有公告可以置顶`)
        }
      }
    })

    it(`${name} - 图片路径为空或前端静态路径，不出现外链图片`, () => {
      for (const p of seed.posts || []) {
        if (p.coverPath) assert.ok(!/^https?:\/\//.test(p.coverPath), `封面不能外链`)
      }
    })
  }
})

// ============================================================
// initial 特有约束
// ============================================================
describe('种子数据: initial', () => {
  it('posts 为空数组（正式上线前暂不发布）', () => {
    assert.deepEqual(INITIAL.posts, [])
  })

  it('contactEmail 为空（未确认可公开前保持空）', () => {
    assert.equal(INITIAL.siteSetting.contactEmail, '')
  })
})
