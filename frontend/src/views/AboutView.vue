<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { site } from '@/data/site'
import { portalApi } from '@/api/client'

const about = site.about
const values = about.values
const loading = ref(true)
const error = ref('')
const controller = new AbortController()

onMounted(async () => {
  try {
    const data = await portalApi.getAbout({ signal: controller.signal })
    if (data?.intro) site.intro = data.intro
    if (data?.mission) about.mission.text = data.mission
    if (data?.teamIntro) about.team.intro = data.teamIntro
    if (data?.contact?.email) site.contact.email = data.contact.email
    if (data?.contact?.address) {
      site.address = data.contact.address
      about.place.value = data.contact.address
    }
  } catch (requestError) {
    if (requestError.name !== 'AbortError') error.value = requestError.message || '关于页面加载失败'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => controller.abort())

/* 价值观轮播 */
const slide = ref(0)
const viewport = ref(null)

function goTo(index) {
  const total = values.length
  const next = (index + total) % total
  slide.value = next
  if (viewport.value) {
    viewport.value.scrollTo({
      left: next * (viewport.value.clientWidth + 24),
      behavior: 'smooth'
    })
  }
}

function onSlide() {
  if (!viewport.value) return
  slide.value = Math.round(viewport.value.scrollLeft / (viewport.value.clientWidth + 24))
}

/* 协作方式折叠 */
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
    <div class="container api-state-wrap">
      <p v-if="loading" class="api-state" role="status">正在加载组织信息…</p>
      <div v-else-if="error" class="api-state api-state--error" role="alert">
        {{ error }}，当前展示本地兜底内容。
      </div>
    </div>

    <!-- 我们的使命 -->
    <section class="doc-section doc-section--first">
      <div class="container">
        <h1 class="doc-title" v-reveal>{{ about.mission.title }}</h1>

        <div class="mission-copy">
          <p class="mission-statement">
            <span
              v-for="(line, index) in about.mission.lines"
              :key="line"
              :class="`is-${index + 1}`"
              v-reveal="index * 140"
            >
              {{ line }}
            </span>
          </p>
          <p class="doc-body mt-32" v-reveal="300">{{ about.mission.text }}</p>
        </div>
      </div>
    </section>

    <!-- 我们的文化 -->
    <section class="doc-section">
      <div class="container">
        <h2 class="doc-title" v-reveal>{{ about.culture.title }}</h2>
        <p class="doc-body about-body--intro" v-reveal="90">{{ about.culture.intro }}</p>

        <p class="about-quote" v-reveal>
          {{ about.culture.quoteLead[0] }}<em>{{ about.culture.quoteLead[1] }}</em>{{ about.culture.quoteLead[2] }}
        </p>

        <!-- 行事准则轮播 -->
        <div class="vcarousel" v-reveal="90">
          <div ref="viewport" class="vcarousel__viewport" @scroll.passive="onSlide">
            <article v-for="(value, index) in values" :key="value.title" class="vcard">
              <div class="vcard__body">
                <h3 class="vcard__title">{{ value.title }}</h3>
                <ul class="vcard__list">
                  <li v-for="point in value.points" :key="point">{{ point }}</li>
                </ul>
              </div>
              <div
                class="vcard__media"
                :class="`is-${index + 1}`"
                :style="{ backgroundImage: `url(${value.image})` }"
                aria-hidden="true"
              ></div>
            </article>
          </div>

          <div class="vcarousel__controls">
            <button type="button" class="vcarousel__btn" aria-label="上一项" @click="goTo(slide - 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <div class="vcarousel__dots">
              <button
                v-for="(value, index) in values"
                :key="value.title"
                type="button"
                class="vcarousel__dot"
                :class="{ 'is-active': slide === index }"
                :aria-label="`第 ${index + 1} 项`"
                :aria-current="slide === index"
                @click="goTo(index)"
              ></button>
            </div>

            <button type="button" class="vcarousel__btn" aria-label="下一项" @click="goTo(slide + 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <p class="about-quote about-quote--tight" v-reveal>
          {{ about.culture.quoteTeam[0] }}<em>{{ about.culture.quoteTeam[1] }}</em>{{ about.culture.quoteTeam[2] }}
        </p>

        <!-- 协作方式 -->
        <div class="acc" v-reveal="90">
          <section v-for="(item, index) in about.collaboration" :key="item.title" class="acc__item">
            <button
              type="button"
              class="acc__head"
              :aria-expanded="isOpen(index)"
              :aria-controls="`collab-${index}`"
              @click="toggle(index)"
            >
              {{ item.title }}
              <span class="acc__icon" :class="{ 'is-open': isOpen(index) }" aria-hidden="true"></span>
            </button>
            <div :id="`collab-${index}`" class="acc__body" :class="{ 'is-open': isOpen(index) }">
              <div class="acc__inner">
                <p class="acc__text">{{ item.text }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>

    <!-- 团队 -->
    <section class="doc-section">
      <div class="container">
        <h2 class="doc-title" v-reveal>{{ about.team.title }}</h2>
        <p class="doc-body about-body--intro" v-reveal="90">{{ about.team.intro }}</p>

        <article
          v-for="(member, index) in site.team"
          :key="member.id"
          class="team-row"
          :class="{ 'is-reverse': index % 2 === 1 }"
          v-reveal="index * 100"
        >
          <div class="team-row__media" aria-hidden="true">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div>
            <h3 class="team-row__title">{{ member.title }}</h3>
            <p class="team-row__sub">{{ member.tags.join(' · ') }}</p>
            <p class="team-row__text">{{ member.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 我们的路径 -->
    <section class="doc-section">
      <div class="container journey">
        <h2 class="journey__title" v-reveal>
          <span
            v-for="(line, index) in about.journey.titleLines"
            :key="line"
            :class="`is-${index + 1}`"
          >
            {{ line }}
          </span>
        </h2>
        <div class="journey__body" v-reveal="120">
          <p v-for="paragraph in about.journey.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
      </div>
    </section>

    <!-- 办公地点 -->
    <section class="doc-section about-place">
      <div class="container">
        <p class="about-place__label" v-reveal>{{ about.place.label }}</p>
        <p class="about-place__value" v-reveal="90">{{ about.place.value }}</p>
      </div>
    </section>
  </div>
</template>
