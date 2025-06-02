<template>
    <!-- MODAL PHÓNG TO ẢNH -->
  <div v-if="showImgModal" class="modal-backdrop" @click.self="showImgModal = false">
    <button class="modal-nav left" @click.stop="prevImgModal" :disabled="imgModalIndex === 0">←</button>
    <img :src="imgModalSrc" class="modal-image" />
    <button class="modal-nav right" @click.stop="nextImgModal" :disabled="imgModalIndex === allImgList.length - 1">→</button>
  </div>
   <div class="product-detail-4box">
    <!-- SKELETON LOADING -->
    <template v-if="!product">
      <div class="box box1"><div class="skeleton skeleton-title mb-3"></div></div>
      <div class="box box3"><div class="skeleton skeleton-desc mb-4"></div></div>
      <div class="box box2">
        <div class="skeleton skeleton-img mb-3"></div>
        <div class="d-flex gap-2 flex-wrap mt-2">
          <div v-for="n in 4" :key="n" class="skeleton skeleton-thumb"></div>
        </div>
      </div>
      <div class="box box4">
        <div class="skeleton skeleton-badge mb-2"></div>
        <div class="skeleton skeleton-price mb-3"></div>
        <div class="skeleton skeleton-attr mb-2"></div>
        <div class="skeleton skeleton-list mb-4"></div>
        <div class="d-flex align-items-center gap-2 mb-2">
          <div class="skeleton skeleton-input"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
        <div class="skeleton skeleton-btn-long mt-3"></div>
      </div>
    </template>
    <!-- NỘI DUNG THẬT -->
    <template v-else>
      <!-- Box 1: TÊN SẢN PHẨM -->
      <div class="box box1">
        <h3 class="product-title">{{ product['TÊN SẢN PHẨM'] }}</h3>
       

      </div>
      <!-- Box 3: MÔ TẢ -->
      <div class="box box3">
        <h2>MÔ TẢ SẢN PHẨM</h2>
        <div class="product-desc">{{ product['MÔ TẢ'] }}</div>
      </div>
      <!-- Box 2: ẢNH CHÍNH VÀ ẢNH NHỎ -->
 <!-- BOX 2: ẢNH CHÍNH + THUMBNAIL, tất cả tên riêng -->
<div class="box box2">
  
  <!-- ẢNH CHÍNH -->
  <img
    :src="mainImg"
    class="img-main"
    alt="Ảnh sản phẩm"
    @click="openImgModal(mainImg, allImgList)"
    style="cursor: zoom-in"
  />
  <!-- DANH SÁCH THUMBNAIL -->
  <div class="img-thumbs mt-2">
    <img
      v-for="(img, i) in imgThumbs"
      :key="i"
      :src="img"
      @click="selectImgThumb(img)"
      :class="{ active: mainImg === img }"
      class="img-thumb"
      :alt="'Thumbnail ' + (i + 1)"
    />
  </div>

</div>

      <!-- Box 4: THÔNG TIN CÒN LẠI -->
      <div class="box box4">
        <h2>THÔNG TIN SẢN PHẨM</h2>
        
        <!-- Bộ lọc thuộc tính -->
        <div v-for="(values, key) in filters" :key="key" v-show="values.length > 0" class="mb-3 filter-block">
          <div class="filter-label">{{ key }}:</div>
          <div class="filter-options d-flex flex-wrap gap-2 mt-1">
            <span
              v-for="val in values"
              :key="val"
              class="filter-badge"
              :class="{ 'selected': selectedAttributes[key] === val }"
              @click="filterByAttribute(key, val)"
            >
              {{ val }}
            </span>
          </div>
        </div>
        <!-- Badges và info -->
       <div class="product-badges d-flex flex-wrap gap-2 mb-3">
  <span class="badge-minimal badge-buy">
    🔥 <b>Lượt mua:</b> {{ product['LƯỢT MUA'] }}
  </span>
  <span class="badge-minimal badge-star">
    ⭐ <b>Đánh giá:</b>
    <span>
      <span v-for="n in 5" :key="n" :style="{ color: n <= Math.round(avgRating) ? '#FFD600' : '#BBB' }">★</span>
      <span class="badge-rating-text">({{ avgRating }}/5)</span>
    </span>
  </span>
  <span class="badge-minimal badge-status">
    📦 <b>Tình trạng:</b> {{ product['TÌNH TRẠNG'] }}
  </span>
  <span v-for="(branch, i) in branchList" :key="i" class="badge-minimal badge-branch">
    🏢 <b>Chi nhánh:</b> {{ branch }}
  </span>
</div>
        <!-- Số lượng & nút giỏ hàng -->
        <label class="form-label fw-semibold text-dark">Số lượng:</label>
        <div class="d-flex align-items-center gap-2 mb-2">
          <button class="btn btn-outline-secondary btn-sm" @click="decreaseQty">-</button>
          <input
            type="number"
            class="form-control form-control-sm"
            v-model.number="quantity"
            :max="maxQty"
            :min="1"
            style="width: 60px; text-align: center;"
          />
          <button class="btn btn-outline-secondary btn-sm" @click="increaseQty">+</button>
          <h5 class="text-muted small">Còn lại: {{ product['SỐ LƯỢNG'] }}</h5>
        </div>
        
         <!-- Giá và khuyến mãi -->
        <div class="mb-2">
          <span v-if="fakeOriginalPrice > formatPrice(product['GIÁ'])" class="text-muted text-decoration-line-through me-2 fs-6">{{ fakeOriginalPrice }}₱</span>
         <span v-if="product['KHUYẾN MÃI'] > 0" class="badge bg-warning text-dark ms-2">-{{ product['KHUYẾN MÃI'] }}%</span> <br>
          <span class="fs-4 fw-bold text-danger">{{ formatPrice(product['GIÁ']) }}₱</span>
     
        </div>
        <div style="display: flex; justify-content: flex-end;">
          
  <button
    v-if="product['SỐ LƯỢNG'] > 0"
    class="btn btn-addcart fw-bold mt-3 px-4"
    @click="addToCart"
  >
    Thêm vào giỏ hàng
  </button>
  <button v-else class="btn btn-secondary mt-3 px-4" disabled>Sản phẩm tạm hết hàng</button>
</div>


      </div>
      
    </template>
    
  </div>

<!-- THÔNG TIN KHUYẾN MÃI & CHI NHÁNH CÓ HÀNG -->
<div
  v-if="branchList.length > 0"
  class="position-absolute"
  style="top: 150px; right: 20px; z-index: 5;"
>
<!-- BẢNG 1: Thông tin khuyến mãi -->
<div class="info-card-v2 promo-card">
  <div class="info-card-header promo-header">
    🎁 Thông tin khuyến mãi
  </div>
  <div class="info-card-body promo-body">
    {{ product['THÔNG TIN KHUYẾN MÃI'] || 'Không có thông tin khuyến mãi.' }}
  </div>
</div>

<!-- BẢNG 2: Có hàng tại chi nhánh -->
<div class="info-card-v2 branch-card">
  <div class="info-card-header branch-header">
    📍 Có hàng tại chi nhánh:
  </div>
  <div class="info-card-body branch-body">
    <div v-for="(branch, index) in branchList" :key="index" class="branch-row">
      🏬 {{ branch }}
    </div>
  </div>
</div>
</div>
    <!-- FORM ĐÁNH GIÁ -->
<!-- REVIEW SECTION: full width, 2 box, bo góc lớn -->
<div class="review-section-wide my-5">
  <div class="container-review d-flex flex-wrap justify-content-center gap-5">
    <!-- Khung gửi đánh giá -->
     
    <div class="review-form-box flex-grow-1 mb-4">
      <transition name="slide-fade">
        <div v-if="showReviewForm">
          <h5 class="review-title">FORM ĐÁNH GIÁ <i class="fa-solid fa-pen-to-square fa-xl"></i></h5>
          <div class="mb-3">
            <label class="form-label fw-semibold">Số sao:</label>
          <div class="d-flex gap-1">
  <span
    v-for="i in 5"
    :key="i"
    @mouseenter="hoverRating = i"
    @mouseleave="hoverRating = 0"
    @click="newRating = i"
    class="star"
    :class="{ active: i <= (hoverRating || newRating) }"
  >★</span>
