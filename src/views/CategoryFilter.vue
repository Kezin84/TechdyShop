<template>


<!-- SIDEBAR FIXED BÊN TRÁI -->
<div class="sidebar-fixed-ecom" v-show="showSidebar">
  <!-- Card Chi nhánh -->
  <div class="card mb-4 shadow-sm">
    <div class="card-header fw-bold">Chi nhánh</div>
    <ul class="list-group list-group-flush">
      <li
        class="list-group-item"
        :class="{ active: branchFilter === '' }"
        @click="selectBranch('')"
      >Tất cả</li>
      <li
        class="list-group-item"
        v-for="branch in allBranches"
        :key="branch"
        :class="{ active: branchFilter === branch }"
        @click="selectBranch(branch)"
      >
        {{ branch }}
      </li>
    </ul>
  </div>

  <!-- Card Danh mục -->
  <div class="card mb-4 shadow-sm">
    <div class="card-header fw-bold">Danh mục</div>
    <ul class="list-group list-group-flush">
      <li
        class="list-group-item"
        :class="{ active: currentCategory === 'TẤT CẢ' }"
        @click="selectCategory('TẤT CẢ')"
      >Tất cả</li>
      <li
        class="list-group-item"
        v-for="cat in allCategories"
        :key="cat"
        :class="{ active: currentCategory === cat }"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </li>
    </ul>
  </div>
</div>

<!-- NÚT ẨN/HIỆN SIDEBAR -->
<!-- Nút toggle sidebar -->
<button
  class="toggle-sidebar-btn"
  :class="{ opened: showSidebar }"
  @click="showSidebar = !showSidebar"
>
  <!-- Nếu sidebar đang ẩn: -->
  <span v-if="!showSidebar" class="toggle-label">
   DANH MỤC <CircleChevronRight size="35" /> 
  </span>
  <!-- Nếu sidebar đang hiện: -->
  <span v-else class="toggle-label">
    <CircleArrowLeft size="40"  class="toggle-icon"  /> 
  </span>
</button>

   <div class="container py-3 position-relative">
    <!-- MODAL CHỌN CHI NHÁNH -->
<div v-if="showBranchModal" class="modal-branch-backdrop">
  <div class="modal-branch-box animate__fadeInDown">
    <h4 class="fw-bold mb-3">🔎 Bạn mua hàng tại chi nhánh nào?</h4>
    <ul class="list-group list-group-flush branch-modal-list">
      <li
        class="list-group-item"
        v-for="branch in allBranches"
        :key="branch"
        @click="chooseBranch(branch)"
      >
        <span class="branch-modal-dot"></span>
        {{ branch }}
      </li>
    </ul>
  </div>
</div>

    <!-- Slider -->
    <ImageSlider />

    <div class="row">
   

      <!-- DANH SÁCH SẢN PHẨM BÊN PHẢI -->
      
        <!-- DANH MỤC & SẮP XẾP -->
        <h6 class="mb-3 sidebar-slidein">
          <i class="fa-regular fa-rectangle-list"></i> Danh mục: <strong>{{ currentCategory }}</strong>
        </h6>
        <div class="d-flex justify-content-end mb-3 gap-3 align-items-center">
          <!-- Nút chọn chi nhánh sắp xếp -->
          <div>
            <label class="fw-bold text-success me-2 sidebar-slidein">CHI NHÁNH </label>
            <select v-model="branchFilter" @change="sortProducts" class="form-select w-auto custom-branch-select  sidebar-slidein">
              <option value="">-- Tất cả --</option>
              <option v-for="branch in allBranches" :key="branch" :value="branch">{{ branch }}</option>
            </select>
          </div>
          <div>
            <label class="fw-bold text-danger me-2  sidebar-slidein">Sắp xếp:</label>
            <select v-model="sortOption" @change="sortProducts" class="form-select w-auto  sidebar-slidein">
              <option value="">-- Chọn --</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        <!-- DANH SÁCH SẢN PHẨM -->
        <transition-group
  name="fade"
  tag="div"
  class="row min-vh-30"
>
          <template v-if="isLoading">
                <div class="col-2-4 col-md-3 col-sm-4 col-6 mb-4" v-for="n in 10" :key="'skeleton-'+n">
              <div class="card h-100 shadow-sm product-skeleton">
                <div class="skeleton-img"></div>
                <div class="card-body d-flex flex-column">
                  <div class="skeleton-line skeleton-title"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                </div>
              </div>
            </div>
          </template>
          <!-- Nếu đã load xong thì hiện sản phẩm thật -->
          <template v-else>
            <div
               class="col-2-4 mb-4"
              v-for="product in visibleProducts"
              :key="product.ID"
            >
              <div
  class="card h-100 shadow-sm d-flex flex-column"
  @mouseenter="onCardMouseEnter(product)"
  @mouseleave="onCardMouseLeave(product)"
>
                <!-- Nhãn dán trên ảnh -->
               <RouterLink :to="`/product/${product.ID}`" class="text-decoration-none text-dark">
  <div class="image-stack" style="position: relative; width:100%; aspect-ratio:1/1; min-height:250px; max-height:300px;">
    <!-- NHÃN LUÔN FIXED TRÊN ẢNH -->
    <span
      v-if="product['NHÃN']"
      class="badge product-badge"
      :class="badgeClass(product['NHÃN'])"
      style="top:12px; left:12px; z-index:5; position:absolute; pointer-events:none;"
    >
      {{ product['NHÃN'] }}
    </span>
    <img
      v-for="(img, idx) in product.images"
      :key="idx"
      :src="img"
      class="card-img-top stacked-img"
      style="object-fit:cover; position:absolute; left:0; top:0; width:100%; height:100%; aspect-ratio:1/1;"
      :style="{
        zIndex: idx === (productImageIndexes[product.ID] || 0) ? 2 : 1,
        opacity: idx === (productImageIndexes[product.ID] || 0) ? 1 : 0,
        transform: idx === (productImageIndexes[product.ID] || 0) ? 'scale(1.04)' : 'scale(1.01)',
        transition: 'opacity .48s cubic-bezier(.45,1.5,.46,1), transform .52s cubic-bezier(.24,1.2,.47,1)'
      }"
    />
  </div>
</RouterLink>

                <div
                  class="card-body d-flex flex-column"
                  @click="goToDetail(product.ID, $event)"
                  style="cursor:pointer"
                >
                  <!-- Tên sản phẩm -->
<h6 class="fw-bold text-uppercase">{{ product['TÊN SẢN PHẨM'] }}</h6>

 <span
    v-if="product._currentVariant['TÌNH TRẠNG']"
    class="status-badge"
    :class="statusClass(product._currentVariant['TÌNH TRẠNG'])"
  >
    {{ product._currentVariant['TÌNH TRẠNG'] }}
  </span>
<!-- Tình trạng + Đánh giá: nằm cùng hàng -->
<div class="d-flex align-items-center justify-content-between mb-1" style="gap: 1px;">
  <!-- Tình trạng -->
 
  <!-- Đánh giá -->
  <span>
    <span
      v-for="i in 5"
      :key="i"
      :style="{ color: i <= Math.round(product._currentVariant['ĐÁNH GIÁ'] || 5) ? '#ffc107' : '#e0e0e0', marginRight: '2px' }"
    >★</span>
    <span class="text-muted small ms-1">({{ product._currentVariant['ĐÁNH GIÁ'] || 5 }})</span>
  </span>
  <span class="text-nowrap ms-2" style="color: rgb(217, 2, 2); font-weight: bold; font-size:15px;">
     {{ product._currentVariant['LƯỢT MUA'] || 0 }} lượt mua
    </span>
