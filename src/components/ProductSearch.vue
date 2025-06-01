<template>
  <div class="search-wrapper position-relative" ref="wrapper">
    <div :class="['search-box', { focused }]" >
        <span class="search-icon"><Search size="22" /></span>
     <input
  v-model="keyword"
  @input="search"
  @focus="onFocusInput"
  @blur="focused = false"
  class="search-input"
  type="text"
  placeholder="Tìm kiếm sản phẩm..."
/>
    </div>

    <transition name="fade">
      <ul
        v-if="suggestions.length > 0"
        class="list-group position-absolute w-100 bg-white shadow rounded-3 mt-2 suggestion-box z-3"
      >
        <li
          v-for="(item, index) in suggestions"
          :key="index"
          class="list-group-item list-group-item-action d-flex align-items-center gap-3 px-3 py-2"
          @click="goToDetail(item.ID)"
        >
          <img
            :src="item['ẢNH(URL)']"
            alt="ảnh"
            width="42"
            height="42"
            style="object-fit: cover; border-radius: 8px;"
          />
          <div class="flex-grow-1">
            <div class="fw-semibold">{{ item['TÊN SẢN PHẨM'] }}</div>
            <div class="text-muted small">{{ formatPrice(item['GIÁ'] )}}₱</div>
          </div>
          
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Search
} from 'lucide-vue-next'
const router = useRouter()
const keyword = ref('')
const suggestions = ref([])
const wrapper = ref(null)
const focused = ref(false)
const allProducts = ref([])
const formatPrice = (price) => {
  if (typeof price === "string") price = Number(price)
  if (isNaN(price)) return ''
  return price.toLocaleString('vi-VN') // hoặc 'en-US' nếu muốn dấu phẩy
}
const fetchProducts = async () => {
  try {
    const res = await axios.get(
      'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getProducts'
    )
    allProducts.value = res.data
  } catch (error) {
    console.error('Không thể tải sản phẩm:', error)
  }
}
const onFocusInput = () => {
  focused.value = true
  if (!keyword.value.trim()) {
    // Hiện top 5 sản phẩm mặc định (gợi ý)
    suggestions.value = allProducts.value.slice(0, 5)
  } else {
    search()
  }
}

const search = () => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) {
    suggestions.value = []
    return
  }

  suggestions.value = allProducts.value
    .filter((p) =>
      String(p['TÊN SẢN PHẨM']).toLowerCase().includes(kw) ||
      String(p['MÔ TẢ'] || '').toLowerCase().includes(kw) ||
      String(p['ID']).toLowerCase().includes(kw)
    )
    .slice(0, 5)
}

const goToDetail = (id) => {
  keyword.value = ''
  suggestions.value = []
  router.push(`/product/${id}`)
}

const handleClickOutside = (e) => {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    suggestions.value = []
  }
}

onMounted(() => {
  fetchProducts()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-wrapper {
  max-width: 420px;
  margin: 0 auto;
}

.search-box {
  border: 1px solid #ced4da;
  border-radius: 12px;
  background-color: white;
  padding: 8px 14px;
  height: 46px;
  display: flex;
  align-items: center;
  transition: border-color 0.2s ease;
}

.search-box.focused {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 15px;
  background: transparent;
}

.search-input::placeholder {
  color: #999;
  font-style: italic;
}

.suggestion-box {
  animation: slideDown 0.2s ease-out;
  overflow: hidden;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
