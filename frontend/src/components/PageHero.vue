<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑导航">
        <router-link to="/">首页</router-link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ eyebrow || title }}</span>
      </nav>

      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="description" class="page-hero__desc">{{ description }}</p>
    </div>
  </section>
</template>
