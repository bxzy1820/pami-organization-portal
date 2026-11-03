<script setup>
import { sections } from '@/data/site'

const { projects } = sections
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
        <div class="placeholder" v-reveal>
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