</div>

                  
                  <!-- Filter thuộc tính -->
                  <div class="mb-3">
                    <div v-for="attr in getVisibleAttributes(product)" :key="attr" class="mb-2">
  <span class="attr-label">{{ attr }}:</span>
  <div class="d-flex flex-wrap filter-attr-group">
    <button
      v-for="value in getAvailableOptions(product, attr)"
      :key="value"
      class="filter-btn"
      :class="{ selected: product._selectedFilters[attr] === value }"
      @click="selectFilter(product, attr, value)"
    >
      {{ value }}
    </button>
  </div>
</div>

                  </div>
                  <!-- Giá, kho -->
              <!-- Giá, khuyến mãi và lượt mua (tách 2 dòng chuẩn e-commerce) -->
<div>
  <!-- Dòng 1: Giá gạch + badge khuyến mãi -->
  <div class="d-flex align-items-center mb-1 ">
    <span
      v-if="Number(product._currentVariant['KHUYẾN MÃI']) > 0"
      class=" text-decoration-line-through me-2 fs-6"
      style="line-height: 1 ;color:#441212"
    >
      {{ Math.round(Number(product._currentVariant['GIÁ']) / (1 - Number(product._currentVariant['KHUYẾN MÃI']) / 100)) }}₱
    </span>
    <span
      v-if="product._currentVariant['KHUYẾN MÃI'] > 0"
      class="badge bg-warning text-dark"
      style="font-size:13px; font-weight: bold;"
    >
      -{{ product._currentVariant['KHUYẾN MÃI'] }}%
    </span>
  </div>
  <!-- Dòng 2: Giá bán -->
  <div class="d-flex align-items-center justify-content-between " >
    <span class="fs-5 fw-bold" style="color: #c62828">
      {{ formatPrice(product._currentVariant['GIÁ']) }}₱
    </span>
    
  </div>
</div>


                  <!-- Số lượng + Nút mua -->
                  <div class="mt-auto">
                    <template v-if="product._currentVariant['SỐ LƯỢNG'] > 0">
                   <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
  <div class="d-flex align-items-center">
    <button class="btn-qty " @click.stop="decrease(product)">-</button>
    <input type="number" class="input-qty" v-model.number="product._SL"
           :max="product._currentVariant['SỐ LƯỢNG']"
           :min="1" @click.stop />
    <button class="btn-qty " @click.stop="increase(product)">+</button>
  </div>
  <span class="small" style="color: brown; font-weight: bold;">
    Kho: {{ product._currentVariant['SỐ LƯỢNG'] }}
  </span>
</div>


                      <button class="btn custom-addtocart w-100 btn-sm fw-bold d-flex justify-content-center align-items-center gap-2" @click.stop="addToCart(product)">
                        THÊM VÀO GIỎ
                      </button>
                      <p class="small mb-2 branch-green">
                        
                        <strong>Chi nhánh:</strong> {{ product._currentVariant['CHI NHÁNH'] || 'Không rõ' }}
                      </p>
                    </template>
                    <template v-else>
                      <button class="btn btn-secondary w-100 btn-sm fw-bold" disabled>Hết hàng</button>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
       </transition-group>
        <!-- XEM THÊM -->
        <div v-if="visibleCount < sortedProducts.length" class="text-center mt-4">
          <button class="btn custom-loadmore fw-bold px-4" @click="loadMore">Xem thêm</button>
        </div>
      </div>
    
    <!-- CART PANEL -->
<div v-if="showCartPanel" class="cart-panel shadow">
  <div class="cart-panel-header d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-bold">🛒 Giỏ hàng của bạn</h5>
    <button class="btn-close custom-x" @click="showCartPanel = false" aria-label="Close">&times;</button>

  </div>
      <div v-if="cartItems.length > 0">
        <transition-group name="cart-fade" tag="div">
        <div v-for="item in cartItems" :key="item.ID" class="mb-3 border-bottom pb-2">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-start">
              <img :src="item['ẢNH(URL)']" alt="img"
                   style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px" />
              <div class="ms-3">
                <p class="mb-0 fw-bold" style="color:red">{{ item['TÊN SẢN PHẨM'] }}</p>
                <div class="text-muted small">
                  <div v-if="item['TRỌNG LƯỢNG']">Trọng lượng: {{ item['TRỌNG LƯỢNG'] }}</div>
                  <div v-if="item['KIỂU DÁNG']">Kiểu dáng: {{ item['KIỂU DÁNG'] }}</div>
                  <div v-if="item['MÀU SẮC']">Màu sắc: {{ item['MÀU SẮC'] }}</div>
                  <div v-if="item['KÍCH THƯỚC']">Kích thước: {{ item['KÍCH THƯỚC'] }}</div>
                  <div v-if="item['CHẤT LIỆU']">Chất liệu: {{ item['CHẤT LIỆU'] }}</div>
                  <div v-if="item['THƯƠNG HIỆU']">Thương hiệu: {{ item['THƯƠNG HIỆU'] }}</div>
                  <div v-if="item['XUẤT XỨ']">Xuất xứ: {{ item['XUẤT XỨ'] }}</div>
                  <div v-if="item['BẢO HÀNH']">Bảo hành: {{ item['BẢO HÀNH'] }}</div>             
                </div>
                <!-- thành cụm này (thêm nút + - hai bên): -->
<div class="d-flex align-items-center gap-2">
  <button class="btn-qty qty-minus" @click="decreaseCartItem(item)">
    <span>-</span>
  </button>
  <input
    type="number"
    class="form-control form-control-sm text-center"
    v-model.number="item.quantity"
    @change="onChangeCartItem(item)"
    :min="1"
    :max="getProductMaxQty(item)"
    style="width:50px"
  />
  <button class="btn-qty qty-plus" @click="increaseCartItem(item)">
    <span>+</span>
  </button>
</div>

                <small>Giá: {{ formatPrice(item['GIÁ']) }}₱</small>
                <div style="color: green;font-weight: bold;" v-if="item['CHI NHÁNH']">
                  Chi nhánh: {{ item['CHI NHÁNH'] }}
                </div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-danger ms-2" @click="removeFromCart(item.ID)" style="border-radius: 50%; width: 30px;height:30px">X</button>
          </div>
        </div>
        </transition-group>
        <div class="mt-3 text-end" style="color:green;font-size: 20px;font-style: italic;">
          <strong>Tổng tiền: {{ formatPrice(cartTotal) }}P</strong>
        </div>
        <div class="text-center mt-3">
          <RouterLink to="/cart" class="btn btn-sm btn-warning me-2" style="font-weight: bold;">Xem giỏ hàng</RouterLink>
          <RouterLink to="/checkout" class="btn btn-sm btn-danger"style="font-weight: bold;">Thanh toán</RouterLink>
        </div>
      </div>
      <div v-else class="text-muted">Giỏ hàng trống.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch,watchEffect ,onUnmounted } from 'vue'
