<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4">📢 Quản lý thông báo</h3>

    <!-- Form tạo thông báo mới -->
    <div class="card p-3 mb-4">
      <h5 class="mb-3">📝 Tạo thông báo mới</h5>
      <div class="row g-2">
        <div class="col-md-6">
          <input v-model="newNotice.title" class="form-control" placeholder="Tiêu đề" />
        </div>
        <div class="col-md-6">
          <input v-model="newNotice.image" class="form-control" placeholder="Ảnh (URL)" />
        </div>
        <div class="col-12">
          <textarea v-model="newNotice.content" class="form-control" placeholder="Nội dung" rows="3"></textarea>
        </div>
        <div class="col-md-6">
          <input v-model="newNotice.target" class="form-control" placeholder="Đối tượng (all, client, @username)" />
        </div>
        <div class="col-md-6">
          <select v-model="newNotice.status" class="form-select">
            <option value="hiển thị">Hiển thị</option>
            <option value="ẩn">Ẩn</option>
            <option value="nháp">Nháp</option>
          </select>
        </div>
        <div class="col-12">
          <button class="btn btn-primary" @click="submitNotice">Send </button>
        </div>
      </div>
    </div>

    <!-- Danh sách thông báo -->
    <h5 class="mb-3">📄 Danh sách thông báo</h5>
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border text-primary"></div>
    </div>
    <div v-else>
      <div
        v-for="item in notices"
        :key="item.id"
        class="card p-3 mb-3"
        @click="openModal(item)"
        style="cursor: pointer"
      >
        <h6 class="fw-bold">{{ item.title }}</h6>
        <img v-if="item.image" :src="item.image" alt="img" class="mb-2" style="max-height: 100px" />
        <p class="mb-1">📅 {{ item.date }} | 👤 {{ item.sender }} | 🎯 {{ item.target }}
        </p>
        <p class="mb-1">📌 Trạng thái: {{ item.status }}</p>
        <p class="mb-0">{{ item.content }}</p>
      </div>
    </div>

    <!-- Modal chính sửa -->
    <div class="modal" tabindex="-1" style="display: block" v-if="selected">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">🔧 Chính sửa thông báo</h5>
            <button type="button" class="btn-close" @click="selected = null"></button>
          </div>
          <div class="modal-body">
            <input v-model="selected.title" class="form-control mb-2" placeholder="Tiêu đề" />
            <input v-model="selected.image" class="form-control mb-2" placeholder="Ảnh (URL)" />
            <textarea v-model="selected.content" class="form-control mb-2" rows="3"></textarea>
            <input v-model="selected.target" class="form-control mb-2" placeholder="Đối tượng" />
            <select v-model="selected.status" class="form-select">
              <option value="hiển thị">Hiển thị</option>
              <option value="ẩn">Ẩn</option>
              <option value="nháp">Nháp</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="selected = null">Hủy</button>
            <button class="btn btn-success" @click="updateNotice">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const notices = ref([])
const loading = ref(false)
const selected = ref(null)

const newNotice = ref({
  title: '',
  image: '',
  content: '',
  target: 'all',
  status: 'hiển thị'
})

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await axios.get(SCRIPT_URL, { params: { action: 'getNotices' } })
    notices.value = res.data
  } catch (err) {
    alert('Lỗi khi tải danh sách')
  } finally {
    loading.value = false
  }
}

const submitNotice = async () => {
  const params = new URLSearchParams()
  params.append('action', 'createNotification')
  params.append('title', newNotice.value.title)
  params.append('image', newNotice.value.image)
  params.append('content', newNotice.value.content)
  params.append('target', newNotice.value.target)
  params.append('status', newNotice.value.status)
  params.append('sender', 'admin')

  try {
    await fetch(`${SCRIPT_URL}?${params.toString()}`, {
      method: 'POST',
      mode: 'no-cors'
    })
    alert('✅ Đã gửi thông báo')
    fetchNotices()
    Object.keys(newNotice.value).forEach(k => (newNotice.value[k] = ''))
  } catch (err) {
    alert('❌ Lỗi khi gửi thông báo')
    console.error(err)
  }
}

const openModal = (item) => {
  selected.value = { ...item } // clone to prevent direct binding
}

const updateNotice = async () => {
  if (!selected.value) return

  const params = new URLSearchParams()
  params.append('action', 'updateNotification')
  params.append('id', selected.value.id)
  params.append('title', selected.value.title)
  params.append('image', selected.value.image)
  params.append('content', selected.value.content)
  params.append('target', selected.value.target)
  params.append('status', selected.value.status)

  try {
    await fetch(`${SCRIPT_URL}?${params.toString()}`, {
      method: 'POST',
      mode: 'no-cors'
    })
    alert('✅ Đã cập nhật thông báo')
    selected.value = null
    fetchNotices()
  } catch (err) {
    alert('❌ Lỗi khi cập nhật')
    console.error(err)
  }
}


onMounted(fetchNotices)
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-dialog {
  max-width: 600px;
  width: 100%;
}
</style>