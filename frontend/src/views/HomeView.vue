<script setup>
import { ref } from 'vue'
import TypewriterTitle from '@/components/TypewriterTitle.vue'
import { site } from '@/data/site'

const typed = ref(false)

const entries = [
  { label: '关于我们', to: '/about' },
  { label: '研究方向', to: '/business' },
  { label: '项目成果', to: '/projects' }
]

const arrow = 'M6 18L18 6M18 6H9M18 6v9'
</script>

<template>
  <div>
    <!-- Hero：全屏影像 + 打字标语 -->
    <section class="hero">
      <div class="hero__media" aria-hidden="true"></div>
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="container hero__inner">
        <TypewriterTitle :lines="site.hero.titleLines" @finish="typed = true" />

        <div class="hero__foot">
          <router-link
            to="/about"
            class="circle-btn hero__cta"
            :class="{ 'is-shown': typed }"
            aria-label="了解我们"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
              <path :d="arrow" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
      </div>

      <span class="scroll-hint" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 4v15M6 13l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </section>

    <!-- 栏目目录 -->
    <section class="section">
      <div class="container">
        <ul class="index-list">
          <li v-for="(item, index) in entries" :key="item.to">
            <router-link :to="item.to" class="index-link">
              <span class="index-link__num">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="index-link__title">{{ item.label }}</span>
              <span class="index-link__arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path :d="arrow" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
