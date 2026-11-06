<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { sections } from '@/data/site'
import { portalApi } from '@/api/client'

const { projects } = sections
const loading = ref(true)
const error = ref('')
const result = ref({ items: [], total: 0, page: 1, pageSize: 20 })
const controller = new AbortController()

onMounted(async () => {
  try {
    const data = await portalApi.getProjects({ signal: controller.signal })
    result.value = { ...result.value, ...(data || {}) }
  } catch (requestError) {
    if (requestError.name !== 'AbortError') error.value = requestError.message || '项目成果加载失败'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => controller.abort())
</script>

<template>
  <div class="doc-page">
    <section class="doc-section doc-section--first">
      <div class="container">
        <h1 class="doc-title" v-reveal>项目成果</h1>
        <p class="doc-body doc-body--intro" v-reveal="90">{{ projects.description }}</p>
      </div>
    </section>

    <section class="doc-section">
      <div class="container">
        <p v-if="loading" class="api-state" role="status">正在加载项目成果…</p>
        <div v-else-if="error" class="api-state api-state--error" role="alert">
          {{ error }}，请确认后端与数据库服务是否正常。
        </div>
        <div v-else-if="result.items.length" class="content-list">
          <article v-for="(item, index) in result.items" :key="item.slug || `${item.title}-${index}`" class="content-item">
            <div class="content-item__meta">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <time v-if="item.date">{{ item.date }}</time>
            </div>
            <div>
              <h2 class="content-item__title">{{ item.title }}</h2>
              <p class="content-item__desc">{{ item.desc || '暂无项目简介' }}</p>
            </div>
          </article>
        </div>
        <div v-else class="placeholder" v-reveal>
          <p class="placeholder__status">栏目建设中</p>
          <p class="placeholder__title">内容整理中</p>
          <p class="placeholder__text">{{ projects.empty }}</p>
          <router-link to="/business" class="btn btn--primary mt-16">了解研究方向</router-link>
        </div>
      </div>
    </section>

    <section class="doc-section">
      <div class="container">
        <h2 class="doc-title" v-reveal>栏目规划</h2>

        <div class="plan-list" v-reveal="90">
          <article v-for="(plan, index) in projects.plans" :key="plan" class="plan-item">
            <p class="plan-item__num">{{ String(index + 1).padStart(2, '0') }}</p>
            <h3 class="plan-item__title">{{ plan }}</h3>
            <p class="plan-item__text">记录项目背景、技术方案、实施过程与阶段性成效。</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