import { useRoute,useRouter  } from 'vue-router'
import axios from 'axios'
 import ImageSlider from '@/components/ImageSlider.vue'
import {List ,ChevronLeft,CircleChevronRight,CircleArrowLeft  } from 'lucide-vue-next'
const showCartPanel = ref(false)
const cartItems = ref([])
const cartTotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (Number(item['GIÁ']) * item.quantity), 0)
)
const isLoading = ref(true)
const productImageIndexes = ref({})
let imageIntervals = {}
const hoveredProductId = ref(null)
const router = useRouter()
const route = useRoute()
const products = ref([])
const sortedProducts = ref([])
const visibleCount = ref(12)
const currentCategory = ref('TẤT CẢ')
const sortOption = ref('')
const allProducts = ref([]); // Biến chứa tất cả sản phẩm gốc

const user = JSON.parse(localStorage.getItem('user')) || {}
const username = user.username || ''

const fetchProducts = async () => {
  isLoading.value = true    
  const [resProduct, resComment] = await Promise.all([
    axios.get(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getProducts`),
    axios.get(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getAllComments`)
  ])

  const comments = resComment.data
  const all = resProduct.data.map(p => ({
    ...p,
     images: [
    p['ẢNH(URL)'],           // Ảnh chính
    p['ẢNH PHỤ 1'] || '',    // Ảnh phụ 1
    p['ẢNH PHỤ 2'] || ''     // Ảnh phụ 2 (nếu có)
  ].filter(Boolean),
    ['ĐÁNH GIÁ']: Number(p['ĐÁNH GIÁ']) || 5  // fallback nếu không có
  }))
  allProducts.value = all

  const cat = route.params.cat || 'TẤT CẢ'
  currentCategory.value = cat
  const filtered = cat === 'TẤT CẢ' ? all : all.filter(p => p['DANH MỤC'] === cat)
  filtered.forEach(p => {
    p._SL = 1
    p._selectedFilters = {}
    p._currentVariant = { ...p, 'CHI NHÁNH': p['CHI NHÁNH'] || '' }
  })

  // Gán đánh giá cho từng biến thể
  filtered.forEach(p => {
    const rating = p['ĐÁNH GIÁ']
    p._rating = rating
  })

  products.value = filtered
  // Gom nhóm biến thể cùng tên
  const variantsMap = {}
  filtered.forEach(p => {
    const name = p['TÊN SẢN PHẨM']
    if (!variantsMap[name]) variantsMap[name] = []
    variantsMap[name].push(p)
  })

  // Gán biến thể vào từng sản phẩm chính
  filtered.forEach(p => {
    p._variants = variantsMap[p['TÊN SẢN PHẨM']]
  })

  // ✅ Lọc trùng tên sản phẩm
  const unique = {}
  products.value = products.value.filter(p => {
    if (!unique[p['TÊN SẢN PHẨM']]) {
      unique[p['TÊN SẢN PHẨM']] = true
      return true
    }
    return false
  })

  sortProducts()

  // Kết thúc loading ở đây!
  isLoading.value = false
  startAllProductImageLoops()

}





// Sửa lại hàm sortProducts:
const sortProducts = () => {
  let sorted = [...products.value];

  // Lọc theo chi nhánh (chỉ dùng branchFilter)
  if (branchFilter.value) {
    sorted = sorted.filter(p => p._currentVariant?.['CHI NHÁNH'] === branchFilter.value);
  }

  switch (sortOption.value) {
    case 'name-asc': sorted.sort((a, b) => a['TÊN SẢN PHẨM'].localeCompare(b['TÊN SẢN PHẨM'])); break;
    case 'name-desc': sorted.sort((a, b) => b['TÊN SẢN PHẨM'].localeCompare(a['TÊN SẢN PHẨM'])); break;
    case 'price-asc': sorted.sort((a, b) => Number(a['GIÁ']) - Number(b['GIÁ'])); break;
    case 'price-desc': sorted.sort((a, b) => Number(b['GIÁ']) - Number(a['GIÁ'])); break;
  }

  sortedProducts.value = sorted;
}




const visibleProducts = computed(() => sortedProducts.value.slice(0, visibleCount.value))
const loadMore = () => visibleCount.value += 12

const increase = (product) => {
  if (!product._SL) product._SL = 1
  if (product._SL < product['SỐ LƯỢNG']) product._SL++
}
const decrease = (product) => {
  if (!product._SL || product._SL <= 1) product._SL = 1
  else product._SL--
}

// Đặt ở đầu <script setup>
const formatPrice = (price) => {
  if (typeof price === "string") price = Number(price)
  if (isNaN(price)) return ''
  return price.toLocaleString('vi-VN') // hoặc 'en-US' nếu muốn dấu phẩy
}


const addToCart = (product) => {
 

  const variant = product._currentVariant
  const quantity = product._SL || 1
  const cartKey = `cart_${username}`
  let cart = JSON.parse(localStorage.getItem(cartKey)) || []
console.log('🧩 variant push vô giỏ:', variant)

 const newItem = {
  ID: variant.ID,
  'TÊN SẢN PHẨM': variant['TÊN SẢN PHẨM'],
  'GIÁ': variant['GIÁ'],
  'ẢNH(URL)': variant['ẢNH(URL)'],
  'TRỌNG LƯỢNG': variant['TRỌNG LƯỢNG'] || '',
  'KIỂU DÁNG': variant['KIỂU DÁNG'] || '',
  'MÀU SẮC': variant['MÀU SẮC'] || '',
  'KÍCH THƯỚC': variant['KÍCH THƯỚC'] || '',
  'CHẤT LIỆU': variant['CHẤT LIỆU'] || '',
  'THƯƠNG HIỆU': variant['THƯƠNG HIỆU'] || '',
  'XUẤT XỨ': variant['XUẤT XỨ'] || '',
  'BẢO HÀNH': variant['BẢO HÀNH'] || '',
  'CHI NHÁNH': variant['CHI NHÁNH'] || '',  // ✅ fix nè
  quantity
}

  const existingIndex = cart.findIndex(item => item.ID === newItem.ID)
  if (existingIndex !== -1) cart[existingIndex].quantity += quantity
  else cart.push(newItem)

  localStorage.setItem(cartKey, JSON.stringify(cart))
  cartItems.value = cart
  showCartPanel.value = true
}


const removeFromCart = (id) => {
  const cartKey = `cart_${username}`
  const updatedCart = cartItems.value.filter(item => item.ID !== id)
  localStorage.setItem(cartKey, JSON.stringify(updatedCart))
  cartItems.value = updatedCart
}

watch(() => route.params.cat, fetchProducts)
watch(showCartPanel, (val) => {
  if (val) {
    const cartKey = `cart_${username}`
    cartItems.value = JSON.parse(localStorage.getItem(cartKey)) || []
  }
})

onMounted(async () => {
  await fetchProducts()
  console.log('👉 Kiểm tra sản phẩm đầu:', products.value[0])
})

const filterAttrs = ['TRỌNG LƯỢNG','KIỂU DÁNG','MÀU SẮC','KÍCH THƯỚC','CHẤT LIỆU','THƯƠNG HIỆU','XUẤT XỨ','BẢO HÀNH']

