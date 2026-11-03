<script setup>
import { site } from '@/data/site'

defineProps({
  size: { type: Number, default: 34 },
  tone: { type: String, default: 'dark' }, // dark：浅色背景上使用；light：深色背景上使用
  showText: { type: Boolean, default: true }
})
</script>

<template>
  <span class="brand" :class="`brand--${tone}`">
    <svg
      class="brand__mark"
      :width="size"
      :height="size"
      viewBox="0 0 40 40"
      role="img"
      aria-label="组织标识"
    >
      <g fill="currentColor">
        <ellipse cx="20" cy="20" rx="3.7" ry="7.9" />
        <ellipse cx="20" cy="20" rx="3.7" ry="7.9" transform="rotate(45 20 20)" />
        <ellipse cx="20" cy="20" rx="3.7" ry="7.9" transform="rotate(90 20 20)" />
        <ellipse cx="20" cy="20" rx="3.7" ry="7.9" transform="rotate(135 20 20)" />
      </g>
    </svg>
    <span v-if="showText" class="brand__text">
      <span class="brand__name">{{ site.shortName }}</span>
      <span class="brand__sub">{{ site.brandSub }}</span>
    </span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand__mark {
  flex: none;
  color: var(--brand);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__name {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--ink);
}

.brand__sub {
  margin-top: 4px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-3);
  white-space: nowrap;
}

.brand--light .brand__mark {
  color: #fff;
}

.brand--light .brand__name {
  color: #fff;
}

.brand--light .brand__sub {
  color: rgba(255, 255, 255, 0.5);
}
</style>
