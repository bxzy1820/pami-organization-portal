<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { loadSite, siteError } from '@/data/site'

onMounted(() => {
  loadSite().catch(() => {})
})
</script>

<template>
  <a class="skip-link" href="#main">跳到主要内容</a>
  <AppHeader />
  <main id="main">
    <div v-if="siteError" class="api-alert" role="alert">
      站点基础信息暂时无法更新：{{ siteError }}
    </div>
    <router-view />
  </main>
  <AppFooter />
</template>
