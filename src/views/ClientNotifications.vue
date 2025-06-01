<template>
  <div class="notices-vip-container">
    <div class="notices-vip-header">
      <span class="notices-vip-icon">🔔</span>
      <span class="notices-vip-title">Thông báo mới nhất</span>
      <div class="notices-vip-underline"></div>
    </div>

    <div v-if="loading" class="notices-vip-loading">
      <div class="wave-spinner">
        <div></div><div></div><div></div><div></div>
      </div>
    </div>

    <div v-else-if="notices.length === 0" class="notices-vip-empty">
      <p class="text-muted animate-fade">Hiện chưa có thông báo nào.</p>
    </div>

    <transition-group name="slide-up" tag="div">
      <div
        v-for="item in filteredNotices"
        :key="item.id"
        class="notices-vip-card animate-card-in"
      >
        <h5 class="notices-vip-card-title">
          {{ item.title }}
        </h5>
        <img v-if="item.image" :src="item.image" alt="img" class="notices-vip-image" />
        <p class="notices-vip-meta">
          🕒 {{ item.date }} | 👤 {{ item.sender }} | 🎯 {{ item.target }}
        </p>
        <div class="notices-vip-content">{{ item.content }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'
const notices = ref([])
const loading = ref(false)

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getNotices`)
    const data = await res.json()
    notices.value = data || []
  } catch (err) {
    console.error('Lỗi khi tải thông báo:', err)
  } finally {
    loading.value = false
  }
}

const filteredNotices = computed(() => {
  return notices.value.filter(n =>
    n.status?.toLowerCase() === 'hiển thị' && (n.target === 'all' || n.target === 'client')
  )
})

onMounted(fetchNotices)
</script>

<style scoped>
:root {
  --brown-vip: rgb(68, 18, 18);
  --primary-vip: #ed3737;
  --accent-vip: #ffe3d1;
  --shadow-vip: 0 8px 32px #44121223, 0 1.5px 5px #ed37374e;
  --white: #fff;
}

/* Container */
.notices-vip-container {
  max-width: 760px;
  margin: 38px auto 26px;
  background: var(--white);
  border-radius: 18px;
  padding: 38px 28px 26px 28px;
  box-shadow: var(--shadow-vip);
  min-height: 72vh;
}

/* Header VIP */
.notices-vip-header {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 32px;
  gap: 14px;
}
.notices-vip-icon {
  font-size: 2.1em;
  margin-right: 8px;
}
.notices-vip-title {
  font-size: 2em;
  font-weight: 900;
  color: var(--brown-vip);
  letter-spacing: 1.2px;
  text-shadow: 0 3px 14px #44121224;
}
.notices-vip-underline {
  position: absolute;
  bottom: -6px; left: 52px;
  width: 240px;
  height: 5px;
  background: linear-gradient(90deg, #ed3737 25%, #ffe3d1 60%, transparent 100%);
  border-radius: 4px;
  opacity: 0.65;
  animation: underline-pop 1.2s cubic-bezier(.4,1.9,.5,1.2);
}
@keyframes underline-pop {
  from { width: 0; opacity: 0.2; }
  to { width: 240px; opacity: 0.65; }
}

/* Loading Spinner Custom */
.notices-vip-loading {
  display: flex; justify-content: center; align-items: center; min-height: 180px;
}
.wave-spinner {
  display: flex;
  gap: 5px;
}
.wave-spinner div {
  width: 14px;
  height: 36px;
  background: linear-gradient(120deg, #ed3737 60%, #ab3cfc 110%);
  border-radius: 8px;
  animation: wave-bounce 1.1s infinite cubic-bezier(.54,1.6,.67,1.14);
}
.wave-spinner div:nth-child(2) { animation-delay: 0.16s; }
.wave-spinner div:nth-child(3) { animation-delay: 0.32s; }
.wave-spinner div:nth-child(4) { animation-delay: 0.48s; }
@keyframes wave-bounce {
  0%, 100% { transform: scaleY(0.64);}
  30% { transform: scaleY(1.08);}
  60% { transform: scaleY(0.6);}
}

/* Empty message */
.notices-vip-empty p {
  color: #9d9d9d;
  font-size: 1.13em;
  font-weight: 700;
  text-align: center;
  margin-top: 90px;
  animation: fadeIn 1.5s;
}

/* Card Effect */
.notices-vip-card {
  background: linear-gradient(120deg, #fff8f3 80%, #ffe3d1 120%);
  border-radius: 16px;
  box-shadow: 0 7px 28px #ed37371a, 0 1.5px 5px #ed373730;
  border-left: 7px solid var(--brown-vip);
  padding: 22px 24px 16px 24px;
  margin-bottom: 18px;
  transition: box-shadow 0.23s, transform 0.16s;
  animation: slideUp 0.7s cubic-bezier(.25,1.3,.5,1);
  position: relative;
  overflow: hidden;
}
.notices-vip-card:hover {
  box-shadow: 0 14px 40px #ed37374e, 0 3px 16px #44121230;
  transform: scale(1.024) translateY(-4px) rotate(-1deg);
  background: linear-gradient(118deg, #fff 60%, #ffe3d1 120%);
}

.notices-vip-card-title {
  font-size: 1.22em;
  font-weight: 800;
  color: var(--brown-vip);
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}
.notices-vip-meta {
  color: #88502b;
  font-size: 0.97em;
  margin-bottom: 9px;
  font-style: italic;
  opacity: 0.94;
}
.notices-vip-content {
  font-size: 1.08em;
  color: #441212;
  line-height: 1.7;
  letter-spacing: 0.01em;
}
.notices-vip-image {
  max-width: 180px;
  max-height: 100px;
  border-radius: 9px;
  margin-bottom: 8px;
  object-fit: contain;
  box-shadow: 0 1.5px 12px #ed37377a;
  border: 1.5px solid #f7d9c0;
  display: block;
}

@media (max-width: 700px) {
  .notices-vip-container {
    padding: 12px 3px 18px 3px;
    border-radius: 10px;
  }
  .notices-vip-card { padding: 13px 9px 12px 12px; }
  .notices-vip-header { gap: 7px; }
  .notices-vip-title { font-size: 1.25em;}
  .notices-vip-underline { width: 100px; left: 30px;}
}

/* Animations */
@keyframes slideUp { from { opacity: 0; transform: translateY(50px) scale(0.95);}
  to { opacity: 1; transform: translateY(0) scale(1);}
}
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.6s cubic-bezier(.2,1.3,.55,1);}
.slide-up-enter-from { opacity: 0; transform: translateY(36px) scale(0.98);}
.slide-up-leave-to { opacity: 0; transform: translateY(-20px) scale(0.96);}
.animate-card-in { animation: slideUp 0.7s cubic-bezier(.25,1.3,.5,1);}
@keyframes fadeIn { from { opacity: 0;} to { opacity: 1;} }
.animate-fade { animation: fadeIn 0.75s; }
</style>
