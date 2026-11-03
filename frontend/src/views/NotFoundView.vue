<script setup>
import { useRoute } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import { site } from '@/data/site'

const route = useRoute()
</script>

<template>
  <div>
    <PageHero
      eyebrow="404"
      title="页面不存在"
      description="你访问的页面可能已被移动或删除，可以回到首页继续浏览。"
    />

    <section class="section">
      <div class="container">
        <p class="statement">
          <strong>没有找到这个页面。</strong>如果是从收藏夹或旧链接进入，欢迎回到首页，重新开始浏览。
        </p>
        <div class="actions mt-32">
          <router-link to="/" class="btn btn--primary">返回首页</router-link>
          <router-link to="/about" class="btn btn--outline">关于我们</router-link>
        </div>
        <p class="fine mt-48">当前访问地址：{{ route.fullPath }}</p>
        <p class="fine mt-16">© {{ new Date().getFullYear() }} {{ site.name }}</p>
      </div>
    </section>
  </div>
</template>
