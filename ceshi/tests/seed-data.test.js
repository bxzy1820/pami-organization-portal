import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadSeed(name) {
  return JSON.parse(readFileSync(path.join(ROOT, 'database', 'seed', `${name}-data.json`), 'utf8'))
}

const mock = loadSeed('mock')
const initial = loadSeed('initial')

function collectStrings(value, output = []) {
  if (typeof value === 'string') output.push(value)
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output))
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, output))
  return output
}

function assertString(value, label) {
  assert.equal(typeof value, 'string', `${label} 必须是字符串`)
  assert.ok(value.trim().length > 0, `${label} 不能为空`)
}

const POST_TYPES = ['announcement', 'achievement', 'recruitment']
const POST_STATUSES = ['draft', 'published', 'offline']

describe('种子数据: 结构一致性', () => {
  it('mock 与 initial 顶层结构一致，导入脚本可共用', () => {
    assert.deepEqual(Object.keys(mock).sort(), Object.keys(initial).sort())
    for (const key of ['siteSettings', 'businessDirections', 'externalLinks', 'posts', 'mediaFiles']) {
      assert.ok(Array.isArray(mock[key]) || typeof mock[key] === 'object', `缺少 ${key}`)
    }
    assert.deepEqual(
      Object.keys(mock.siteSettings).sort(),
      Object.keys(initial.siteSettings).sort(),
      '两份 siteSettings 字段必须一致'
    )
  })

  it('meta 标注正确，模拟数据不得用于正式环境', () => {
    assert.equal(mock.meta.isMock, true)
    assert.equal(initial.meta.isMock, false)
    assert.match(mock.meta.warning, /测试数据/)
    assert.ok(mock.meta.updatedAt && initial.meta.updatedAt)
  })
})

describe('种子数据: 模拟数据', () => {
  it('组织名称与简介明确标注为测试内容', () => {
    assert.match(mock.siteSettings.name, /测试/)
    assert.match(mock.siteSettings.shortName, /测试/)
    assert.match(mock.siteSettings.intro, /测试数据/)
    for (const post of mock.posts) assert.match(post.title, /测试/)
  })

  it('覆盖三种状态与三种文章类型，便于验证公开接口过滤', () => {
    assert.ok(mock.posts.some((post) => post.type === 'announcement'))
    assert.ok(mock.posts.some((post) => post.type === 'achievement'))
    assert.ok(mock.posts.some((post) => post.type === 'recruitment'))
    assert.ok(mock.posts.some((post) => post.status === 'draft'))
    assert.ok(mock.posts.some((post) => post.status === 'offline'))
    assert.ok(mock.posts.some((post) => post.status === 'published'))
  })

  it('含未启用的研究方向与外部链接，用于验证公开接口过滤', () => {
    assert.ok(mock.businessDirections.some((row) => row.isActive === false))
    assert.ok(mock.externalLinks.some((row) => row.isActive === false))
  })
})