watchEffect(() => {
  products.value.forEach(product => {
    if (!product._variants || !product._selectedFilters) return

    const match = product._variants.find(v =>
      filterAttrs.every(attr => {
        const selected = product._selectedFilters[attr]
        return !selected || v[attr] === selected
      })
    )

    product._currentVariant = match || product

    // ✅ Gán đánh giá cho biến thể đang chọn
    product._currentVariant['ĐÁNH GIÁ'] = match?.['ĐÁNH GIÁ'] || 5

  })
})



const getAvailableOptions = (product, currentAttr) => {
  if (!product._variants || !product._selectedFilters) return []

  const filteredVariants = product._variants.filter(v =>
    filterAttrs.every(attr => {
      // bỏ qua chính attr đang xét
      if (attr === currentAttr) return true
      const selected = product._selectedFilters[attr]
      return !selected || v[attr] === selected
    })
  )

  return Array.from(new Set(filteredVariants.map(v => v[currentAttr]).filter(Boolean)))
}


const selectFilter = (product, attr, value) => {
  // Nếu đang chọn rồi thì bỏ chọn
  if (product._selectedFilters[attr] === value) {
    product._selectedFilters[attr] = undefined
  } else {
    product._selectedFilters[attr] = value
  }

  // Lọc ra biến thể khớp với filter hiện tại
  const matchedVariants = product._variants.filter(v =>
    filterAttrs.every(key => {
      const selected = product._selectedFilters[key]
      return !selected || v[key] === selected
    })
  )

  // Cập nhật filter còn lại để fit theo biến thể hợp lệ
  filterAttrs.forEach(key => {
    if (key !== attr) {
      const current = product._selectedFilters[key]
      const validValues = matchedVariants.map(v => v[key]).filter(Boolean)
      if (current && !validValues.includes(current)) {
        product._selectedFilters[key] = undefined
      }
    }
  })

  // Cập nhật biến thể hiển thị
  const bestMatch = matchedVariants.find(v =>
    filterAttrs.every(key => {
      const selected = product._selectedFilters[key]
      return !selected || v[key] === selected
    })
  )

  product._currentVariant = bestMatch || product
}

const getVisibleAttributes = (product) => {
  if (!product._variants) return []
  return filterAttrs.filter(attr =>
    product._variants.some(v => v[attr] && v[attr].toString().trim() !== '')
  )
}

const branchFilter = ref('')
const uniqueBranches = computed(() => {
  const allBranches = products.value.map(p => p._currentVariant?.['CHI NHÁNH']).filter(Boolean)
  return [...new Set(allBranches)]
})

const applyBranchFilter = () => {
  sortProducts()
}

const allBranches = computed(() => {
  return [...new Set(products.value.map(p => p._currentVariant?.['CHI NHÁNH']).filter(Boolean))]
})

const allCategories = computed(() => {
  return [...new Set(allProducts.value.map(p => p['DANH MỤC']).filter(Boolean))]
})

function selectBranch(branch) {
  branchFilter.value = branch;
  sortProducts();
}

function selectCategory(cat) {
  currentCategory.value = cat;
  filterProducts(); // tự viết hàm filter theo cat, không gọi lại fetchProducts (tránh reset lại data)
}
function filterProducts() {
  let filtered = currentCategory.value === 'TẤT CẢ'
    ? allProducts.value
    : allProducts.value.filter(p => p['DANH MỤC'] === currentCategory.value);

  // Reset lại các property phụ
  filtered.forEach(p => {
    p._SL = 1;
    p._selectedFilters = {};
    p._currentVariant = { ...p, 'CHI NHÁNH': p['CHI NHÁNH'] || '' };
  });

  // Gom group variant như cũ
  const variantsMap = {};
  filtered.forEach(p => {
    const name = p['TÊN SẢN PHẨM'];
    if (!variantsMap[name]) variantsMap[name] = [];
    variantsMap[name].push(p);
  });
  filtered.forEach(p => {
    p._variants = variantsMap[p['TÊN SẢN PHẨM']];
  });

  // Lọc trùng tên sản phẩm
  const unique = {};
  products.value = filtered.filter(p => {
    if (!unique[p['TÊN SẢN PHẨM']]) {
      unique[p['TÊN SẢN PHẨM']] = true;
      return true;
    }
    return false;
  });

  sortProducts();
}
function badgeClass(label) {
  switch (label?.toUpperCase()) {
    case 'VIP': return 'badge-vip';
    case 'HOT': return 'badge-hot';
    case 'MỚI': return 'badge-new';
    case 'CŨ': return 'badge-old';
    case 'SALE': return 'badge-sale';
    case 'FREESHIP': return 'badge-freeship';
    case 'BÁN CHẠY': return 'badge-best';
    default: return 'badge-default';
  }
}

function statusClass(status) {
  switch ((status || '').toUpperCase()) {
    case 'MỚI': return 'status-new';
    case 'CŨ': return 'status-old';
    case 'SẮP VỀ': return 'status-coming';
    default: return '';
  }
}

function goToDetail(id, event) {
  // Kiểm tra nếu click vào nút hoặc input bên trong (không chuyển trang)
  const tag = event.target.tagName.toLowerCase();
  if (
    ['button', 'input', 'select', 'svg', 'path', 'option'].includes(tag) ||
    event.target.closest('.btn') // hoặc các class đặc biệt của các nút, bộ lọc, etc.
  ) {
    return; // không chuyển trang nếu click vào nút/input
  }
  router.push(`/product/${id}`);
}
// Lấy giới hạn tồn kho cho từng item (nếu có logic số lượng thực tế)
function getProductMaxQty(item) {
  // Nếu muốn lấy số lượng tồn kho từ SANPHAM hoặc từ DB, xử lý logic ở đây
  // Ví dụ: return sản phẩm với id này, nếu không tìm thấy thì cho 999
  const found = allProducts.value.find(p => p.ID === item.ID);
  return found? Number(found['SỐ LƯỢNG']) : 99;
}

// Tăng số lượng sản phẩm trong giỏ
function increaseCartItem(item) {
  const maxQty = getProductMaxQty(item);
  if (item.quantity < maxQty) {
    item.quantity++;
    updateCartLocalStorage();
  }
}

// Giảm số lượng
function decreaseCartItem(item) {
  if (item.quantity > 1) {
    item.quantity--;
    updateCartLocalStorage();
  }
}

// Khi chỉnh số trực tiếp (input)
function onChangeCartItem(item) {
  let maxQty = getProductMaxQty(item);
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > maxQty) item.quantity = maxQty;
  updateCartLocalStorage();
}

// Hàm cập nhật lại localStorage
function updateCartLocalStorage() {
  const cartKey = `cart_${username}`;
  localStorage.setItem(cartKey, JSON.stringify(cartItems.value));
  // Nếu bạn muốn re-calculate lại tổng tiền/giá thì có thể gọi lại tính toán ở đây
}

const hoveredProduct = ref(null)
function getCardImage(product) {
  // Hover thì show ảnh phụ (nếu có), không thì ảnh chính
  if (
    hoveredProduct.value === product.ID &&
    Array.isArray(product.images) &&
    product.images.length > 1
  ) {
    return product.images[1]
  }
  // Bình thường trả về ảnh chính
  return product.images?.[0] || product._currentVariant['ẢNH(URL)']
}

