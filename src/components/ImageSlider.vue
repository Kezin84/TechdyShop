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
  'https://5.imimg.com/data5/SELLER/Default/2025/4/503428531/RO/SJ/BB/4849257/kaspersky-500x500.jpg',
  'https://vncsglobal.vn/wp-content/uploads/2023/10/logo.png',
  'https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/34b5bf180145769.6505ae7623131.jpg',
  'https://images.seeklogo.com/logo-png/18/2/intel-logo-png_seeklogo-181977.png',
  'https://lh3.googleusercontent.com/LYUDWiiqyTSiwzbPsJnYhfTzA3kUAoYgRy_1mpKTZOuLtpaMTaNdPKm8Xesm5mxA_zUSIGy6RO4PxhUnIDgTgbmroxgVpudnc0XKWW0cByZXppI2WGo'
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
  box-shadow: 5px;
}

.slider-inner {
  max-width: 1440px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 16px;
  position: relative;
  box-shadow:
    0 14px 38px 0 rgba(33, 33, 34, 0.16),     /* Bóng dưới */
    -18px 0 36px -12px rgba(40,40,60,0.10),/* Bóng trái */
    18px 0 36px -12px rgba(40,40,60,0.10); /* Bóng phải */
  /* Có thể thêm transition nếu thích */
  transition: box-shadow 0.33s cubic-bezier(.4,1,.4,1);
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
