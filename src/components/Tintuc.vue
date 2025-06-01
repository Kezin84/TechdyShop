<template>
  <!-- Nên đặt Tintuc bên trong .main-inner hoặc .container của layout! -->
  <div>
    <!-- Thanh tin tức chạy ngang đầu trang, nằm vừa trong main-inner/container -->
    <div v-if="tinTucList.length" class="news-marquee-wrap">
      <div class="news-marquee-outer">
        <div class="news-marquee-inner" :style="{ animationDuration: marqueeDuration + 's' }">
          <span v-for="(item, idx) in tinTucList" :key="item.ID" class="news-content">
          <Megaphone size="80" /> {{ item.CONTENT }}
            <span v-if="idx < tinTucList.length - 1" class="mx-3">|</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Modal tin tức quan trọng -->
    <div v-if="showModal && importantTinTuc" class="modal-tintuc-overlay" @click.self="showModal = false">
      <div class="modal-tintuc">
        <h4 class="mb-2 fw-bold text-danger">📰 Tin tức quan trọng</h4>
        <div class="modal-tintuc-content mb-2" v-html="importantTinTuc.CONTENT"></div>
        <div class="modal-tintuc-images d-flex flex-wrap gap-2 justify-center">
          <img
            v-for="(img, index) in imageList"
            :key="index"
            :src="img"
            class="modal-tintuc-img"
            alt="News"
            @click="openLightbox(img)"
          />
        </div>
        <button class="btn btn-danger mt-3 w-100" @click="showModal = false">Đóng</button>
      </div>
    </div>

    <!-- Modal xem ảnh lớn -->
    <!-- Modal xem ảnh lớn -->
<div v-if="showLightbox" class="modal-lightbox-overlay" @click.self="closeLightbox">
  <div class="modal-lightbox-content">
    <button class="btn-nav prev" @click="prevImage" :disabled="imageList.length <= 1">&#10094;</button>
    <img :src="selectedImage" alt="Large View" />
    <button class="btn-nav next" @click="nextImage" :disabled="imageList.length <= 1">&#10095;</button>
    <button class="btn-close" @click="closeLightbox" aria-label="Close">&times;</button>
  </div>
</div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import {Megaphone}from 'lucide-vue-next'
const SHEET_API = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const tinTucList = ref([])
const importantTinTuc = ref(null)
const showModal = ref(false)
const marqueeDuration = ref(15) // seconds, tốc độ chạy chữ

const showLightbox = ref(false)
const selectedImage = ref(null)

const imageList = computed(() =>
  importantTinTuc.value
    ? [importantTinTuc.value.IMG1, importantTinTuc.value.IMG2, importantTinTuc.value.IMG3, importantTinTuc.value.IMG4, importantTinTuc.value.IMG5].filter(x => x)
    : []
)
const currentImageIndex = ref(0)

// Khi mở lightbox thì đặt selectedImage và index
function openLightbox(img) {
  const idx = imageList.value.indexOf(img)
  currentImageIndex.value = idx !== -1 ? idx : 0
  selectedImage.value = imageList.value[currentImageIndex.value]
  showLightbox.value = true
}

function nextImage(e) {
  e?.stopPropagation && e.stopPropagation()
  if (imageList.value.length < 2) return
  currentImageIndex.value = (currentImageIndex.value + 1) % imageList.value.length
  selectedImage.value = imageList.value[currentImageIndex.value]
}
function prevImage(e) {
  e?.stopPropagation && e.stopPropagation()
  if (imageList.value.length < 2) return
  currentImageIndex.value =
    (currentImageIndex.value - 1 + imageList.value.length) % imageList.value.length
  selectedImage.value = imageList.value[currentImageIndex.value]
}

onMounted(async () => {
  try {
    const res = await axios.get(SHEET_API, { params: { action: 'getTinTuc' } });
    if (res.data && res.data.data) {
      tinTucList.value = res.data.data.filter(x => x.CONTENT && (!x.IMPORTANT || x.IMPORTANT == 0));
      importantTinTuc.value = res.data.data.find(x => x.IMPORTANT && String(x.IMPORTANT) === '1');
      if (importantTinTuc.value) {
        setTimeout(() => { showModal.value = true }, 450);
      }
    }
  } catch (e) {
    tinTucList.value = [];
  }
});

watch(tinTucList, () => {
  setTimeout(() => {
    const el = document.querySelector('.news-marquee-inner')
    if (el) {
      const len = el.textContent.length
      marqueeDuration.value = Math.max(10, Math.round(len / 22) * 6)
    }
  }, 250)
})



function closeLightbox() {
  showLightbox.value = false
  selectedImage.value = null
}
</script>

