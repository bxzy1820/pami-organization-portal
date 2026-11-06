import { createRouter, createWebHistory } from 'vue-router'
import { site } from '@/data/site'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', description: '雄安葩米官方门户，介绍组织概况、研究方向与合作方式。' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于我们', description: '了解雄安葩米简介、使命、行事准则与办公地点。' }
  },
  {
    path: '/business',
    name: 'business',
    component: () => import('@/views/BusinessView.vue'),
    meta: { title: '研究方向', description: '雄安葩米的主要研究方向与联合实践。' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { title: '项目成果', description: '项目案例、技术成果与伙伴合作实践。' }
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: '动态', description: '了解组织近期公告、活动与阶段性进展。' }
  },
  {
    path: '/recruitment',
    name: 'recruitment',
    component: () => import('@/views/RecruitmentView.vue'),
    meta: { title: '加入我们', description: '查看当前开放的合作与招募信息。' }
  },
  // 已下线栏目的旧地址，统一回到首页
  { path: '/team', redirect: '/' },
  { path: '/join', redirect: '/recruitment' },
  { path: '/contact', redirect: '/' },
  {
    // 兼容直接访问 /index.html（例如预览工具、静态服务器默认入口）
    path: '/index.html',
    redirect: '/'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${site.shortName}` : site.name
  if (to.meta.description) {
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', to.meta.description)
  }
})

export default router
