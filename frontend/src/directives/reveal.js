/**
 * v-reveal：元素进入视口时淡入上移。
 * 用法：v-reveal 或 v-reveal="120"（延迟毫秒，用于错峰）
 * 可叠加 .reveal--scale 让元素从轻微放大回落到原尺寸。
 */
let observer = null

function getObserver() {
  if (observer) return observer

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  return observer
}

export default {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`

    getObserver().observe(el)
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  }
}
