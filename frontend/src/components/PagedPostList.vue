<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { portalApi } from '@/api/client'

const props = defineProps({
  kind: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  emptyText: { type: String, required: true }
})

const page = ref(1)
const pageSize = 10
const loading = ref(true)
const error = ref('')
const result = ref({ items: [], total: 0, page: 1, pageSize })
let controller

const pageCount = computed(() => Math.max(1, Math.ceil(result.value.total / result.value.pageSize)))

async function load(targetPage = page.value) {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = ''

  try {
    const loader = props.kind === 'news' ? portalApi.getNews : portalApi.getRecruitment
    const data = await loader(targetPage, pageSize, { signal: controller.signal })
    result.value = { ...result.value, ...(data || {}) }
    page.value = result.value.page
  } catch (requestError) {
    if (requestError.name !== 'AbortError') error.value = requestError.message || '列表加载失败'
  } finally {
    loading.value = false
  }
}

function changePage(nextPage) {
  if (nextPage < 1 || nextPage > pageCount.value || nextPage === page.value) return
  load(nextPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => load())
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div class="doc-page">
    <section class="doc-section doc-section--first">
      <div class="container">
        <h1 class="doc-title" v-reveal>{{ title }}</h1>
        <p class="doc-body doc-body--intro" v-reveal="90">{{ description }}</p>
      </div>
    </section>

    <section class="doc-section">
      <div class="container">
        <p v-if="loading" class="api-state" role="status">正在加载{{ title }}…</p>
        <div v-else-if="error" class="api-state api-state--error" role="alert">
          <p>{{ error }}</p>
          <button type="button" class="btn btn--primary mt-16" @click="load(page)">重新加载</button>
        </div>
        <div v-else-if="result.items.length" class="content-list">
          <article v-for="(item, index) in result.items" :key="item.slug || `${item.title}-${index}`" class="content-item">
            <div class="content-item__meta">
              <span v-if="item.pinned" class="content-item__badge">置顶</span>
              <span v-else>{{ String((page - 1) * pageSize + index + 1).padStart(2, '0') }}</span>
              <time v-if="item.date">{{ item.date }}</time>
            </div>
            <div>
              <h2 class="content-item__title">{{ item.title }}</h2>
              <p class="content-item__desc">{{ item.desc || '暂无详细说明' }}</p>
            </div>
          </article>

          <nav v-if="pageCount > 1" class="pagination" :aria-label="`${title}分页`">
            <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
            <span>第 {{ page }} / {{ pageCount }} 页，共 {{ result.total }} 条</span>
            <button type="button" :disabled="page >= pageCount" @click="changePage(page + 1)">下一页</button>
          </nav>
        </div>
        <div v-else class="api-state api-state--empty">
          <p>{{ emptyText }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