function getCurrentProductImage(product) {
  const arr = product.images || []
  const idx = productImageIndexes.value[product.ID] ?? 0
  return arr[idx] || arr[0] || product._currentVariant['ẢNH(URL)']
}
function startAllProductImageLoops(interval = 1800) {
  // Xoá tất cả interval cũ
  Object.values(imageIntervals).forEach(clearInterval)
  imageIntervals = {}

  sortedProducts.value.forEach(product => {
    if (!product.images || product.images.length < 2) return
    productImageIndexes.value[product.ID] = 0
    imageIntervals[product.ID] = setInterval(() => {
      let idx = productImageIndexes.value[product.ID] ?? 0
      productImageIndexes.value[product.ID] = (idx + 1) % product.images.length
    }, interval)
  })
}

function onCardMouseEnter(product) {
  hoveredProductId.value = product.ID
  // Clear interval cũ của card này
  clearInterval(imageIntervals[product.ID])
  if (!product.images || product.images.length < 2) return
  // Tạo interval mới nhanh hơn
  imageIntervals[product.ID] = setInterval(() => {
    let idx = productImageIndexes.value[product.ID] ?? 0
    productImageIndexes.value[product.ID] = (idx + 1) % product.images.length
  }, 1000) // 0.4s đổi ảnh
}

function onCardMouseLeave(product) {
  hoveredProductId.value = null
  clearInterval(imageIntervals[product.ID])
  if (!product.images || product.images.length < 2) return
  // Tạo lại interval bình thường
  imageIntervals[product.ID] = setInterval(() => {
    let idx = productImageIndexes.value[product.ID] ?? 0
    productImageIndexes.value[product.ID] = (idx + 1) % product.images.length
  }, 1800) // 1.8s đổi ảnh
}

// Khi thay đổi sản phẩm hiển thị (sau load, sau sort...) thì reset lại interval
watch([sortedProducts, visibleCount], () => {
  startAllProductImageLoops()
})
onUnmounted(() => {
  Object.values(imageIntervals).forEach(clearInterval)
})

const showSidebar = ref(true);

// Tự động ẩn sidebar nếu là mobile
onMounted(() => {
  if (window.innerWidth < 992) showSidebar.value = false;
});
</script>


<style scoped>
.cart-panel {
  position: fixed;
  top: 80px;
  right: 0;
  width: 370px;
  background: linear-gradient(135deg, #fffefa, #ffffff);
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  z-index: 999;
  max-height: 90vh;
  overflow-y: auto;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.12);
  animation: slideLeft 0.4s ease-in-out forwards;
  transition: all 0.3s ease-in-out;
}

/* Hiệu ứng trượt */
@keyframes slideLeft {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.cart-panel h5 {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
  color: #fff !important;                /* <-- CHỈ cần dòng này */
  background: none !important;            /* <-- Chặn nền gradient chữ */
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
}


/* Sản phẩm trong giỏ */
.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.cart-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
  border: 1px solid #eee;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.cart-item-info small {
  color: #777;
}

/* Tổng tiền */
.cart-total {
  font-weight: bold;
  font-size: 18px;
  margin-top: 20px;
  color: #ed3737;
}

