<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <a class="skip-link" href="#main">跳到主要内容</a>
  <AppHeader />
  <main id="main">
    <router-view />
  </main>
  <AppFooter />
</template>
