<script setup>
import PagedPostList from '@/components/PagedPostList.vue'
</script>

<template>
  <PagedPostList
    kind="news"
    title="动态"
    description="了解组织近期公告、活动与阶段性进展。"
    empty-text="暂无已发布的动态。"
  />
</template>