describe('种子数据: 正式初始数据', () => {
  it('只包含确认可公开的组织级信息，不含财务与成员资料', () => {
    // meta 是说明文字（本身会提到“不含银行账户”），只扫描实际业务数据
    const businessData = {
      siteSettings: initial.siteSettings,
      businessDirections: initial.businessDirections,
      externalLinks: initial.externalLinks,
      posts: initial.posts,
      mediaFiles: initial.mediaFiles
    }
    const strings = collectStrings(businessData)
    const forbidden = /银行|账户|开户行|存款|账号|银行卡|身份证|手机号|工资|税号|bank|account/i
    for (const text of strings) {
      assert.ok(!forbidden.test(text), `初始数据不应包含财务/隐私信息：${text}`)
    }

    // 不应出现手机号或个人邮箱
    for (const text of strings) {
      assert.ok(!/1[3-9]\d{9}/.test(text), `不应包含手机号：${text}`)
      assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(text), `不应包含个人邮箱：${text}`)
    }
  })

  it('组织名称、信用代码、地址、简介等必填字段完整', () => {
    const settings = initial.siteSettings
    for (const field of ['name', 'shortName', 'slogan', 'intro']) {
      assertString(settings[field], `siteSettings.${field}`)
    }
    assertString(settings.uscc, 'siteSettings.uscc')
    assert.match(settings.address, /雄安/)
    assertString(settings.park, 'siteSettings.park')
    assertString(settings.addressNote, 'siteSettings.addressNote')
  })

  it('联系邮箱留空，未确认公开前不展示', () => {
    assert.equal(initial.siteSettings.contactEmail, '')
  })

  it('导航、研究方向、外部链接、关于我们结构完整', () => {
    const settings = initial.siteSettings

    assert.ok(settings.navigation.length >= 4)
    for (const nav of settings.navigation) {
      assertString(nav.label, 'navigation.label')
      assert.match(nav.to, /^\//)
    }

    assert.equal(initial.businessDirections.length, 4)
    for (const row of initial.businessDirections) {
      assertString(row.code, 'businessDirections.code')
      assertString(row.title, 'businessDirections.title')
      assertString(row.summary, 'businessDirections.summary')
      assert.ok(Array.isArray(row.points) && row.points.length === 3)
      assert.equal(typeof row.sortOrder, 'number')
      assert.equal(typeof row.isActive, 'boolean')
    }

    assert.equal(settings.values.length, 3)
    for (const value of settings.values) {
      assertString(value.title, 'values.title')
      assertString(value.text, 'values.text')
      assert.equal(value.points.length, 3)
    }
    assert.equal(settings.collaboration.length, 3)
    assert.equal(settings.cooperation.length, 4)
    assert.equal(settings.teamFunctions.length, 3)
    assert.equal(settings.culture.quoteLead.length, 3)
    assert.equal(settings.culture.quoteTeam.length, 3)
    assert.ok(settings.mission.lines.length === 2)
    assert.ok(settings.hero.titleLines.length === 2)
    assert.equal(settings.journey.paragraphs.length, 4)
  })

  it('外部链接包含 Skill Hub，并标记为页头主链接', () => {
    const skill = initial.externalLinks.find((link) => link.url === 'http://124.223.224.129:8080/')
    assert.ok(skill, '必须包含 Skill Hub 地址')
    assert.equal(skill.isPrimary, true)
    for (const link of initial.externalLinks) {
      assert.match(link.url, /^http(s)?:\/\//)
    }
  })

  it('公告、成果、招聘暂不导入正式记录', () => {
    assert.deepEqual(initial.posts, [])
    assert.equal(initial.siteSettings.projectsSection.plans.length, 3)
    assertString(initial.siteSettings.projectsSection.empty, 'projectsSection.empty')
    assertString(initial.siteSettings.recruitmentSection.empty, 'recruitmentSection.empty')
  })
})

describe('种子数据: 通用约束', () => {
  it('文章类型、状态、slug 唯一性、发布时间符合约定', () => {
    for (const [label, data] of [['mock', mock], ['initial', initial]]) {
      const slugs = new Set()
      for (const post of data.posts) {
        assert.ok(POST_TYPES.includes(post.type), `${label} 文章类型非法：${post.type}`)
        assert.ok(POST_STATUSES.includes(post.status), `${label} 内容状态非法：${post.status}`)
        assert.ok(!slugs.has(post.slug), `${label} slug 重复：${post.slug}`)
        slugs.add(post.slug)
        assertString(post.title, `${label} posts.title`)

        if (post.status === 'published') {
          assert.ok(post.publishedAt, `${label} 已发布文章必须有 publishedAt：${post.slug}`)
          assert.ok(!Number.isNaN(new Date(post.publishedAt).getTime()), `${label} publishedAt 不是合法日期`)
        }
      }
    }
  })

  it('研究方向 code 唯一且可读', () => {
    for (const [label, data] of [['mock', mock], ['initial', initial]]) {
      const codes = new Set()
      for (const row of data.businessDirections) {
        assert.match(row.code, /^[a-z][a-z0-9-]*$/i, `${label} code 命名不规范：${row.code}`)
        assert.ok(!codes.has(row.code), `${label} code 重复：${row.code}`)
        codes.add(row.code)
      }
    }
  })

  it('图片路径为空或前端静态路径，不出现外链图片', () => {
    for (const settings of [mock.siteSettings, initial.siteSettings]) {
      for (const field of ['logoPath', 'heroBgPath']) {
        const value = settings[field]
        assert.ok(value === null || value === '' || value.startsWith('/'), `${field} 必须是前端静态路径`)
      }
    }
    for (const post of [...mock.posts, ...initial.posts]) {
      assert.ok(post.coverPath === null || post.coverPath === '' || post.coverPath.startsWith('/'))
    }
  })
})
