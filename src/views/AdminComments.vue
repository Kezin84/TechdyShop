<template>
  <div class="container py-4">
    <h2 class="fw-bold mb-4 text-primary">🛠 Quản lý bình luận khách hàng</h2>

    <!-- Bộ lọc phản hồi -->
    <div class="mb-3 d-flex align-items-center gap-2">
      <label class="form-label fw-bold mb-0">Lọc theo phản hồi:</label>
      <select v-model="filterStatus" class="form-select form-select-sm w-auto">
        <option value="all">Tất cả</option>
        <option value="replied">Đã phản hồi</option>
        <option value="notReplied">Chưa phản hồi</option>
      </select>
    </div>

    <!-- Danh sách bình luận -->
    <div v-if="filteredComments.length">
      <div
        v-for="(cmt, index) in filteredComments"
        :key="index"
        class="border rounded shadow-sm bg-white p-3 mb-4 d-flex gap-3 align-items-start position-relative"
      >
        <!-- Avatar -->
        <img
          :src="cmt.avatar || 'https://i.ibb.co/nDypvGk/user-default.png'"
          class="rounded-circle border"
          style="width: 48px; height: 48px; object-fit: cover"
        />

        <!-- Nội dung -->
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold">
              {{ cmt.username || '[CHƯA NHẬP USERNAME]' }}
              <span class="badge bg-secondary ms-2">{{ cmt.username === 'admin' ? 'Admin' : 'Khách hàng' }}</span>
              <small class="text-muted ms-2">{{ formatDate(cmt.time) }}</small>
            </div>
            <div class="text-warning small">
              <span v-for="i in 5" :key="i">
                <i class="bi" :class="i <= Number(cmt.rating) ? 'bi-star-fill' : 'bi-star'" />
              </span>
            </div>
          </div>

          <!-- Ảnh -->
          <div class="d-flex flex-wrap gap-2 mt-2">
            <img
              v-for="(img, i) in [cmt.img1, cmt.img2, cmt.img3, cmt.img4].filter(i => i && i.startsWith('http'))"
              :key="i"
              :src="img"
              alt="img"
              class="border rounded"
              style="width: 60px; height: 60px; object-fit: cover; cursor: zoom-in"
              @click="openImage(img, [cmt.img1, cmt.img2, cmt.img3, cmt.img4])"
            />
          </div>

          <!-- Bình luận -->
          <div v-if="!cmt.editingComment" class="mt-3" @click="cmt.editingComment = true" style="cursor: pointer">
            <p class="mb-1">🗨️ {{ cmt.comment || '[Chưa có bình luận]' }}</p>
          </div>
          <textarea
            v-else
            v-model="cmt.comment"
            rows="2"
            class="form-control form-control-sm mt-2 mb-2"
            placeholder="Chỉnh sửa bình luận..."
          />

          <!-- Phản hồi -->
          <div v-if="!cmt.editingReply" @click="cmt.editingReply = true" style="cursor: pointer">
            <p class="text-success small">💬 Admin: {{ cmt.reply || '[Chưa phản hồi]' }}</p>
          </div>
          <textarea
            v-if="cmt.editingReply"
            v-model="cmt.reply"
            rows="2"
            class="form-control form-control-sm mb-2"
            placeholder="Nhập phản hồi từ Admin..."
          />

          <!-- Nút hành động -->
          <div class="d-flex gap-2 mt-2">
            <template v-if="cmt.reply?.trim() && cmt.editingReply">
              <button class="btn btn-success btn-sm" @click="saveEdit(cmt)">💾 Lưu tất cả</button>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit(cmt)">✖ Hủy</button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteComment(cmt)">🗑 Xóa</button>
            </template>
            <template v-else-if="cmt.editingReply">
              <button class="btn btn-primary btn-sm" @click="sendReplyOnly(cmt)">📩 Gửi phản hồi</button>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit(cmt)">✖ Hủy</button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteComment(cmt)">🗑 Xóa</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Nếu không có -->
    <div v-else class="text-muted text-center mt-5">
      <div v-if="comments.length === 0">Không có bình luận nào.</div>
      <div v-else>Không có bình luận nào phù hợp với bộ lọc.</div>
    </div>

    <!-- Modal ảnh -->
    <div v-if="showImageModal" class="modal-backdrop" @click.self="showImageModal = false">
      <button class="modal-nav left" @click.stop="prevImage" :disabled="currentIndex === 0">←</button>
      <img :src="currentImage" class="modal-image" />
      <button class="modal-nav right" @click.stop="nextImage" :disabled="currentIndex === imageList.length - 1">→</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const comments = ref([])
