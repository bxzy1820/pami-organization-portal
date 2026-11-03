<script setup>
import { ref } from 'vue'
import { site } from '@/data/site'

const cooperation = [
  { title: '议题沟通', text: '了解问题背景、目标与约束，一起明确研究边界和判断标准。' },
  { title: '方案共研', text: '结合技术可行性与伙伴资源共同形成方案，约定阶段目标与协作分工。' },
  { title: '联合验证', text: '在真实场景与数据中检验效果，用阶段性结论校准预期。' },
  { title: '上线与维护', text: '支持系统上线，并持续参与运行维护，让成果经得起长期使用。' }
]

const openItems = ref([])

function isOpen(index) {
  return openItems.value.includes(index)
}

function toggle(index) {
  openItems.value = isOpen(index)
    ? openItems.value.filter((item) => item !== index)
    : [...openItems.value, index]
}
</script>

<template>
  <div class="doc-page">
    <section class="doc-section doc-section--first">
      <div class="container">
        <h1 class="doc-title" v-reveal>研究方向</h1>
        <p class="doc-body doc-body--intro" v-reveal="90">
          围绕人工智能技术的研究与应用，我们从算法探索一路做到工程落地，
          并与高校、科研机构和产业伙伴联合开展创新实践。
        </p>
      </div>
    </section>

    <section class="doc-section">
      <div class="container">
        <div class="biz-list">
          <article
            v-for="(item, index) in site.business"
            :key="item.id"
            class="biz-item"
            v-reveal="index * 80"
          >
            <p class="biz-item__num">{{ String(index + 1).padStart(2, '0') }}</p>
            <div>
              <h2 class="biz-item__title">{{ item.title }}</h2>
              <p class="biz-item__text">{{ item.summary }}</p>
              <ul class="biz-item__tags">
                <li v-for="point in item.points" :key="point">{{ point }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="doc-section">
      <div class="container">
        <h2 class="doc-title" v-reveal>合作方式</h2>

        <div class="acc acc--spaced" v-reveal="90">
          <section v-for="(item, index) in cooperation" :key="item.title" class="acc__item">
            <button
              type="button"
              class="acc__head"
              :aria-expanded="isOpen(index)"
              :aria-controls="`coop-${index}`"
              @click="toggle(index)"
            >
              {{ item.title }}
              <span class="acc__icon" :class="{ 'is-open': isOpen(index) }" aria-hidden="true"></span>
            </button>
            <div :id="`coop-${index}`" class="acc__body" :class="{ 'is-open': isOpen(index) }">
              <div class="acc__inner">
                <p class="acc__text">{{ item.text }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