/* Nút hành động */
.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.cart-actions button {
  border: none;
  padding: 10px;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-view-cart {
  background: #fff;
  border: 2px solid #ed3737;
  color: #ed3737;
}

.btn-view-cart:hover {
  background: #ed3737;
  color: #fff;
}

.btn-checkout {
  background: linear-gradient(90deg, #ed3737 0%, #fcb045 100%);
  color: #fff;
}

.btn-checkout:hover {
  opacity: 0.9;
}


.card img {
  transition: transform 0.4s ease;
}
.card:hover img {
  transform: scale(1.07);
}

.card {
     margin: 0;
  background: linear-gradient(145deg, #fff1f0, #fff9f7); /* trắng pha đỏ cam nhạt */
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 85, 85, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: visible !important; /* ✅ không chặn bóng */
  position: relative; /* ✅ đảm bảo bóng hiển thị đúng */
  z-index: 1;

}

.card:hover img {
  transform: scale(1.2);
  box-shadow:
    0 0 12px rgba(17, 17, 17, 0.6);
   
  border: 2px solid rgba(97, 94, 94, 0.5);
}
.card:hover {
  transform: translateY(-6px) scale(1.1);
 box-shadow: 0 8px 32px 0 rgba(253,29,29,0.09); /* Bóng rõ khi hover card */
  border: 2px solid rgba(255, 90, 90, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 5;
}



.card-body {
  padding: 8px 16px;      /* Giảm lại nữa nếu muốn ngắn hơn nữa */
  background-color: #ffffff;
  border: 1px solid #fcf4e3;
  border-radius: 0 0 20px 20px;
  min-height: unset !important;   /* Không để chiều cao tối thiểu */
    box-shadow: 0 4px 16px 0 rgba(0,0,0,0.08);    /* Bóng nhẹ */
 
}

.card-body h6,
.card-body p,
.card-body div,
.card-body .mb-2,
.card-body .mb-3 {
  margin-bottom: 4px !important;
  
}



.custom-addtocart {
  background:rgb(68, 18, 18) !important;
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  transition: box-shadow 0.2s, filter 0.18s;
  box-shadow: 0 1px 10px #fd7e1419;
}
.custom-addtocart:hover {
  filter: brightness(1.05) contrast(1.03);
  box-shadow: 0 6px 24px #fd7e1420;
  opacity: 0.5;
}


.custom-loadmore {
  color: #ed3737;
  border: 2px solid #ed3737;
  background-color: transparent;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.custom-loadmore:hover {
  background: linear-gradient(90deg, rgba(237, 55, 55, 1) 0%, rgba(253, 29, 29, 1) 45%, rgba(252, 176, 69, 1) 100%);
  color: #fff;
  border-color: transparent;
}

h6 {
  
  font-weight: bold;
  font-size: 20px;
}

.form-select {
  border-radius: 10px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #fd1d1d;
  box-shadow: 0 0 6px rgba(253, 29, 29, 0.3);
}

/* Bộ lọc sort label */
label.fw-bold {
  color: #444;
}

/* Bo tròn nút + hover cho +/- */
.btn-outline-secondary {
  border-radius: 8px !important;
  transition: all 0.2s ease-in-out;
}

.btn-outline-secondary:hover {
  background-color: #ed3737;
  color: #fff;
  border-color: #ed3737;
}

/* Input quantity */
input[type="number"] {
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* Responsive fix cho thẻ card */
@media (max-width: 768px) {
  .card-img-top {
    height: 180px !important;
  }
}

.card img {
  transition: transform 0.4s ease;
}
.card:hover img {
  transform: scale(1.05);
  
}

.btn-outline-secondary {
  border-radius: 20px;
  padding: 2px 10px;
}

.btn-primary {
  border-radius: 20px;
  padding: 2px 10px;
  background-color: #ed3737;
  border-color: #ed3737;
}
.branch-green {
  color: #21b573 !important;
  font-weight: 700;
  font-size: 1.06em;
  margin-top: 7px;
  letter-spacing: 0.01em;
}


/* Sidebar card (Chi nhánh/Danh mục) */
.col-md-3 > .card {
  background: rgb(255, 255, 255);
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 18px 0 rgba(237,55,55,0.08), 0 1.5px 4px 0 #fff;
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.col-md-3 > .card:hover {
  box-shadow: 0 8px 28px 0 rgba(253,29,29,0.12), 0 4px 10px 0 #fff3;
}



/* List-group in sidebar */
.col-md-3 > .card {
  background: #fff;
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 18px 0 rgba(237,55,55,0.08), 0 1.5px 4px 0 #fff;
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.col-md-3 > .card:hover {
  box-shadow: 0 8px 28px 0 rgba(253,29,29,0.12), 0 4px 10px 0 #fff3;
}



/* List-group in sidebar */
.list-group.list-group-flush {
  border-radius: 0 0 18px 18px;
  background: transparent;
}
.list-group-item {
  border: none;
  border-radius: 12px;
  margin: 4px 12px;
  background: #fff;                 /* <-- nền trắng mặc định */
  color: #b00404;                   /* <-- chữ nâu mặc định */
  font-weight: bold;
  font-size: 15px;
  padding: 9px 18px;
  transition: background 0.22s, color 0.22s;
  cursor: pointer;
  position: relative;
}
.list-group-item.active,
.list-group-item:hover {
  background: rgb(68, 18, 18) !important;
  color: #fff !important;
  font-weight: 700;
  box-shadow: 0 1.5px 10px rgba(253,29,29,0.07);
}
.list-group-item.active:before,
.list-group-item:hover:before {
  content: '';
  position: absolute;
  left: 7px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.92;
}

/* Mobile fix */
@media (max-width: 768px) {
  .col-md-3 { margin-bottom: 18px; }
  .col-md-3 > .card { margin-bottom: 18px; }
}


/* ===== CARD SẢN PHẨM E-COMMERCE CHUYÊN NGHIỆP ===== */
.product-card {
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid #ffe0b2;
  box-shadow: 0 2px 10px #ecd8c538;
  padding: 0;
  margin-bottom: 24px;
  font-size: 1rem;
  transition: box-shadow 0.18s, transform 0.16s;
  overflow: hidden;
  position: relative;
}
.product-card:hover {
  box-shadow: 0 8px 36px #eeb77a34;
  transform: translateY(-8px) scale(1.025);
  border: 2px solid #ffd39b;
  z-index: 4;
}

.card-img-top {
  height: 210px;
  object-fit: cover;
  width: 100%;
border-radius: 15px;
  background: #fdf6f2;
  box-shadow: 0 2px 24px 0 rgba(109, 108, 108, 0.05);
  aspect-ratio: 1/1;
  border: 2.5px solid #dad7d7;
}

.product-title {
  color: #fd1d1d;
  font-weight: 800;
  font-size: 1.09rem;
  margin-bottom: 3px;
  line-height: 1.23;
  text-transform: uppercase;
  min-height: 34px;
}

.status-badge {
  display: inline-block;
  font-size: 0.99em;
  border-radius: 9px;
  padding: 2.5px 11px;
  font-weight: 700;
  background: #e9f7ee;
  color: #23b723;
  margin-right: 6px;
  letter-spacing: 0.02em;
}
.status-badge.text-danger { color: #fd1d1d; background: #ffede9; }
.status-badge.text-warning { color: #fcb045; background: #fff9e1; }
.sold {
  color: #bcbcbc;
  margin-left: 6px;
  font-size: 0.97em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.rating {
  color: #ffc107;
  font-size: 1.09em;
  margin: 4px 0 7px 0;
  letter-spacing: 2.5px;
}

.attr-badge {
  background: #fff8e1;
  color: #ed7d31;
  border: 1.2px solid #ffe0b2;
  border-radius: 8px;
  padding: 1.5px 8px;
  margin: 0 4px 0 0;
  font-size: 0.97em;
  font-weight: 600;
  display: inline-block;
}

.desc {
  font-size: 0.97em;
  color: #b06a0d;
  min-height: 30px;
  margin: 2px 0 6px 0;
  opacity: 0.89;
}

.old-price {
  color: #bbb;
  font-size: 1em;
  text-decoration: line-through;
  margin-right: 10px;
  font-weight: 500;
  opacity: 0.77;
}
.sale-price {
  color: #fd1d1d;
  font-weight: 900;
  font-size: 1.19em;
  letter-spacing: 0.04em;
}
.qty-group {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fff5e1;
  border-radius: 8px;
  border: 1px solid #fde1c0;
  padding: 2px 8px;
}
.qty-group button {
  background: none;
  border: none;
  font-size: 1.16em;
  color: #fd7d1d;
  width: 26px;
  height: 26px;
  font-weight: 700;
  border-radius: 6px;
  transition: background 0.14s;
}
.qty-group button:hover {
  background: #fff0c5;
}
.qty-group input {
  border: none;
  width: 32px;
  text-align: center;
  background: none;
  font-weight: 800;
  color: #fd1d1d;
  outline: none;
  font-size: 1.1em;
}
.add-to-cart {
  background: linear-gradient(90deg, #fd1d1d 48%, #fcb045 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1.06em;
  padding: 6px 22px;
  border: none;
  border-radius: 9px;
  margin-left: 8px;
  transition: filter 0.16s;
  box-shadow: 0 1px 5px #fd1d1d18;
}
.add-to-cart:hover {
  filter: brightness(1.07);
}

.branch {
  color: #ed7d31;
  font-size: 1em;
  margin-top: 10px;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.01em;
}

/* Badge sale, hot... */
.badge.custom-badge {
  position: absolute;
  top: 14px; left: 14px;
  z-index: 3;
}
.badge-sale {
  position: absolute;
  top: 14px; right: 14px;
  background: linear-gradient(90deg, #fff7b0 50%, #fcb045 100%) !important;
  color: #e85d04 !important;
  border-radius: 12px 20px 12px 12px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 1px 4px #fcb04533;
}

@media (max-width: 1200px) {
  .card-img-top { height: 120px !important; }
  .product-card { min-width: 99%; margin: 9px auto;}
}
@media (max-width: 768px) {
  .card-img-top { height: 110px !important; }
  .product-card { min-width: 99%; margin: 8px auto; }
}

.custom-branch-select {
  border: 2px solid #23b723;
  color: #23b723;
  font-weight: 700;
}
.custom-branch-select:focus {
  box-shadow: 0 0 6px #23b72344;
  border-color: #23b723;
}

.custom-addtocart {
  background: linear-gradient(90deg, #fd1d1d 48%, #fcb045 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.08rem;
  padding: 8px 0;
  transition: filter 0.16s, box-shadow 0.18s;
  box-shadow: 0 1.5px 8px #fd1d1d12;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.custom-addtocart:hover {
  filter: brightness(1.05);
}

.plus-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  box-shadow: 0 2px 6px #fd1d1d18;
}

.plus-icon {
  color: #fd1d1d;
  font-size: 1.7rem;
  font-weight: 900;
  display: block;
  line-height: 1;
  user-select: none;
}

.product-badge {
  position: absolute;
  
  top: 12px;
  left: 12px;
  z-index: 4;
  padding: 5.5px 20px 5.5px 20px;
  font-size: 15.5px;
  font-weight: 900;
  border-radius: 16px;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 6px #0004, 0 0px 2px #fff4;
  box-shadow: 0 3px 18px #0002, 0 1.5px 8px #0003;
  border: 2px solid #fff9;
  transition: filter 0.13s, transform 0.13s;
  filter: drop-shadow(0 2px 10px #0002);
  user-select: none;
  cursor: pointer;
}

/* VIP: nền đen, chữ vàng đậm */
.badge-vip {
  background: linear-gradient(120deg, #222 60%, #434343 100%);
  color: #ffd700;
  border-color: #ffd70044;
  box-shadow: 0 2px 12px #ffd70022, 0 1.5px 8px #0005;
}

/* HOT: nền đỏ, chữ vàng đậm */
.badge-hot {
  background: linear-gradient(120deg, #ff1e1e 60%, #f55 100%);
  color: #ffd700;
  border-color: #ffd70055;
  box-shadow: 0 2px 14px #ffd70015, 0 1.5px 8px #ff1e1e44;
}

/* MỚI: nền xanh lá cây, chữ trắng đậm */
.badge-new {
  background: linear-gradient(120deg, #21b573 70%, #00c972 100%);
  color: #fff;
  border-color: #b9f7e2cc;
  box-shadow: 0 2px 12px #21b57333, 0 1.5px 8px #00c97244;
}

/* CŨ: nền nâu, chữ trắng đậm */
.badge-old {
  background: linear-gradient(120deg, #8d5524 65%, #c68642 100%);
  color: #fff;
  border-color: #dcb997aa;
  box-shadow: 0 2px 12px #8d552422, 0 1.5px 8px #b58753bb;
}

/* SALE: nền vàng, chữ đỏ đậm */
.badge-sale {
  background: linear-gradient(120deg, #ffd600 65%, #ffe570 100%);
  color: #d50000;
  border-color: #d5000035;
  box-shadow: 0 2px 14px #ffd60055, 0 1.5px 8px #d5000022;
  text-shadow: 0 1.5px 6px #d5000055, 0 0.5px 2px #fff7;
}

/* FREESHIP: xanh dương, chữ vàng đậm */
.badge-freeship {
  background: linear-gradient(120deg, #1976d2 70%, #57afff 100%);
  color: #ffd600;
  border-color: #ffd60033;
  box-shadow: 0 2px 13px #1976d255, 0 1.5px 8px #57afff33;
}

/* BÁN CHẠY: nền cam, chữ xanh dương */
.badge-best {
  background: linear-gradient(120deg, #ff9800 70%, #ffcd38 100%);
  color: #1976d2;
  border-color: #1976d242;
  box-shadow: 0 2px 13px #ff980044, 0 1.5px 8px #ffcd3833;
}
.badge-default {
  background: linear-gradient(120deg, #f5f5f5 60%, #e0e0e0 100%);
  color: #424242;
  border-color: #bdbdbd77;
  font-weight: 800;
  box-shadow: 0 2px 10px #bdbdbd33, 0 1.5px 8px #fff7;
  text-shadow: 0 1px 3px #fff7, 0 0.5px 2px #bdbdbd22;
}


/* Tình trạng: MỚI, CŨ, SẮP VỀ (nhỏ gọn) */
.status-badge {
  display: inline-block;
  width: fit-content;
  font-size: 12px;           /* nhỏ gọn hơn */
  border-radius: 7px;
  padding: 2px 9px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 2px;
  margin-right: 6px;
  box-shadow: 0 1.5px 6px #0001;
  border: 1.5px solid #fff9;
  user-select: none;
  text-shadow: 0 0.5px 2px #fff8, 0 0.5px 2px #0001;
  transition: filter 0.15s;
  vertical-align: middle;
}

/* MỚI: nền xanh lá, chữ trắng */
.status-new {
  background: linear-gradient(120deg, #21b573 75%, #00c972 100%);
  color: #fff;
  border-color: #a7e8ce;
}

/* CŨ: nền nâu, chữ trắng */
.status-old {
  background: linear-gradient(120deg, #a77b51 80%, #dec1a2 100%);
  color: #fff;
  border-color: #e8cfbb;
}

/* SẮP VỀ: nền vàng, chữ đen */
.status-coming {
  background: linear-gradient(120deg, #ffd600 85%, #fffbc1 100%);
  color: #232323;
  border-color: #ffe570aa;
}

.btn-qty {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  transition: filter 0.18s, box-shadow 0.19s;
  box-shadow: 0 2px 8px #0001;
  cursor: pointer;
  background: #ededed;
  color: #fff;
  padding: 0;
  user-select: none;
}
.btn-qty:active {
  filter: brightness(0.92);
}
.qty-plus {
  background: linear-gradient(120deg, #21b573 60%, #1acc34 100%);
  color: #fff !important;
  border: 2px solid #23b72344;
}
.qty-minus {
  background: linear-gradient(120deg, #ed3737 60%, #fd1d1d 100%);
  color: #fff !important;
  border: 2px solid #ed373755;
}
.btn-qty:hover {
  filter: brightness(1.06) contrast(1.09);
  box-shadow: 0 4px 16px #0002;
}
/* Hiệu ứng fade cho cart item */
.cart-fade-enter-active, .cart-fade-leave-active {
  transition: opacity 0.36s cubic-bezier(.65,1.38,.48,.56), transform 0.38s cubic-bezier(.62,1.37,.37,.59);
}
.cart-fade-enter-from, .cart-fade-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}
.cart-fade-enter-to, .cart-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.product-skeleton {
  background: #f7f7f7;
  border-radius: 20px;
  min-height: 330px;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 2px 10px #ddd7;
}
.skeleton-img {
  width: 100%;
  height: 210px;
  border-radius: 20px 20px 0 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #f5f5f5 40%, #eaeaea 65%);
  animation: skeleton-loading 1.2s infinite linear;
}
.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #f5f5f5 40%, #eaeaea 65%);
  border-radius: 10px;
  margin-bottom: 14px;
  animation: skeleton-loading 1.2s infinite linear;
}
.skeleton-line-sm { height: 13px; width: 80%; }
.skeleton-title { width: 70%; height: 22px; margin-bottom: 18px; }
@keyframes skeleton-loading {
  0% { background-position: -100px 0; }
  100% { background-position: 180px 0; }
}
.stacked-img {
  will-change: opacity, transform;
  backface-visibility: hidden;
  pointer-events: none; /* Chặn ảnh dưới click */
}

.cart-panel-header {
  background: rgb(238 44 44);
  padding: 16px 18px 12px 18px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  margin: -20px -20px 18px -20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cart-panel-header h5,
.cart-panel-header .fw-bold {
  color: #fff !important;  /* <-- màu trắng đậm */
  font-weight: 900;
  margin-bottom: 0;
  font-size: 1.2rem;
  letter-spacing: 0.8px;
}

.cart-panel-header .btn-close {
  background: #fff !important;
  border-radius: 50%;
  opacity: 0.7;
  transition: background 0.18s, opacity 0.14s;
  padding: 6px;
}
.cart-panel-header .btn-close:hover {
  background: #b00404 !important;
  opacity: 1;
}

.btn-close.custom-x {
  color: #b00404 !important;      /* màu X đậm trên nền trắng */
  background: #fff !important;    /* nền trắng bo tròn */
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1 !important;
  border: none;
  box-shadow: 0 2px 8px #b0040433;
  transition: background 0.19s, color 0.13s;
}
.btn-close.custom-x:hover {
  background: #fa0b0b !important;
  color: #fff !important;
  opacity: 0.5;
}
.btn-close.custom-x {
  background-image: none !important;
}

/* Thêm dưới cùng file style */
@media (min-width: 1200px) {
  .col-2-4 {
    flex: 0 0 20%;
    max-width: 20%;
    padding-left: 8px;
    padding-right: 8px;
  }
}
@media (min-width: 992px) and (max-width: 1199.98px) {
  .col-2-4 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}
@media (max-width: 991.98px) {
  .col-2-4 {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
  }
}
@media (max-width: 767.98px) {
  .col-2-4 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}
@media (max-width: 575.98px) {
  .col-2-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.row.products-row {
  row-gap: 22px;
  column-gap: 18px;
}

.container {
  max-width: 1400px !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
}

/* ---- SỬA MỚI: Sidebar trắng, bóng đẹp, chuyên nghiệp ---- */
.col-lg-3 > .card,
.col-md-4 > .card,
.col-md-3 > .card {
  background: #fff !important; /* Nền trắng */
  border: none;
  border-radius: 22px;
  box-shadow: 0 8px 36px 0 rgba(253,29,29,0.14), 0 3.5px 16px 0 #ffebee;
  margin-bottom: 26px;
  overflow: hidden;
  transition: box-shadow 0.32s;
}
.col-lg-3 > .card:hover,
.col-md-4 > .card:hover,
.col-md-3 > .card:hover {
  box-shadow: 0 20px 46px 0 rgba(253,29,29,0.20), 0 12px 26px 0 #fff3;
  z-index: 5;
}

/* Header của card sidebar: Trắng hoàn toàn, chữ đỏ */
.card-header.fw-bold {
  background: rgb(68, 18, 18);
  color: #ffffff !important;
  border-bottom: 1.5px solid #fce4e4;
  border-radius: 22px 22px 0 0;
  box-shadow: none;
  padding: 18px 22px 13px 22px;
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 0.8px;
}

/* List-group sidebar: giữ hover và active đẹp */
.list-group.list-group-flush {
  background: transparent;
  border-radius: 0 0 22px 22px;
  padding-bottom: 8px;
}
.list-group-item {
  background: #fafafa;
  color: rgb(68, 18, 18);
  border: none;
  border-radius: 13px;
  margin: 6px 12px;
  font-weight: 700;
  font-size: 15.3px;
  padding: 10px 20px;
  transition: background 0.19s, color 0.18s, box-shadow 0.14s;
  position: relative;
  cursor: pointer;
}
.list-group-item.active,
.list-group-item:hover {
  background: rgb(176, 4, 4);
  color: #fff !important;
  box-shadow: 0 4px 18px #fd1d1d1a;
  font-weight: 800;
}
.list-group-item.active:before,
.list-group-item:hover:before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.87;
}

@media (max-width: 991.98px) {
  .col-md-3,
  .col-md-4,
  .col-lg-3 {
    margin-bottom: 16px;
  }
}
@media (min-width: 992px) {
  .col-lg-3, .col-md-4 {
    position: sticky;
    top: 100px; /* Chiều cao header cố định */
    z-index: 10;
  }
}

/* Animation trượt vào cho sidebar */
@keyframes sidebar-slidein {
  from {
    transform: translateX(-48px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}
.sidebar-slidein {
  animation: sidebar-slidein 0.72s cubic-bezier(.41,1.34,.52,.98) 0.08s both;
  will-change: transform, opacity;
}

/* Fade-in cực nhẹ */
.fade-enter-active {
  animation: fadeInCard 0.42s cubic-bezier(.41,1.18,.49,1) both;
  will-change: opacity, transform;
}
.fade-leave-active {
  animation: fadeOutCard 0.18s cubic-bezier(.51,1.1,.61,1) both;
  position: absolute !important;
  z-index: 0;
}
@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fadeOutCard {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
}

.btn-qty {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgb(68, 18, 18);
  outline: none;
  background: transparent;
  box-shadow: 0 1.5px 6px #0001;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.13rem;
  font-weight: 800;
  color: #130202;
  cursor: pointer;
  transition: background 0.17s, box-shadow 0.16s, color 0.13s, transform 0.12s;
  user-select: none;
  margin: 0 3px;
}

.btn-qty:active {
  filter: brightness(0.93);
  transform: scale(0.93);
}

.btn-qty:hover, .btn-qty:focus {
  background: #b00404;
  color: #fff;
  border-color: #b00404;
}

.input-qty {
  width: 38px;
  height: 28px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 2px;
  transition: border 0.13s;
  outline: none;
  background: #fffdfa;
  color: #290303;
  padding: 0 2px;
}


.filter-btn {
  border: 1.5px solid rgb(68, 18, 18);
  background: #fffbf8;
  color: rgb(68, 18, 18);
  border-radius: 13px;
  font-weight: 700;
  font-size: 1em;
  padding: 2.5px 13px;
  margin-right: 6px;
  margin-bottom: 4px;
  transition: background 0.15s, color 0.15s, border 0.15s, box-shadow 0.14s;
  box-shadow: 0 1.5px 5px #c9c9c921;
  outline: none;
}
.filter-btn:hover,
.filter-btn:focus {
  background: #b00404;        /* đỏ bã trầu */
  color: #fff;
  border-color: #b00404;
}

.filter-btn:focus {
 border: 1.5px solid rgb(68, 18, 18);
  background: #fffbf8;
  color: rgb(68, 18, 18);

}
/* Khi đã chọn */
.filter-btn.selected,
.filter-btn.active {
  background: #442a12;        /* nâu đà */
  color: #fff;
  border-color: #613b1a;
  box-shadow: 0 2px 9px #b004043a;
}

.attr-label {
  font-size: 0.97em;
  font-weight: bold;
  font-style: italic;
  color: #995d45;      /* Nâu nhạt, dễ nhìn */
  margin-bottom: 3px;
  margin-top: 7px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  display: block;
}

.sidebar-fixed-ecom {
  position: fixed;
  top: 100px; /* chỉnh đúng chiều cao header của bạn */
  left: 0;
  width: 250px;  /* tuỳ ý, nhưng thường 220-270px là vừa */
  height: calc(100vh - 70px);
  z-index: 1002;
  background: transparent;
  padding: 0 7px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  pointer-events: auto;
}

.sidebar-fixed-ecom .card {
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(253,29,29,0.11), 0 1.5px 7px 0 #fff;
  margin-bottom: 18px;
}

@media (max-width: 991.98px) {
  .sidebar-fixed-ecom {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;
    padding: 0;
    z-index: 1;
  }
}

.toggle-sidebar-btn {
  position: fixed;
  top: 180px;
  left: 10px;
  z-index: 1200;
  background: #420505;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 9px 19px 9px 13px;
  font-weight: bold;
  font-size: 1.15em;
  box-shadow: 0 2px 18px #b0040455;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: background 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.toggle-sidebar-btn.opened {
  left: 260px; /* Đẩy nút ra ngoài sidebar khi đã mở */
  background: #fff;
  color: #b00404;
  box-shadow: 0 2px 14px #b0040440;
}

@media (max-width: 991.98px) {
  .toggle-sidebar-btn {
    top: 80px;
    left: 10px;
    font-size: 1.09em;
    padding: 7px 15px 7px 11px;
    border-radius: 16px;
  }
  .toggle-sidebar-btn.opened {
    left: 95vw;
  }
}

</style>
