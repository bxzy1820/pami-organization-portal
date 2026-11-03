<script setup>
import { ref } from 'vue'
import { externalLinks, site } from '@/data/site'

const year = new Date().getFullYear()
const email = site.contact.email

const groups = [
  {
    key: 'about',
    title: '关于',
    links: [
      { label: '关于我们', to: '/about' },
      { label: '我们的路径', to: '/about' },
      { label: '研究方向', to: '/business' }
    ]
  },
  {
    key: 'business',
    title: '研究方向',
    links: site.business.map((item) => ({ label: item.title, to: '/business' }))
  },
  {
    key: 'more',
    title: '更多',
    links: [
      { label: '项目成果', to: '/projects' },
      ...externalLinks.map((link) => ({ label: link.label, href: link.url, external: true })),
      ...(email ? [{ label: email, href: `mailto:${email}` }] : [])
    ]
  }
]

const openKeys = ref([])

function isOpen(key) {
  return openKeys.value.includes(key)
}

function toggle(key) {
  openKeys.value = isOpen(key)
    ? openKeys.value.filter((item) => item !== key)
    : [...openKeys.value, key]
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__groups">
        <section v-for="group in groups" :key="group.key" class="fgroup">
          <button
            type="button"
            class="fgroup__head"
            :aria-expanded="isOpen(group.key)"
            :aria-controls="`footer-${group.key}`"
            @click="toggle(group.key)"
          >
            {{ group.title }}
            <span class="fgroup__icon" :class="{ 'is-open': isOpen(group.key) }" aria-hidden="true"></span>
          </button>

          <div :id="`footer-${group.key}`" class="fgroup__body" :class="{ 'is-open': isOpen(group.key) }">
            <div class="fgroup__inner">
              <nav class="fgroup__links" :aria-label="group.title">
                <template v-for="link in group.links" :key="link.label">
                  <router-link v-if="link.to" :to="link.to">{{ link.label }}</router-link>
                  <a
                    v-else
                    :href="link.href"
                    :target="link.external ? '_blank' : undefined"
                    :rel="link.external ? 'noopener noreferrer' : undefined"
                  >
                    {{ link.label }}
                  </a>
                </template>
              </nav>
            </div>
          </div>
        </section>
      </div>

      <div class="footer__legal">
        <span>© {{ year }} {{ site.name }}</span>
        <span>统一社会信用代码：{{ site.uscc }}</span>
      </div>
    </div>
  </footer>
</template>
