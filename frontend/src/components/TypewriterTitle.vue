<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  lines: { type: Array, required: true },
  speed: { type: Number, default: 110 },
  startDelay: { type: Number, default: 260 },
  linePause: { type: Number, default: 220 }
})

const emit = defineEmits(['finish'])

const shown = ref(props.lines.map(() => ''))
const finished = ref(false)

let timer = null
let disposed = false

// 正在输入的那一行显示光标
const caretIndex = computed(() => {
  if (finished.value) return -1
  return shown.value.findIndex((text, index) => text.length < props.lines[index].length)
})

function schedule(fn, delay) {
  timer = window.setTimeout(fn, delay)
}

function typeLine(lineIndex, charIndex) {
  if (disposed) return

  const line = props.lines[lineIndex]
  shown.value[lineIndex] = line.slice(0, charIndex)

  if (charIndex >= line.length) {
    if (lineIndex === props.lines.length - 1) {
      finished.value = true
      emit('finish')
      return
    }
    schedule(() => typeLine(lineIndex + 1, 1), props.linePause)
    return
  }

  schedule(() => typeLine(lineIndex, charIndex + 1), props.speed)
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    shown.value = [...props.lines]
    finished.value = true
    emit('finish')
    return
  }
  schedule(() => typeLine(0, 1), props.startDelay)
})

onBeforeUnmount(() => {
  disposed = true
  window.clearTimeout(timer)
})
</script>

<template>
  <h1 class="hero__title">
    <span class="sr-only">{{ lines.join('') }}</span>

    <span v-for="(line, index) in lines" :key="line" class="tw-line" aria-hidden="true">
      <span class="tw-ghost">{{ line }}</span>
      <span class="tw-typed">
        {{ shown[index] }}<i v-if="caretIndex === index" class="tw-caret"></i>
      </span>
    </span>
  </h1>
</template>

<style scoped>
.tw-line {
  position: relative;
  display: block;
}

/* 占位文本负责撑开高度，避免打字过程中布局跳动 */
.tw-ghost {
  visibility: hidden;
}

.tw-typed {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.tw-caret {
  display: inline-block;
  width: 0.055em;
  height: 0.82em;
  margin-left: 0.08em;
  vertical-align: -0.04em;
  background: currentColor;
  animation: caretBlink 1s steps(1, end) infinite;
}

@keyframes caretBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tw-caret {
    display: none;
  }
}
</style>