</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Bình luận:</label>
            <textarea v-model="newComment" rows="3" class="form-control" placeholder="Nhập bình luận..."></textarea>
          </div>
          <label class="form-label fw-semibold">Ảnh minh họa (tối đa 4):</label>
          <input type="file" multiple accept="image/*" @change="handleImages" class="form-control mb-2" />
          <div class="d-flex gap-2 mt-2">
            <img v-for="(img, i) in previewImages" :key="i" :src="img" class="img-thumb" />
          </div>
          <button class="btn btn-send" :disabled="submitting" @click="submitComment">
            {{ submitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
          </button>
        </div>
      </transition>
    </div>
    
    <!-- KHUNG TÓM TẮT ĐÁNH GIÁ (2) -->
    <transition name="slide-fade">
  <div v-if="!loadingComments" class="review-summary-box flex-grow-1 mb-4">
    <ReviewSummary :comments="comments" :avgRating="avgRating" />
  </div>
</transition>

    <!-- Khung hiển thị đánh giá -->
    <div class="review-list-box flex-grow-2">
      <h5 class="review-title mb-3">NỘI DUNG ĐÁNH GIÁ TỪ KHÁCH <i class="fa-solid fa-user fa-xl"></i></h5>
      <!-- Skeleton loading -->
      <div v-if="loadingComments" class="skeleton-list-review">
        <div v-for="n in 3" :key="n" class="review-user-item skeleton-review-card">
          <div class="d-flex align-items-start gap-3">
            <div class="skeleton skeleton-avatar"></div>
            <div class="w-100">
              <div class="skeleton skeleton-name mb-2"></div>
              <div class="skeleton skeleton-stars mb-2"></div>
              <div class="skeleton skeleton-comment mb-2"></div>
              <div class="d-flex gap-2 mt-1">
                <div v-for="i in 2" :key="i" class="skeleton skeleton-img-mini"></div>
              </div>
              <div class="skeleton skeleton-btn-like mt-3"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Hiển thị đánh giá thật -->
      <div v-else>
        <div v-if="comments.length > 0">
          <div v-for="(cmt, index) in displayedComments" :key="index" class="review-user-item">
            <div class="d-flex align-items-start gap-3">
              <img :src="cmt.avatar || 'https://i.ibb.co/nDypvGk/user-default.png'" alt="avatar" class="avatar" />
              <div >
                <p class="mb-1 fw-bold">
                  {{ cmt.username }}
                  <small class="text-muted ms-2">{{ cmt.time }}</small>
                </p>
                <p class="mb-1">
                  <span v-for="i in 5" :key="i">
                    <span class="star" :class="{ active: i <= Number(cmt.rating) }">★</span>
                  </span>
                </p>
                <p class="mb-2">{{ cmt.comment }}</p>
                <!-- Ảnh đánh giá -->
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <img
                    v-for="(img, idx) in [cmt.img1, cmt.img2, cmt.img3, cmt.img4].filter(i => i && i.startsWith('http'))"
                    :key="idx"
                    :src="img"
                    class="img-thumb"
                    @click="openImage(img, [cmt.img1, cmt.img2, cmt.img3, cmt.img4])"
                    style="cursor: zoom-in"
                  />
                </div>
                <!-- ❤️ Lượt tym -->
                <div class="mt-2">
                <button
  class="btn btn-like"
  :class="{ liked: cmt.liked }"
  @click="likeComment(cmt)"
>
  <i class="fa-solid fa-thumbs-up fa-xl"></i>
  <span class="like-count" :class="{ bump: cmt.justLiked }">{{ cmt['LƯỢT TYM'] }}</span>
</button>
                </div>
                <!-- 💬 Danh sách phản hồi -->
                <div v-if="repliesMap[cmt.rowIndex]?.length" class="mt-3">
                  <div v-for="(r, idx) in repliesMap[cmt.rowIndex]" :key="idx"
                    class="bg-light p-2 border rounded small mb-1 d-flex align-items-start gap-2">
                    <img :src="r.avatar || 'https://i.ibb.co/nDypvGk/user-default.png'" class="avatar-sm" />
                    <div>
                      <strong>{{ r.username }}</strong>
                      <small class="text-muted ms-2">{{ r.time }}</small>
                      <div>{{ r.content }}</div>
                    </div>
                  </div>
                </div>
                <!-- Modal xem ảnh to -->
                <div v-if="showImageModal" class="modal-backdrop" @click.self="showImageModal = false">
                  <button class="modal-nav left" @click.stop="prevImage" :disabled="currentIndex === 0">←</button>
                  <img :src="currentImage" class="modal-image" />
                  <button class="modal-nav right" @click.stop="nextImage" :disabled="currentIndex === imageList.length - 1">→</button>
                </div>
                <!-- Reply admin -->
                <div v-if="cmt.reply" class="bg-light rounded p-2 border mt-2">
                  <strong class="text-primary">Phản hồi từ Admin:</strong>
                  <p class="mb-0">{{ cmt.reply }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="hasMoreComments" class="text-center mt-2">
  <button class="btn btn-outline-primary px-4 py-2" @click="loadMoreComments">
    Xem thêm đánh giá
  </button>
</div>
        </div>
        <div v-else class="text-muted">Chưa có đánh giá nào.</div>
      </div>
    </div>
  </div>
</div>



<SuccessDialog ref="dialogRef" message="Đã thêm vào giỏ hàng!" />
<ErrorDialog
  ref="errorDialogRef"
  message="Vui lòng đăng nhập hoặc đăng kí để thêm vào giỏ hàng"
  @ok="goToLogin"
/>

  </template>
  
  <script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tintuc from '@/components/Tintuc.vue'
import axios from 'axios'
import ReviewSummary from '@/components/ReviewSummary.vue'
import SuccessDialog from '@/components/SuccessDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'
const hoverRating = ref(0)
const showImageModal = ref(false)
const currentImage = ref('')
const dialogRef = ref(null)
const errorDialogRef = ref(null)
const route = useRoute()
const router = useRouter()

const product = ref(null)
const quantity = ref(1)

const filters = ref({})
const selectedAttributes = ref({})
const selectedImages = ref([])
const previewImages = ref([])

const user = JSON.parse(localStorage.getItem('user')) || {}
const username = user.username || ''
const selectedImage = ref('')

const thumbnails = computed(() => {
  const urls = []
  if (product.value?.['ẢNH PHỤ 1']) urls.push(product.value['ẢNH PHỤ 1'])
  if (product.value?.['ẢNH PHỤ 2']) urls.push(product.value['ẢNH PHỤ 2'])
  if (product.value?.['ẢNH PHỤ 3']) urls.push(product.value['ẢNH PHỤ 3'])
  if (product.value?.['ẢNH PHỤ 4']) urls.push(product.value['ẢNH PHỤ 4'])
  return urls
})
const attributeKeys = [
  'TRỌNG LƯỢNG',
  'KIỂU DÁNG',
  'MÀU SẮC',
  'KÍCH THƯỚC',
  'CHẤT LIỆU',
  'THƯƠNG HIỆU',
  'XUẤT XỨ',
  'BẢO HÀNH'
]
const imageList = ref([])
const currentIndex = ref(0)

const openImage = (imgUrl, imgs) => {
  imageList.value = imgs.filter(i => i && i.startsWith('http'))
  currentIndex.value = imageList.value.indexOf(imgUrl)
  currentImage.value = imgUrl
  showImageModal.value = true
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    currentImage.value = imageList.value[currentIndex.value]
  }
}

const nextImage = () => {
  if (currentIndex.value < imageList.value.length - 1) {
    currentIndex.value++
    currentImage.value = imageList.value[currentIndex.value]
  }
}


const fetchVariantsAndExtractFilters = async (productName) => {
  const res = await axios.get(
    'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getProducts'
  )

  const allProducts = res.data
  const variants = allProducts.filter(p => p['TÊN SẢN PHẨM'] === productName)

  allVariants.value = variants

  const result = {}
  for (const key of attributeKeys) {
    const values = variants
      .map(p => (p[key] || '').toString().trim())
      .filter(v => v && v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined')
    result[key] = [...new Set(values)]
  }

  filters.value = result

  for (const key in filters.value) {
    selectedAttributes.value[key] = ''
  }
}




const fakeOriginalPrice = computed(() => {
  const price = parseFloat(product.value?.['GIÁ'] || 0)
  const discount = parseFloat(product.value?.['KHUYẾN MÃI'] || 0)

  if (discount <= 0 || isNaN(discount)) return 0

  const calculated = price / (1 - discount / 100)
  return Math.round(calculated)
})

const newRating = ref(0)
const newComment = ref('')
const submitting = ref(false)
const submitComment = async () => {
  if (submitting.value) return // Đang gửi thì không cho gửi tiếp

  if (!username) return alert('Bạn cần đăng nhập để đánh giá!')
  if (!newComment.value.trim()) return alert('Vui lòng nhập bình luận.')
  if (newRating.value === 0) return alert('Vui lòng chọn số sao!')

  submitting.value = true // Bật trạng thái loading
  try {
    const uploadedUrls = []

    for (const img of selectedImages.value) {
      const form = new FormData()
      form.append('image', img)

      const res = await fetch(`https://api.imgbb.com/1/upload?key=b202a4bdc79bf1dc72f6f6ded6b74501`, {
        method: 'POST',
        body: form
      })

      const json = await res.json()
      if (json.data && json.data.url) uploadedUrls.push(json.data.url)
    }

    const formData = new URLSearchParams()
    formData.append('action', 'addComment')
    formData.append('username', username)
    formData.append('rating', newRating.value)
    formData.append('comment', newComment.value)
    formData.append('productId', product.value.ID)

    const now = new Date();
    const formatted = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    formData.append('time', formatted);

    formData.append('img1', uploadedUrls[0] || '')
    formData.append('img2', uploadedUrls[1] || '')
    formData.append('img3', uploadedUrls[2] || '')
    formData.append('img4', uploadedUrls[3] || '')

    await fetch('https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec', {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })

    alert('✅ Cảm ơn bạn đã đánh giá!')
    newComment.value = ''
    newRating.value = 0
    selectedImages.value = []
    previewImages.value = []

    await fetchComments(product.value.ID)
  } catch (e) {
    alert('Đã có lỗi khi gửi đánh giá, vui lòng thử lại!')
  } finally {
    submitting.value = false // Tắt loading kể cả lỗi
  }
}




const comments = ref([])
const loadingComments = ref(true)
const showReviewForm = ref(false)
const fetchComments = async (id) => {
  const res = await axios.get(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getCommentsByProduct&productId=${id}`)
  console.log('📸 COMMENTS:', res.data)
  comments.value = res.data.map((cmt, i) => ({
    ...cmt,
    'LƯỢT TYM': Number(cmt.tym) || 0,
    'ID POST': cmt['ID POST'] || '',
    replyInput: '',
    rowIndex: i + 2,
    liked: false,
    justLiked: false
  }))
  commentPage.value = 1
  setTimeout(() => {
    loadingComments.value = false
    setTimeout(() => showReviewForm.value = true, 180)
  }, 900)
}



const increaseQty = () => {
  if (quantity.value < product.value['SỐ LƯỢNG']) {
    quantity.value++
  }
}

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (!username) {
    errorDialogRef.value.open()
    setTimeout(() => {
      errorDialogRef.value.closeDialog()
      router.push('/login')
    }, 1200)
    return
  }

  const cartKey = `cart_${username}`
  let cart = JSON.parse(localStorage.getItem(cartKey)) || []
  const rawProduct = JSON.parse(JSON.stringify(product.value))

  const newItem = {
    ID: rawProduct['ID'],
    'TÊN SẢN PHẨM': rawProduct['TÊN SẢN PHẨM'],
    'GIÁ': rawProduct['GIÁ'],
    'ẢNH(URL)': rawProduct['ẢNH(URL)'],
    'CHI NHÁNH': rawProduct['CHI NHÁNH'],
    quantity: quantity.value,
    ...Object.fromEntries(attributeKeys.map(key => [key, rawProduct[key]]))
  }

  const existingIndex = cart.findIndex(item => item.ID === newItem.ID)
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity.value
  } else {
    cart.push(newItem)
  }
  try {
    localStorage.setItem(cartKey, JSON.stringify(cart))
    dialogRef.value.open()
  setTimeout(() => {
  router.push('/cart')
  setTimeout(() => {
    try { dialogRef.value.closeDialog() } catch(e) {}
  }, 400)
}, 1300)

  } catch (e) {
    errorDialogRef.value.open()
    router.push('/login')
  }
}
const goToLogin = () => {
  router.push('/login')
}



const formatPrice = (price) => {
  if (typeof price === "string") price = Number(price)
  if (isNaN(price)) return ''
  return price.toLocaleString('vi-VN') // hoặc 'en-US' nếu muốn dấu phẩy
}
onMounted(async () => {
  const id = route.params.id
  const res = await axios.get(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getProductById&id=${id}`)
  product.value = res.data
  selectedImage.value = res.data['ẢNH(URL)']

  // ✅ Dùng ID để fetch biến thể
 await fetchVariantsAndExtractFilters(res.data['TÊN SẢN PHẨM']) // thay vì dùng ID


  await fetchComments(id)
})



watch(quantity, (newVal) => {
  if (!product.value) return
  if (newVal > product.value['SỐ LƯỢNG']) {
    quantity.value = product.value['SỐ LƯỢNG']
  }
  if (newVal < 1) {
    quantity.value = 1
  }
})

const formatDate = (isoStr) => {
  const d = new Date(isoStr)
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}


const maxQty = computed(() => product.value?.['SỐ LƯỢNG'] || 1)
const avgRating = computed(() => {
  if (comments.value.length === 0) return 0
  const sum = comments.value.reduce((acc, cmt) => acc + Number(cmt.rating), 0)
  return (sum / comments.value.length).toFixed(1)
})


const allVariants = ref([]) // lưu toàn bộ biến thể của sản phẩm

const filterByAttribute = (key, val) => {
  const trimmedVal = val.trim()
  const isSame = selectedAttributes.value[key] === trimmedVal

  // Toggle: nếu đang chọn thì bỏ chọn
  selectedAttributes.value[key] = isSame ? '' : trimmedVal

  // Tìm danh sách các biến thể phù hợp với tất cả filter đang chọn (cả trước và sau key)
  const validVariants = allVariants.value.filter(variant =>
    attributeKeys.every(attr => {
      const selected = selectedAttributes.value[attr]?.trim()
      return !selected || variant[attr]?.toString().trim() === selected
    })
  )

  // Cập nhật filters: fit lại tất cả filters theo danh sách biến thể hợp lệ
  for (const attr of attributeKeys) {
    const values = validVariants
      .map(p => (p[attr] || '').toString().trim())
      .filter(v => v && v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined')
    filters.value[attr] = [...new Set(values)]

    // Nếu giá trị đã chọn hiện tại không còn trong danh sách hợp lệ thì reset
    if (selectedAttributes.value[attr] && !filters.value[attr].includes(selectedAttributes.value[attr])) {
      selectedAttributes.value[attr] = ''
    }
  }

  // Tìm biến thể chính xác nếu đã chọn đủ
  const found = allVariants.value.find(p =>
    attributeKeys.every(attr => {
      const selectedVal = selectedAttributes.value[attr]?.trim()
      return !selectedVal || p[attr]?.toString().trim() === selectedVal
    })
  )

  if (found) {
    product.value = found
    selectedImage.value = found['ẢNH(URL)']
  }
}

const handleImages = (e) => {
  const files = Array.from(e.target.files).slice(0, 4)
  selectedImages.value = files
  previewImages.value = []

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = () => previewImages.value.push(reader.result)
    reader.readAsDataURL(file)
  })
}

const branchList = computed(() => {
  if (!product.value || !product.value['CHI NHÁNH']) return []
  return product.value['CHI NHÁNH']
    .split(',')
    .map(c => c.trim())
    .filter(c => c)
})
const repliesMap = ref({})

// Fetch phản hồi theo ID bình luận
const fetchReplies = async (commentId) => {
  const res = await axios.get(
    `https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getRepliesByCommentId&commentId=${commentId}`
  )
  repliesMap.value[commentId] = res.data
}

// Gửi phản hồi
const submitReply = async (cmt) => {
  const content = cmt.replyInput.trim()
  if (!content) return

  const user = JSON.parse(localStorage.getItem("user")) || {}
  const username = user.username || "guest"
  const avatar = user.avatar || "https://i.ibb.co/nDypvGk/user-default.png"

  await fetch(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec`, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
      action: "addReplyToComment",
      commentId: cmt.rowIndex,
      username,
      avatar,
      content,
    }),
  })

  if (!repliesMap.value[cmt.rowIndex]) repliesMap.value[cmt.rowIndex] = []
  repliesMap.value[cmt.rowIndex].push({
    username,
    avatar,
    content,
    time: new Date().toLocaleString("vi-VN")
  })

  cmt.replyInput = ""
}

// Thả tim
const likeComment = async (cmt) => {
  if (!cmt.liked) {
    cmt['LƯỢT TYM'] = Number(cmt['LƯỢT TYM'] || 0) + 1
    cmt.liked = true
    cmt.justLiked = true
    setTimeout(() => { cmt.justLiked = false }, 350)

    // Gửi về backend nhưng không cần await
    fetch('https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec', {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        action: 'likeComment',
        idPost: cmt['ID POST'] || cmt.idPost,
      }),
    })
  }
}


const pageSize = 3               // Số cmt mỗi lần load
const commentPage = ref(1)        // Trang hiện tại
const displayedComments = computed(() =>
  comments.value.slice(0, pageSize * commentPage.value)
)
const hasMoreComments = computed(() =>
  comments.value.length > displayedComments.value.length
)
const loadMoreComments = () => {
  commentPage.value++
}


const mainImg = ref('')
const imgThumbs = computed(() => {
  // Danh sách ảnh: ẢNH CHÍNH + các ẢNH PHỤ nếu có
  const arr = []
  if (product.value?.['ẢNH(URL)']) arr.push(product.value['ẢNH(URL)'])
  for (let i = 1; i <= 4; ++i) {
    const img = product.value?.[`ẢNH PHỤ ${i}`]
    if (img && img.startsWith('http')) arr.push(img)
  }
  return arr
})
const selectImgThumb = (img) => {
  mainImg.value = img
}

// Modal phóng to ảnh
const showImgModal = ref(false)
const imgModalSrc = ref('')
const allImgList = computed(() => imgThumbs.value)
const imgModalIndex = ref(0)

const openImgModal = (img, list) => {
  imgModalSrc.value = img
  imgModalIndex.value = list.findIndex((i) => i === img)
  showImgModal.value = true
}
const prevImgModal = () => {
  if (imgModalIndex.value > 0) {
    imgModalIndex.value--
    imgModalSrc.value = allImgList.value[imgModalIndex.value]
  }
}
const nextImgModal = () => {
  if (imgModalIndex.value < allImgList.value.length - 1) {
    imgModalIndex.value++
    imgModalSrc.value = allImgList.value[imgModalIndex.value]
  }
}

// Gán ảnh chính khi có sản phẩm
watch(
  () => product.value,
  (val) => {
    if (val && val['ẢNH(URL)']) mainImg.value = val['ẢNH(URL)']
  },
  { immediate: true }
)

</script>
  <style scoped>
.container {
  background: linear-gradient(132deg, #fff7f6 0%, #fff2f0 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(176, 4, 4, 0.08);
  padding: 38px 32px 40px 32px;
  max-width: 1180px;
  margin: 48px auto 0 auto;
  position: relative;
}

.row.align-items-start {
  width: 100%;
}

img.img-fluid {
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(176, 4, 4, 0.08);
  max-width: 100%;
  max-height: 420px;
  transition: transform 0.3s cubic-bezier(.25,.8,.25,1);
}
img.img-fluid:hover {
  transform: scale(1.04);
  z-index: 2;
}
.d-flex.gap-2 img {
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: border 0.15s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 1px 5px rgba(0,0,0,0.07);
}
.d-flex.gap-2 img.border-primary {
  border: 2.5px solid #b00404 !important;
  box-shadow: 0 2px 10px rgba(176,4,4,0.09);
  transform: scale(1.08);
}

h3 {
  font-size: 2rem;
  letter-spacing: 0.5px;
  font-weight: 800;
  color: #222;
  margin-bottom: 8px;
}

.badge.bg-danger {
  background: #b00404 !important;
  font-weight: 600;
  padding: 6px 14px 6px 14px;
  font-size: 1em;
  letter-spacing: .1em;
  border-radius: 14px;
}
.badge.bg-warning {
  background: #ffd600 !important;
  color: #9a4b00 !important;
  font-weight: 600;
  padding: 6px 12px;
  font-size: 1em;
  border-radius: 13px;
  box-shadow: 0 1px 8px #fffbe2;
}

.fs-4.fw-bold.text-danger {
  color: #b00404 !important;
  font-size: 2rem;
}

.text-muted.text-decoration-line-through {
  color: #bbb !important;
  font-size: 1.1em;
}

p.text-secondary {
  color: #4c4c4c !important;
  font-size: 1.1em;
  margin-bottom: 1.2rem;
}

.badge.bg-light.text-dark.border {
  background: #fff !important;
  border: 1.5px solid #f2f2f2 !important;
  padding: 5px 13px;
  border-radius: 10px;
  font-size: .96em;
  font-weight: 500;
  min-width: 42px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s, color 0.15s;
}
.badge.bg-dark.text-white {
  background: #b00404 !important;
  color: #fff !important;
  border: none !important;
}

ul.list-unstyled li {
  margin-bottom: 4px;
  font-size: 1.05em;
  letter-spacing: .01em;
}

.btn {
  font-size: 1.07em;
  padding: 9px 28px;
  font-weight: 700;
  border-radius: 11px;
  box-shadow: 0 3px 14px rgba(176,4,4,0.09);
  transition: background 0.2s, color 0.2s, box-shadow 0.18s, transform 0.14s;
}

.btn-warning {
  background: linear-gradient(93deg, #ed3737 0%, #fd1d1d 45%, #fcb045 100%) !important;
  color: #fff !important;
  border: none;
}
.btn-warning:hover {
  background: linear-gradient(93deg, #fd1d1d 10%, #ed3737 80%, #fcb045 100%) !important;
  color: #fff !important;
  transform: scale(1.02);
  box-shadow: 0 0 18px rgba(237,55,55,0.12);
}

.btn-secondary {
  background: #e3e3e3 !important;
  color: #9c0909 !important;
  opacity: 0.85;
  border: none;
}
.btn-secondary:disabled {
  opacity: .55 !important;
}

input[type="number"].form-control {
  border-radius: 8px;
  border: 1.6px solid #ddd;
  width: 68px;
  height: 38px;
  font-size: 1.09em;
  padding: 0 0.3em;
  margin: 0 4px;
  background: #fff;
  text-align: center;
  font-weight: 600;
}

.d-flex.align-items-center.gap-2.mb-2 .btn {
  min-width: 36px;
  padding: 0;
  height: 38px;
  line-height: 38px;
  font-size: 1.2em;
}

.bg-warning-subtle {
  background: #fff8e1 !important;
}
.bg-white {
  background: #fff !important;
}
.border-warning {
  border: 1.7px solid #ffd600 !important;
}

.shadow-sm {
  box-shadow: 0 2px 14px rgba(253,29,29,0.09) !important;
}

.p-3 {
  padding: 20px !important;
}
.p-4 {
  padding: 28px !important;
}

.form-label.fw-semibold.text-dark {
  margin-bottom: 0.2em;
  font-size: 1.08em;
  color: #2b2b2b;
  font-weight: 600;
}

textarea.form-control, input.form-control {
  border-radius: 8px;
  border: 1.3px solid #eee;
  font-size: 1.05em;
  margin-bottom: 8px;
  box-shadow: none;
  transition: border 0.18s;
}
textarea.form-control:focus, input.form-control:focus {
  border: 1.3px solid #fd1d1d;
  outline: none;
}

.mt-5 {
  margin-top: 38px !important;
}
.mb-3 {
  margin-bottom: 20px !important;
}

.border {
  border-radius: 9px !important;
  border: 1.4px solid #f1eaea !important;
}

/* Đánh giá - sao */
span[style*="#f7c948"] {
  text-shadow: 0 1px 8px #ffe8ae77;
  font-size: 1.08em;
}

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(33, 33, 33, 0.91);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-image {
  max-width: 91vw;
  max-height: 93vh;
  border-radius: 10px;
  box-shadow: 0 0 26px #000;
  outline: 2px solid #fff3;
}
.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.77);
  border: none;
  font-size: 2rem;
  font-weight: bold;
  padding: 0 13px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10000;
  box-shadow: 0 1px 7px #b0040436;
  color: #b00404;
}
.modal-nav.left { left: 35px; }
.modal-nav.right { right: 35px; }
.modal-nav:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.review-card {
  border-radius: 15px;
  box-shadow: 0 2px 14px rgba(253,29,29,0.09);
  background: #fff;
  padding: 22px 25px 20px 25px;
  margin-bottom: 25px;
  border: 1.3px solid #f1eaea;
  transition: box-shadow 0.19s;
}
.review-card:hover {
  box-shadow: 0 6px 26px rgba(253,29,29,0.11);
}

.review-card img.rounded-circle {
  border: 2.5px solid #ffe6e6;
  margin-right: 11px;
}
.review-card .btn-outline-danger {
  background: #fff !important;
  color: #ed3737;
  border: 1.2px solid #ed3737;
  padding: 4px 15px;
  font-size: 0.98em;
  font-weight: 600;
  border-radius: 20px;
  margin-top: 6px;
}
.review-card .btn-outline-danger:hover {
  background: #ed3737;
  color: #fff;
}

@media (max-width: 768px) {
  .container { padding: 18px 7px 25px 7px; }
  h3 { font-size: 1.2em; }
  .p-4 { padding: 15px !important; }
  .p-3 { padding: 10px !important; }
  .row.align-items-start { flex-direction: column; }
  .col-md-6 { width: 100%; margin-bottom: 24px; }
}

::-webkit-scrollbar { width: 6px; background: #f9ecec; }
::-webkit-scrollbar-thumb { background: #ffeaea; border-radius: 6px; }

.skeleton {
  background: linear-gradient(90deg, #f7f7f7 25%, #ececec 45%, #f7f7f7 65%);
  background-size: 400% 100%;
  animation: skeletonShine 1.2s infinite linear;
  border-radius: 10px;
  display: inline-block;
}

@keyframes skeletonShine {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Kích thước từng loại skeleton */
.skeleton-img      { width: 100%; height: 390px; border-radius: 15px; margin-bottom: 15px; }
.skeleton-thumb    { width: 60px; height: 60px; border-radius: 8px; margin-right: 8px; }
.skeleton-title    { width: 65%; height: 32px; border-radius: 10px; }
.skeleton-badge    { width: 30%; height: 23px; border-radius: 13px; }
.skeleton-price    { width: 35%; height: 28px; border-radius: 9px; }
.skeleton-desc     { width: 92%; height: 22px; border-radius: 7px; }
.skeleton-attr     { width: 50%; height: 21px; border-radius: 7px; }
.skeleton-list     { width: 76%; height: 22px; border-radius: 7px; }
.skeleton-input    { width: 60px; height: 38px; border-radius: 7px; }
.skeleton-btn      { width: 38px; height: 38px; border-radius: 8px; }
.skeleton-btn-long { width: 58%; height: 46px; border-radius: 11px; margin-top: 10px; }

@media (max-width: 768px) {
  .skeleton-img { height: 210px; }
}
/* Màu chữ chủ đạo cho tên sản phẩm, giá, badge, tiêu đề */
h3, .text-danger, .fw-bold, .product-title, .slogan {
  color: #b00404 !important;
}


/* Chữ label nổi bật */
.form-label.fw-semibold.text-dark,
.list-unstyled strong,
.badge.bg-danger {
  color: #b00404 !important;
}
.container, .product-detail, .product-info, .product-card {
  color: #b00404 !important;
}
.btn-warning,
.btn-warning:active,
.btn-warning:focus {
  background: linear-gradient(93deg, #b00404 0%, #fd1d1d 100%) !important;
  color: #fff !important;
  border: none;
  box-shadow: 0 3px 14px rgba(176,4,4,0.13);
}
.btn-warning:hover {
  background: linear-gradient(93deg, #c81010 0%, #fd1d1d 90%) !important;
  color: #fff !important;
  transform: scale(1.03);
}
.btn-outline-secondary,
.btn-outline-secondary:active,
.btn-outline-secondary:focus {
  border: 1.5px solid #b00404 !important;
  color: #b00404 !important;
  background: #fff !important;
}
.btn-outline-secondary:hover {
  background: #b00404 !important;
  color: #fff !important;
}

.btn-secondary,
.btn-secondary:active,
.btn-secondary:focus {
  background: #e3e3e3 !important;
  color: #b00404 !important;
}

.product-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  margin-bottom: 15px;
}

.badge-info {
  display: inline-flex;
  align-items: center;
  background: #fff9e2;
  color: #b00404;
  font-weight: 500;
  font-size: 1.01em;
  border-radius: 22px;
  padding: 8px 18px;
  box-shadow: 0 2px 9px #f9e1d6;
  border: 1.3px solid #ffe8ae;
  line-height: 1.2;
  min-width: 0;
  transition: background 0.16s, color 0.16s;
}

.badge-info b {
  color: #b00404;
  font-weight: 700;
  margin-right: 4px;
}

/* Mỗi loại badge có màu icon riêng nếu thích */
.badge-gift    { background: #fff7df; border-color: #ffe28a; }
.badge-hot     { background: #ffeceb; border-color: #ffc8c2; }
.badge-star    { background: #fffae4; border-color: #ffeb91; }
.badge-status  { background: #efe7ff; border-color: #c3aaff; }

.badge-info .badge-rating-text {
  color: #888; font-size: 0.96em; margin-left: 4px;
}

/* Cho đẹp hơn trên mobile */
@media (max-width: 576px) {
  .product-badges {
    gap: 8px;
    flex-direction: column;
  }
  .badge-info {
    width: 100%;
    padding: 8px 12px;
    font-size: 1em;
    margin-right: 0;
  }
}

/* ===== FILTER LABEL ===== */
.filter-label {
  font-weight: 700;
  color: #363636;
  margin-bottom: 6px;
  letter-spacing: .03em;
}

/* ===== FILTER BADGE/OPTION ===== */
.filter-options {
  gap: 8px;
  margin-bottom: 5px;
}
.filter-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #f7f7f7;
  color: #b00404;
  border-radius: 16px;
  font-size: 1em;
  font-weight: 500;
  border: 1.5px solid #ffe8ae;
  cursor: pointer;
  min-width: 48px;
  text-align: center;
  box-shadow: 0 2px 8px #f5ebe2;
  transition: background 0.17s, color 0.16s, border 0.14s;
  margin-bottom: 3px;
}
.filter-badge.selected,
.filter-badge:hover {
  background: #ffd600;
  color: #b00404;
  border-color: #ffd600;
  font-weight: 700;
  box-shadow: 0 2px 16px #ffebb47e;
  transform: scale(1.06);
}

/* ===== ATTR VALUE BADGE (như "2 tháng", "việt nam") ===== */
.attr-value-badge {
  display: inline-block;
  background: #f2fbff;
  color: #1c345a;
  font-weight: 600;
  border-radius: 13px;
  padding: 5px 13px;
  font-size: 1em;
  border: 1px solid #e0f0ff;
  margin-right: 8px;
  margin-bottom: 2px;
  min-width: 36px;
  text-align: center;
  transition: background 0.18s, color 0.17s;
}

.badge.bg-warning, .promo-badge {
  background: #ffd600 !important;
  color: #b00404 !important;
  border-radius: 17px !important;
  padding: 6px 18px !important;
  font-size: 1.02em;
  font-weight: 700;
  border: none !important;
  min-width: 52px;
  display: inline-block;
  text-align: center;
}

.filter-block {
  margin-bottom: 17px;
}

.filter-label {
  font-weight: 800;
  color: #490e0e;
  font-size: 1.09em;
  letter-spacing: .03em;
  margin-bottom: 4px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-badge {
  display: inline-block;
  padding: 7px 18px;
  background: #fff7f2;
  color: #b00404;
  border-radius: 16px;
  font-size: 1em;
  font-weight: 600;
  border: 1.7px solid #ffe8ae;
  cursor: pointer;
  box-shadow: 0 2px 9px #fbeee1;
  min-width: 48px;
  text-align: center;
  transition: 
    background 0.17s,
    color 0.16s,
    border 0.14s,
    box-shadow 0.17s,
    transform 0.12s;
  margin-bottom: 3px;
  user-select: none;
}
.filter-badge.selected,
.filter-badge:hover {
  background: #ffd600 !important;
  color: #b00404 !important;
  border-color: #ffd600 !important;
  font-weight: 800;
  box-shadow: 0 4px 20px #ffe381b4;
  transform: scale(1.07);
}

@media (max-width: 600px) {
  .filter-badge {
    padding: 7px 13px;
    font-size: 0.99em;
    min-width: 38px;
  }
  .filter-label { font-size: 1em; }
}
.badge-info.badge-branch {
  background: #e8fcee !important;
  color: #199945 !important;
  border-color: #a9eab9 !important;
  font-weight: 700;
  box-shadow: 0 2px 11px #c1efd2;
}
.badge-info.badge-branch b,
.badge-info.badge-branch .icon-branch {
  color: #199945 !important;
}


.info-card-v2 {
  border-radius: 16px;
  box-shadow: 0 2px 16px #ffe8ae28;
  border: 1.6px solid #ffe8ae;
  overflow: hidden;
  background: #fff;
  min-width: 240px;
  max-width: 340px;
  width: 100%;
  margin-bottom: 20px;
  transition: box-shadow 0.15s, border 0.13s;
}
.info-card-v2:hover {
  box-shadow: 0 8px 28px #ffd6005c;
  border-color: #ffd600;
  transform: translateY(-1px) scale(1.011);
}

.info-card-header {
  font-weight: 900;
  font-size: 1.08em;
  letter-spacing: .02em;
  padding: 13px 22px 11px 22px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-bottom: 1.1px solid #ffeca7;
  display: flex;
  align-items: center;
  gap: 7px;
}

.promo-header {
  background: linear-gradient(90deg,#ffe9ae 85%,#fffbe1 100%);
  color: #b00404;
  font-size: 30px;font-weight: bold;
}
.branch-header {
  background: linear-gradient(90deg,#e5ffef 80%,#b1f9d5 100%);
  color: #18844d;
  border-bottom: 1.1px solid #d5ffe7;
  font-size: 25px;font-weight: bold;
}

.info-card-body {
  background: #fffefb;
  padding: 21px 22px 14px 22px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  font-size: 1.13em;
  font-weight: 700;
  color: #b06504;
}
.promo-body { color: #b06504; font-size: 25px;font-weight: bold; }
.branch-body { color: #158a56;font-size: 20px;font-weight: bold; }
.branch-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
  font-size: 1.09em;
  font-weight: 700;
}

/* Responsive cho mobile */
@media (max-width: 700px) {
  .info-card-v2 { max-width: 100%; min-width: 0; }
  .info-card-header, .info-card-body { padding-left: 10px; padding-right: 10px; }
  .info-card-header { font-size: 1em; }
  .info-card-body { font-size: .99em; }
}




.review-card-pro {
  width: 100%;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 44px #0287c729, 0 1.5px 10px #039BE524;
  border: 2.5px solid #b3e5fc;
  padding: 40px 3.2vw 38px 3.2vw;
  margin: 0 auto;
  transition: box-shadow 0.18s, border 0.17s;
}
.review-title {
  background: linear-gradient(90deg,#0277bd 0%,#039BE5 100%);
  color: #ffffff;
  font-weight: bold;
  border-radius: 12px;
  padding: 11px 28px 11px 23px;
  font-size: 1.12em;
  letter-spacing: .03em;
  margin-bottom: 22px;
  display: inline-block;
  box-shadow: 0 2px 12px #039BE540;
  width: 100%;
  text-align: center;
}
.review-form-block {
  margin-bottom: 40px;
}
.star {
  font-size: 26px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.16s;
  user-select: none;
}
.star.active, .star:hover {
  color: #0277bd;
  text-shadow: 0 1px 8px #039BE530;
}
.img-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1.5px solid #b3e5fc;
  box-shadow: 0 2px 8px #039be511;
}
.btn-send {
  background: linear-gradient(90deg,#0277bd 0%,#039BE5 100%);
  color: #fff !important;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 11px 33px;
  margin-top: 10px;
  font-size: 1.1em;
  transition: background 0.14s, filter 0.14s;
  box-shadow: 0 2px 11px #039be522;
}
.btn-send:hover {
  filter: brightness(1.08);
  background: linear-gradient(90deg,#039BE5 0%,#0277bd 100%);
}
.review-user-list { width: 100%; }
.review-user-item {
  border: 1.6px solid #b3e5fc;
  border-radius: 20px;
  padding: 27px 25px 22px 23px;
  margin-bottom: 28px;
  background: #f7fafd;
  box-shadow: 0 3px 19px #039be50a;
  transition: box-shadow 0.15s;
}
.review-user-item:hover {
  box-shadow: 0 10px 28px #02b7fd23;
}
.avatar {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #b3e5fc;
}
.avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #b3e5fc;
  object-fit: cover;
}
.btn-like {
  background: #fff;
  color: #0277bd;
  border: 1.2px solid #0277bd;
  font-weight: 700;
  border-radius: 22px;
  padding: 6px 20px;
  font-size: 1em;
  margin-top: 3px;
  transition: background 0.14s, color 0.14s;
}
.btn-like:hover {
  background: linear-gradient(90deg,#0277bd 0%,#039BE5 100%);
  color: #fff;
}
.text-primary { color: #0277bd !important; }

/* SKELETON UI REVIEW */
.skeleton-list-review { width: 100%; }
.skeleton-review-card {
  min-height: 142px;
  padding: 24px 23px 20px 23px;
  margin-bottom: 23px;
  background: #fafdff;
  border-radius: 20px;
  box-shadow: 0 2px 10px #0287c714;
  border: 1.3px solid #b3e5fc77;
}
.skeleton {
  background: linear-gradient(90deg, #e3f4fc 25%, #d1e5f6 40%, #e3f4fc 65%);
  background-size: 400% 100%;
  animation: skeletonShine 1.18s infinite linear;
  border-radius: 10px;
  display: inline-block;
}
@keyframes skeletonShine {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-name { width: 110px; height: 17px; margin-bottom: 7px; }
.skeleton-stars { width: 85px; height: 17px; margin-bottom: 8px; }
.skeleton-comment { width: 96%; height: 17px; margin-bottom: 12px; }
.skeleton-img-mini { width: 52px; height: 52px; border-radius: 7px; margin-right: 7px; }
.skeleton-btn-like { width: 75px; height: 26px; border-radius: 13px; margin-top: 7px; }

/* SLIDE-UP ANIMATION */
.slide-fade-enter-active {
  transition: all .54s cubic-bezier(.43,1.13,.53,.99);
}
.slide-fade-leave-active {
  transition: all .21s;
}
.slide-fade-enter-from {
  transform: translateY(64px);
  opacity: 0;
}
.slide-fade-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.slide-fade-leave-to {
  transform: translateY(64px);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 900px) {
  .review-card-pro { padding: 26px 2vw 25px 2vw; }
  .review-user-item { padding: 19px 12px 15px 12px; }
}
@media (max-width: 600px) {
  .review-card-pro { padding: 9px 3vw 13px 3vw; }
}
.review-section-wide {
  width: 100vw;
  background: none;
  margin-left: calc(-1 * (100vw - 100%) / 2);
  margin-right: calc(-1 * (100vw - 100%) / 2);
  display: flex;
  justify-content: center;
}

.container-review {
  width: 100%;
  max-width: 1280px;
  display: flex;
  flex-wrap: nowrap;        /* Duy trì 1 hàng trên PC */
  justify-content: center;
  gap: 38px;
  align-items: stretch;
}

.review-form-box {
  background: #f7fafd;
  border-radius: 32px;
  box-shadow: 0 8px 44px #b3e5fc44;
  border: 2.3px solid #b3e5fc;
  padding: 48px 42px 39px 42px;
  min-width: 370px;
  max-width: 420px;
  width: 100%;
}

.review-list-box {
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 12px 54px #0287c735, 0 2px 18px #039be51a;
  border: 2.7px solid #b3e5fc;
  padding: 54px 52px 48px 52px;
  min-width: 440px;
  max-width: 700px;
  width: 100%;
}

@media (max-width: 1200px) {
  .container-review { max-width: 98vw; gap: 32px; }
  .review-form-box, .review-list-box { max-width: 100%; }
}

@media (max-width: 900px) {
  .container-review {
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 0 2vw;
  }
  .review-form-box, .review-list-box {
    min-width: 0;
    max-width: 100%;
    padding: 23px 7vw 19px 7vw;
    border-radius: 20px;
  }
}
.star {
  font-size: 26px;
  color: #ccc; /* Xám nhạt mặc định */
  cursor: pointer;
  transition: color 0.18s, text-shadow 0.14s;
  user-select: none;
  text-shadow: none;
}
.star.active,
.star:hover {
  color: #ffd600 !important;  /* Vàng ánh kim khi active hoặc hover */
  text-shadow: 0 2px 12px #ffe8ae80, 0 0px 2px #fffbe1b6;
}

.btn-like.liked {
  background: linear-gradient(90deg,#0277bd 0%,#039BE5 100%);
  color: #fff;
  border-color: #0277bd;
  box-shadow: 0 3px 18px #039be523;
}
.like-count {
  display: inline-block;
  margin-left: 7px;
  font-weight: 700;
  font-size: 1.1em;
  transition: transform 0.17s;
}
.like-count.bump {
  animation: bump 0.34s cubic-bezier(.39,1.33,.64,1);
}
@keyframes bump {
  0% { transform: scale(1); }
  18% { transform: scale(1.23); }
  44% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

.btn-outline-primary {
  border: 1.7px solid #0277bd;
  color: #0277bd;
  font-weight: 700;
  background: #fff;
  border-radius: 11px;
  transition: background 0.18s, color 0.18s, border 0.16s;
  margin: 10px 0 16px 0;
}
.btn-outline-primary:hover {
  background: #0277bd;
  color: #fff;
}




.product-detail-4box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 38px 38px;
  max-width: 1220px;
  margin: auto auto 0 auto;
  border-radius: 34px;
  box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  padding: 55px 40px 62px 40px;
  position: relative;
  overflow: visible;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.box {

  border-radius: 25px;
  padding: 36px 32px;
  box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  min-height: 130px;
  position: relative;
  transition: box-shadow 0.2s, transform 0.19s;
  border: 1.6px solid #fff6f6;
  backdrop-filter: blur(2.5px);
}

.box:hover {
  box-shadow:
    0 16px 48px #30010136,
    0 8px 30px #61616033,
    0 2px 15px #fff8eeaa;
  transform: translateY(-3px) scale(1.019);
}

.product-title {
  font-size: 2.7em;
  font-weight: 950;
  color: #b00404;
  margin-bottom: 0;
  letter-spacing: .03em;
  text-shadow:
    0 4px 24px #ffd8d899,
    0 1.5px 0px #fff6f6,
    0 0 3px #fff;
  filter: drop-shadow(0 4px 16px #fd1d1d13);
}

.product-badge {
  display: inline-block;
  font-size: 1.12em;
  padding: 10px 26px;
  border-radius: 19px;
  background: linear-gradient(95deg, #fff5e2 60%, #fffde7 100%);
  color: #b06504;
  font-weight: 700;
  box-shadow: 0 4px 18px #f9e1d6, 0 2px 10px #ffe5be7e;
  margin-right: 12px;
  margin-bottom: 13px;
  border: 1.7px solid #ffe8ae;
  letter-spacing: .01em;
  transition: background 0.16s, color 0.12s, box-shadow 0.13s, transform 0.14s;
}

.product-badge:hover {
  background: linear-gradient(90deg, #ffd600 0%, #fffbe1 100%);
  color: #b00404;
  box-shadow: 0 8px 24px #ffd6004b;
  transform: scale(1.07);
}

.img-main {
  width: 100%;
  max-height: 380px;
  border-radius: 19px;
  object-fit: cover;
  margin-bottom: 19px;
  box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  border: 2.7px solid #555454;
  transition: box-shadow 0.18s, border 0.16s, transform 0.16s;
}
.img-main:hover {
  box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  border: 2.7px solid #383636;
  transform: scale(1.03);
}

.img-thumbs {
  display: flex;
  gap: 16px;
}
.img-thumbs img {
  width: 62px;
  height: 62px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #747272;
  cursor: pointer;
  box-shadow: 0 1px 8px #53515150;
  transition: border 0.18s, box-shadow 0.17s, transform 0.16s;
  background: #fff;
}
.img-thumbs img.active,
.img-thumbs img:hover {
  border: 2.5px solid #777272;
   box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  transform: scale(1.14);
}

/* Filter badge hiện đại */
.filter-badge {
  display: inline-block;
  padding: 8px 22px;
  background: #fff7f2;
  color: #b00404;
  border-radius: 16px;
  font-size: 1.1em;
  font-weight: 600;
  border: 1.7px solid #ffe8ae;
  cursor: pointer;
  box-shadow: 0 2px 9px #fbeee1;
  margin-bottom: 7px;
  user-select: none;
  transition: background 0.18s, color 0.18s, border 0.14s, box-shadow 0.16s, transform 0.14s;
}
.filter-badge.selected,
.filter-badge:hover {
  background: linear-gradient(95deg, #ffd600 70%, #fffbe1 100%);
  color: #b00404;
  border-color: #ffd600;
  font-weight: 800;
  box-shadow: 0 6px 20px #ffd60073;
  transform: scale(1.10);
}

.product-btn {
  margin-top: 22px;
  background: linear-gradient(93deg, #ed3737 0%, #fd1d1d 45%, #fcb045 100%) !important;
  color: #fff !important;
  font-weight: 800;
  font-size: 1.22em;
  border-radius: 17px;
  padding: 15px 52px;
  box-shadow: 0 8px 36px #fd1d1d32, 0 3px 18px #fcb04545;
  border: none;
  transition: background 0.18s, color 0.15s, transform 0.18s, box-shadow 0.18s;
}
.product-btn:hover {
  background: linear-gradient(95deg, #fd1d1d 10%, #ed3737 80%, #fcb045 100%) !important;
  filter: brightness(1.06);
  transform: scale(1.045);
  box-shadow: 0 20px 58px #fd1d1d1a, 0 8px 28px #fcb04544;
}

.skeleton {
  background: linear-gradient(90deg, #f7f7f7 25%, #ececec 45%, #f7f7f7 65%);
  background-size: 400% 100%;
  animation: skeletonShine 1.2s infinite linear;
  border-radius: 12px;
  display: inline-block;
}
@keyframes skeletonShine {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (max-width: 900px) {
  .product-detail-4box {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 30px 0;
    padding: 19px 5px 25px 5px;
    border-radius: 20px;
  }
  .box { padding: 18px 6px; border-radius: 11px; }
  .img-main { border-radius: 10px; max-height: 185px; }
  .img-thumbs img { width: 40px; height: 40px; border-radius: 6px; }
  .product-title { font-size: 1.44em; }
}

.box1 {
  background: rgb(68, 18, 18);
  color: #fff !important;

  border: 1.6px solid #ffebee;
  filter: brightness(1.02); 
}
.box1 .product-title {
  color: #fff !important;
  font-weight: 900;
  text-shadow: 0 2px 12px #b0040455, 0 1px 2px #fff1;
}

.box1 h3,
.box1 * {
  color: #fff !important;
  font-weight: bold;
  text-shadow: 0 2px 12px #b0040455, 0 1px 2px #fff1;
}

/* BOX 2: ẢNH CHÍNH + THUMBNAIL */
.box2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 14px 32px 14px;

  border-radius: 23px;
  
  border: 2px solid #fff6f6;
  min-height: 340px;
  position: relative;
  transition: box-shadow 0.18s, transform 0.16s;
}
.box2:hover {
   box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #88878722;
  transform: translateY(-2px) scale(1.012);
}

.img-main {
  width: 98%;
  max-width: 380px;
  max-height: 370px;
  border-radius: 19px;
  object-fit: cover;
  margin-bottom: 17px;
   box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  border: 2.7px solid #fff4f4;
  transition: box-shadow 0.19s, border 0.15s, transform 0.15s;
  background: #fff;
  cursor: zoom-in;
}
.img-main:hover {
  box-shadow: 0 12px 52px #5f5e5e40, 0 2px 26px #4e494222;
  border: 2.7px solid #747474;
  transform: scale(1.033);
}

.img-thumbs {
  display: flex;
  gap: 18px;
  margin-top: 7px;
  justify-content: center;
  flex-wrap: wrap;
}
.img-thumb {
  width: 63px;
  height: 63px;
  object-fit: cover;
  border-radius: 12px;
  border: 2.5px solid #fff7f7;
  cursor: pointer;
  box-shadow: 0 1px 9px #ffc3c350;
  transition: border 0.16s, box-shadow 0.13s, transform 0.13s;
  background: #fff;
  opacity: 0.93;
  position: relative;
  z-index: 1;
}
.img-thumb.active,
.img-thumb:hover {
  border: 2.5px solid #b00404;
  box-shadow: 0 6px 26px #fd1d1d66, 0 2px 10px #ffd60029;
  transform: scale(1.12);
  opacity: 1;
  z-index: 3;
}

/* Modal phóng to ảnh (giữ lại của bạn cho đẹp, nếu chưa có thì dùng cái này) */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(33, 33, 33, 0.93);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-image {
  max-width: 95vw;
  max-height: 92vh;
  border-radius: 13px;
  box-shadow: 0 0 32px #b00404, 0 4px 30px #ffd60077;
  outline: 3px solid #fff3;
  background: #fff;
  animation: scaleInImg 0.23s cubic-bezier(.43,1.19,.63,1.01);
}
@keyframes scaleInImg {
  0% { transform: scale(0.88); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.82);
  border: none;
  font-size: 2.1rem;
  font-weight: bold;
  padding: 0 17px;
  border-radius: 13px;
  cursor: pointer;
  z-index: 10000;
  box-shadow: 0 2px 12px #b0040440;
  color: #b00404;
  transition: background 0.14s, color 0.14s;
}
.modal-nav.left { left: 42px; }
.modal-nav.right { right: 42px; }
.modal-nav:disabled {
  opacity: 0.37;
  cursor: not-allowed;
}
@media (max-width: 700px) {
  .box2 { padding: 12px 2vw 16px 2vw; min-height: 180px; }
  .img-main { max-width: 99vw; max-height: 180px; }
  .img-thumb { width: 38px; height: 38px; border-radius: 7px; }
  .img-thumbs { gap: 9px; }
  .modal-nav.left { left: 6vw; }
  .modal-nav.right { right: 6vw; }
}

/* === HEADER H2 CHO CÁC BOX TRONG PRODUCT DETAIL === */
.box2 h2,
.box3 h2,
.box4 h2 {
  background: rgb(68, 18, 18);
  color: #ffffff;
  font-size: 1.38em;
  font-weight: 900;
  letter-spacing: .05em;
  padding: 13px 0 13px 24px;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 4px 16px #fd1d1d16, 0 1px 7px #ffd6000f;
  margin: -36px -32px 28px -32px; /* Dính sát mép trên box, nổi bật hơn */
  border-bottom: 2.7px solid #ffd60025;
  position: relative;
  z-index: 2;
  /* Animation nhẹ khi xuất hiện */
  animation: fadeinHeader 0.7s cubic-bezier(.63,1.49,.48,1.01);
}

/* Responsive cho mobile */
@media (max-width: 900px) {
  .box2 h2,
  .box3 h2,
  .box4 h2 {
    font-size: 1.05em;
    padding: 11px 0 11px 11px;
    margin: -18px -6px 15px -6px;
    border-radius: 8px 8px 0 0;
  }
}

@keyframes fadeinHeader {
  0% { opacity: 0; transform: translateY(-18px) scale(0.96);}
  100% { opacity: 1; transform: none;}
}

.box2 h2 {
  border-radius: 18px 18px 0 0;
  font-size: 1.4em;
  padding-left: 0;  /* bỏ padding left nếu muốn giữa */
  padding-right: 0;
  text-align: center;
}

.btn-addcart {
  background-color: rgb(68, 18, 18) !important;
  color: #fff !important;
  border: none;
  box-shadow: 0 2px 12px #b0040440;
  transition: 
    background 0.18s, 
    color 0.15s, 
    transform 0.16s, 
    box-shadow 0.16s;
}
.btn-addcart:hover,
.btn-addcart:focus {
opacity: 0.5;
  transform: scale(1.04) translateY(-1px);
  box-shadow: 0 8px 32px #b0040440;
}

.box3 .product-desc {
  color: rgb(68, 18, 18);         /* màu nâu đỏ template */
  font-weight: bold;              /* chữ đậm */
  font-size: 1em;
  line-height: 1.7;
  white-space: pre-line;          /* GIỮ XUỐNG DÒNG trong dữ liệu */
  letter-spacing: 0.01em;
  padding: 10px 0 0 0;
  word-break: break-word;
  background: none;               /* Không có nền, nếu muốn nền thì thêm ở đây */
}

.slide-in-review-summary-enter-active {
  transition: all 0.68s cubic-bezier(.36,1.19,.43,.98);
  /* Chỉnh cubic-bezier cho mượt */
}
.slide-in-review-summary-leave-active {
  transition: all 0.23s;
}
.slide-in-review-summary-enter-from {
  opacity: 0;
  transform: translateY(60px) scale(0.97);
}
.slide-in-review-summary-enter-to {
  opacity: 1;
  transform: none;
}
.slide-in-review-summary-leave-from {
  opacity: 1;
  transform: none;
}
.slide-in-review-summary-leave-to {
  opacity: 0;
  transform: translateY(45px) scale(0.97);
}


.badge-minimal {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff8de; /* Text sáng nhẹ, không bị gắt */
  font-weight: 600;
  font-size: 1em;
  border-radius: 14px;
  padding: 7px 17px 7px 15px;
  border: 1.3px solid #573016;
  box-shadow: none;
  margin-bottom: 5px;
  letter-spacing: .01em;
  background:  #442412 ;
  /* #442412 là rgb(68,18,18), #7d4d21 là nâu sáng hơn */
  opacity: 0.95;
  transition: background 0.15s, color 0.13s, border 0.13s;
}
.badge-minimal b { color: #ffffff; font-weight: 700; }
.badge-buy    { color: #ffe7a8; }
.badge-star   { color: #ffd600; }
.badge-status { color: #b8d6ff; }
.badge-branch { color: #84f9a2; }
.badge-rating-text { color: #ffe9be; }

.badge-minimal:hover {
  background: linear-gradient(90deg, #ad7528 70%, #442412 100%);
  border-color: #ffd600;
  color: #fffde7;
  box-shadow: 0 4px 16px #44241229;
}

.product-badges { gap: 9px; margin-bottom: 12px; }
/* ===== FILTER OPTIONS BLOCK (SANG CHẢNH, TỐI GIẢN) ===== */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  margin-bottom: 7px;
}

/* Nút filter thuộc tính */
.filter-badge {
  display: inline-block;
  padding: 7px 22px;
  background: rgba(255,255,255,0.05);      /* nền rất nhẹ, gần như trong suốt */
  color: #3d2721;                          /* màu chữ nâu đỏ tối giản */
  border-radius: 18px;
  font-size: 1.07em;
  font-weight: 500;
  border: 1.3px solid #dedede;             /* viền xám sáng */
  cursor: pointer;
  user-select: none;
  box-shadow: none;
  transition:
    background 0.13s,
    color 0.14s,
    border 0.15s,
    transform 0.12s;
  margin-bottom: 3px;
  min-width: 45px;
  text-align: center;
  opacity: 0.94;
}

/* Khi hover/chọn: đổi nền pastel, border nổi bật hơn */
.filter-badge.selected,
.filter-badge:hover {
  background: #fff8eb;
  color: #b00404;
  border-color: #ffd600;
  font-weight: 700;
  transform: translateY(-1px) scale(1.07);
}

/* Disable (nếu có) */
.filter-badge[disabled] {
  pointer-events: none;
  opacity: 0.46;
  background: #f2f2f2;
  color: #bbb;
  border-color: #eee;
}

/* Mobile nhỏ: padding nhỏ lại */
@media (max-width:600px) {
  .filter-badge { padding: 6px 13px; font-size: 1em; }
}

</style>