const filterStatus = ref('all')

const fetchAllComments = async () => {
  const res = await fetch(`${SCRIPT_URL}?action=getAllComments`)
  const data = await res.json()
  comments.value = data.map(c => ({
    username: c.username || c['TÊN ĐĂNG NHẬP'] || '',
    rating: c['ĐÁNH GIÁ'] || 0,
    comment: c['BÌNH LUẬN'] || '',
    productId: c['ID SẢN PHẨM'] || '',
    time: c['THỜI GIAN'] || '',
    reply: c['REPLY'] || '',
    avatar: c['avatar'] || '',
    img1: c.img1 || '',
    img2: c.img2 || '',
    img3: c.img3 || '',
    img4: c.img4 || '',
    editingComment: false,
    editingReply: false
  }))
}

const saveEdit = async (cmt) => {
  const body = new URLSearchParams({
    action: 'updateComment',
    username: cmt.username,
    productId: cmt.productId,
    time: cmt.time,
    comment: cmt.comment,
    reply: cmt.reply
  })
  await fetch(SCRIPT_URL, { method: 'POST', body })
  alert('✅ Đã cập nhật bình luận!')
  cmt.editingComment = false
  cmt.editingReply = false
}

const sendReplyOnly = async (cmt) => {
  if (!cmt.reply.trim()) {
    alert('⚠️ Vui lòng nhập nội dung phản hồi.')
    return
  }

  const body = new URLSearchParams({
    action: 'replyComment',
    username: cmt.username,
    productId: cmt.productId,
    time: cmt.time,
    reply: cmt.reply
  })

  await fetch(SCRIPT_URL, { method: 'POST', body })
  alert('✅ Phản hồi đã được gửi!')
  cmt.editingReply = false
}

const deleteComment = async (cmt) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return
  const body = new URLSearchParams({
    action: 'deleteComment',
    username: cmt.username,
    productId: cmt.productId,
    time: cmt.time
  })
  await fetch(SCRIPT_URL, { method: 'POST', body })
  comments.value = comments.value.filter(c => !(c.username === cmt.username && c.productId === cmt.productId && c.time === cmt.time))
  alert('🗑 Đã xóa bình luận!')
}

const cancelEdit = (cmt) => {
  cmt.editingReply = false
  cmt.editingComment = false
}

const formatDate = (str) => {
  try {
    const d = new Date(str)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  } catch (err) {
    return 'Không rõ'
  }
}

const filteredComments = computed(() => {
  if (filterStatus.value === 'replied') {
    return comments.value.filter(c => c.reply && c.reply.trim())
  } else if (filterStatus.value === 'notReplied') {
    return comments.value.filter(c => !c.reply || !c.reply.trim())
  } else {
    return comments.value
  }
})

const showImageModal = ref(false)
const currentImage = ref('')
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

onMounted(() => {
  fetchAllComments()
})
</script>

<style scoped>
h2 {
  font-weight: 700;
}
textarea {
  resize: none;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 0 20px #000;
}
.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10000;
}
.modal-nav.left {
  left: 20px;
}
.modal-nav.right {
  right: 20px;
}
.modal-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
