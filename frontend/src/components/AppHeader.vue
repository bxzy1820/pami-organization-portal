<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import { externalLinks, navigation } from '@/data/site'

const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

// 只有首页是全屏深色 Hero，页头透明；其余页面页头直接为白底
const solid = computed(() => route.name !== 'home' || scrolled.value)

const primaryLink = externalLinks.find((link) => link.primary)

function updateSolid() {
  scrolled.value = window.scrollY > 24
}

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

watch(open, (value) => {
  document.body.classList.toggle('is-locked', value)
})

watch(
  () => route.fullPath,
  () => {
    open.value = false
    nextTick(() => requestAnimationFrame(updateSolid))
  }
)

onMounted(() => {
  updateSolid()
  window.addEventListener('scroll', updateSolid, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateSolid)
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('is-locked')
})
</script>

<template>
  <header class="header" :class="{ 'is-solid': solid }">
    <div class="container header__inner">
      <router-link to="/" class="header__brand" aria-label="返回首页">
        <BrandLogo :tone="solid ? 'dark' : 'light'" />
      </router-link>

      <nav class="nav" aria-label="主导航">
        <router-link
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav__link"
          active-class="is-active"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header__actions">
        <a
          v-if="primaryLink"
          class="header__link"
          :href="primaryLink.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ primaryLink.label }}
        </a>
      </div>

      <button
        type="button"
        class="burger"
        :class="{ 'is-open': open }"
        :aria-expanded="open"
        aria-controls="site-drawer"
        aria-label="打开导航菜单"
        @click="open = !open"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- 抽屉挂到 body：避免 header 的 backdrop-filter 成为 fixed 定位的包含块 -->
  <Teleport to="body">
    <transition name="drawer">
      <div v-if="open" id="site-drawer" class="drawer">
        <div class="drawer__backdrop" @click="open = false"></div>
        <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="站点导航">
          <div class="drawer__top">
            <BrandLogo />
            <button type="button" class="drawer__close" aria-label="关闭导航菜单" @click="open = false">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <nav class="drawer__nav">
            <router-link
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              class="drawer__link"
              active-class="is-active"
            >
              {{ item.label }}
              <span aria-hidden="true">→</span>
            </router-link>
          </nav>

          <div class="drawer__foot">
            <a
              v-for="link in externalLinks"
              :key="link.url"
              :href="link.url"
              class="btn btn--outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </aside>
      </div>
    </transition>
  </Teleport>
</template>