<style scoped>
/* CHỈ width 100%, không dùng 100vw/max-width tại đây */
.news-marquee-wrap {
  background: transparent;
  padding: 10px 0 4px 0;
  overflow: hidden;
}

.news-marquee-outer {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.news-marquee-inner {
  display: inline-block;
  white-space: nowrap;
  font-size: 2.1rem;
  font-weight: bold;
  font-style: italic;
  color: #770808;
  text-shadow: 0 2px 8px #fff2, 0 0px 2px #fa8072;
  letter-spacing: 0.04em;
  animation: marquee-left linear infinite;
}

@keyframes marquee-left {
  0% { transform: translateX(100%);}
  100% { transform: translateX(-100%);}
}

.news-content {
  margin-right: 24px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.mx-3 {
  margin-left: 18px;
  margin-right: 18px;
}

/* ===== MODAL TIN TỨC ===== */
.modal-tintuc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  animation: fadeInOverlay 0.3s ease forwards;
}

@keyframes fadeInOverlay {
  from { background: rgba(0, 0, 0, 0); }
  to { background: rgba(0, 0, 0, 0.45); }
}

.modal-tintuc {
  background: #fff;
  border-radius: 16px;
  max-width: 460px;
  width: 90vw;
  padding: 24px 32px 30px 32px;
  box-shadow: 0 8px 32px rgba(198, 40, 40, 0.3);
  animation: popInScale 0.35s cubic-bezier(0.25, 1.2, 0.35, 1) forwards;
  transform-origin: center bottom;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #ad1700;
  user-select: text;
}

@keyframes popInScale {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.modal-tintuc h4 {
  font-weight: bold;
  color: #ff0000;
  font-size: 1.8rem;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-tintuc-content {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 18px;
  color: #7f1d1d;
  white-space: pre-wrap; /* giữ xuống dòng */
  font-weight: bold;
}

.modal-tintuc-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 22px;
}

.modal-tintuc-img {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #f5c6cb;
  background: #fef0f1;
  box-shadow: 0 3px 6px rgba(198, 40, 40, 0.15);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.modal-tintuc-img:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(198, 40, 40, 0.3);
}

.modal-tintuc button {
  background-color: #c62828;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 12px 0;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.modal-tintuc button:hover {
  background-color: #921616;
}

/* Responsive nhỏ */
@media (max-width: 600px) {
  .modal-tintuc {
    max-width: 95vw;
    padding: 20px 24px 24px 24px;
  }

  .modal-tintuc h4 {
    font-size: 1.25rem;
  }

  .modal-tintuc-content {
    font-size: 1rem;
  }

  .modal-tintuc-img {
    width: 72px;
    height: 58px;
  }

  .modal-tintuc button {
    font-size: 1rem;
    padding: 10px 0;
  }
}

/* ==== MODAL LIGHTBOX XEM ẢNH LỚN ==== */
.modal-lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.3s ease forwards;
}

.modal-lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: popInScale 0.35s cubic-bezier(0.25,1.2,0.35,1) forwards;
}

.modal-lightbox-content {
  position: relative;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  max-width: 100vw;
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}


.modal-lightbox-content img {
  display: block;
  max-width: 98vw;
  max-height: 98vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 4px 24px #0007;
  margin: auto;
  background: #fff;
}

.btn-close {
  position: absolute;
  top: 24px;
  right: 38px;
  background: rgba(255,255,255,0.9);
  border: none;
  font-size: 40px;
  line-height: 1;
  font-weight: 900;
  color: #c62828;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  cursor: pointer;
  box-shadow: 0 2px 8px #3334;
  transition: background 0.22s;
  z-index: 1002;
}
.btn-close:hover {
  background: #c62828;
  color: #fff;
}

@media (max-width: 600px) {
  .modal-lightbox-content {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    padding: 0;
  }
  .modal-lightbox-content img {
    max-width: 100vw;
    max-height: 92vh;
    border-radius: 5px;
  }
  .btn-close {
    top: 8px;
    right: 12px;
    font-size: 28px;
    width: 38px;
    height: 38px;
  }
}

.btn-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1010;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.89);
  color: #c62828;
  border: none;
  font-size: 2.3rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 12px #3334;
  transition: background 0.2s, color 0.2s;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.85;
}
.btn-nav:hover:not(:disabled) {
  background: #c62828;
  color: #fff;
  opacity: 1;
}
.btn-nav.prev { left: 30px; }
.btn-nav.next { right: 30px; }

.btn-nav:disabled { opacity: 0.2; cursor: default; }

@media (max-width: 600px) {
  .btn-nav {
    width: 38px;
    height: 38px;
    font-size: 1.45rem;
    left: 4px; right: 4px;
  }
  .btn-nav.prev { left: 4px; }
  .btn-nav.next { right: 4px; }
}

</style>
