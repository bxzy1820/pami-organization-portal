<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import TypewriterTitle from "@/components/TypewriterTitle.vue";
import { site } from "@/data/site";
import { portalApi } from '@/api/client'

const typed = ref(false);
const loading = ref(true)
const error = ref('')
const home = ref(null)
const controller = new AbortController()

const heroLines = computed(() => {
  if (home.value?.slogan) return [home.value.slogan]
  return site.hero.titleLines
})

onMounted(async () => {
  try {
    home.value = await portalApi.getHome({ signal: controller.signal })
    if (home.value?.slogan) site.slogan = home.value.slogan
  } catch (requestError) {
    if (requestError.name !== 'AbortError') error.value = requestError.message || '首页内容加载失败'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => controller.abort())

const entries = [
  { label: "关于我们", to: "/about" },
  { label: "研究方向", to: "/business" },
  { label: "项目成果", to: "/projects" },
  { label: "组织动态", to: "/news" },
  { label: "加入我们", to: "/recruitment" },
];

const arrow = "M6 18L18 6M18 6H9M18 6v9";
</script>

<template>
  <div>
    <!-- Hero：全屏影像 + 打字标语 -->
    <section class="hero">
      <div
        class="hero__media"
        style="
          background-image: url(&quot;/bg.jpeg&quot;);
          background-size: cover;
          background-position: center;
        "
        aria-hidden="true"
      ></div>
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="container hero__inner">
        <TypewriterTitle v-if="!loading" :lines="heroLines" @finish="typed = true" />
        <h1 v-else class="hero__title">正在连接内容服务…</h1>

        <div class="hero__foot">
          <router-link
            to="/about"
            class="circle-btn hero__cta"
            :class="{ 'is-shown': typed }"
            aria-label="了解我们"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.3"
              aria-hidden="true"
            >
              <path :d="arrow" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </router-link>
        </div>
      </div>

      <span class="scroll-hint" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path
            d="M12 4v15M6 13l6 6 6-6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </section>

    <section class="section home-summary">
      <div class="container">
        <p v-if="loading" class="api-state" role="status">正在加载首页内容…</p>
        <div v-else-if="error" class="api-state api-state--error" role="alert">
          <p>{{ error }}</p>
          <p>当前展示本地兜底内容，请确认后端服务已经启动。</p>
        </div>
        <div v-else>
          <p class="statement">
            <strong>{{ home?.orgName || site.name }}</strong>
            {{ home?.briefIntro || site.statement.text }}
          </p>
          <div v-if="home?.directions?.length" class="home-directions">
            <article v-for="(item, index) in home.directions" :key="`${item.title}-${index}`" class="home-direction">
              <p class="home-direction__num">{{ String(index + 1).padStart(2, '0') }}</p>
              <h2>{{ item.title }}</h2>
              <p>{{ item.desc }}</p>
            </article>
          </div>
          <p v-else class="api-state api-state--empty">暂无研究方向数据。</p>
        </div>
      </div>
    </section>

    <!-- 栏目目录 -->
    <section class="section">
      <div class="container">
        <ul class="index-list">
          <li v-for="(item, index) in entries" :key="item.to">
            <router-link :to="item.to" class="index-link">
              <span class="index-link__num">{{
                String(index + 1).padStart(2, "0")
              }}</span>
              <span class="index-link__title">{{ item.label }}</span>
              <span class="index-link__arrow" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    :d="arrow"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
