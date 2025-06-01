<template>
  <div class="about-link-container">
    <div class="about-link-box">
      <lucide-link class="about-link-icon" size="38" />
      <p class="about-link-title">Thiết kế giới thiệu trên Canva</p>
      <a
        href="https://www.canva.com/design/DAGo5SkotP0/kVqgUs8guaT75sRA6mt5qw/edit"
        target="_blank"
        rel="noopener"
        class="about-link-btn"
      >
        Xem trang giới thiệu trên Canva
        <lucide-external-link style="margin-left:8px;" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { Link as LucideLink, ExternalLink as LucideExternalLink } from 'lucide-vue-next'
</script>

<style scoped>
.about-link-container {
  min-height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff6ea;
}
.about-link-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px #fd8d2922;
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.about-link-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #b84a00;
  margin: 22px 0 10px 0;
}
.about-link-btn {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(90deg, #fd8d29, #ffd16d 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 1.11rem;
  text-decoration: none;
  box-shadow: 0 3px 15px #fd8d2933;
  transition: background .17s, transform .14s;
  margin-top: 10px;
}
.about-link-btn:hover {
  background: linear-gradient(90deg, #ffd16d, #fd8d29 100%);
  color: #c62828;
  transform: scale(1.04);
}
.about-link-icon {
  color: #fd8d29;
}
</style>
