<template>
  <div class="slider-wrapper full-width">
    <div class="slider-inner position-relative">
      <!-- Slider chính -->
      <div class="slider" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div class="slide" v-for="(img, index) in images" :key="index">
          <img :src="img" alt="slide" />
        </div>
      </div>

      <!-- Nút trái/phải -->
      <button class="nav left" @click="prevSlide">&#10094;</button>
      <button class="nav right" @click="nextSlide">&#10095;</button>

      <!-- Chấm tròn -->
      <div class="dots">
        <span
          v-for="(dot, index) in images"
          :key="index"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const images = [
  'https://picsum.photos/id/1015/1440/400',
  'https://picsum.photos/id/1016/1440/400',
  'https://picsum.photos/id/1016/1440/400',
  'https://picsum.photos/id/1016/1440/400',
  'https://picsum.photos/id/1018/1440/400'
]

const currentIndex = ref(0)
let intervalId = null

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}

const goToSlide = (index) => {
  currentIndex.value = index
}

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.slider-wrapper {
  width: 100vw;
  margin-left: -50vw;
  left: 50%;
  position: relative;
  margin-bottom:20px;
}

.slider-inner {
  max-width: 1440px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
}

.slider {
  display: flex;
  transition: transform 0.6s ease;
}

.slide {
  min-width: 100%;
}

.slide img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

/* Nút trái/phải */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.6);
  border: none;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 50%;
  z-index: 5;
  transition: all 0.3s ease;
}

.nav:hover {
  background: rgba(253, 29, 29, 0.85);
  color: #fff;
}

.nav.left {
  left: 10px;
}
.nav.right {
  right: 10px;
}

/* Chấm tròn */
.dots {
  text-align: center;
  position: absolute;
  bottom: 16px;
  width: 100%;
  z-index: 5;
}

.dots span {
  display: inline-block;
  height: 10px;
  width: 10px;
  margin: 0 5px;
  background-color: #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dots span.active {
  background-color: #ed3737;
  transform: scale(1.3);
}
</style>
