<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const orders = ref([])
const loading = ref(true)
const currentTab = ref('pending')
const selectedStatus = ref('')
const sortOption = ref('')
const selectedOrder = ref(null)
const showModal = ref(false)

const fetchOrders = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    const res = await axios.get(SCRIPT_URL, {
      params: { action: 'getAllOrders' }
    })
    orders.value = res.data
  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err)
  } finally {
    if (!silent) loading.value = false
  }
}

const updateStatus = async (id, status) => {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('action', 'updateOrderStatus')
    formData.append('id', id)
    formData.append('status', status)
    await axios.post(SCRIPT_URL, formData)
    await fetchOrders()
  } catch (err) {
    alert('Lỗi cập nhật trạng thái')
  } finally {
    loading.value = false
  }
}

const updateOrder = async () => {
  if (!selectedOrder.value) return
  const formData = new FormData()
  formData.append('action', 'updateOrder')
  formData.append('id', selectedOrder.value.id)
  formData.append('username', selectedOrder.value.username)
  formData.append('phone', selectedOrder.value.phone)
  formData.append('address', selectedOrder.value.address)
  formData.append('products', selectedOrder.value.products)
  formData.append('total', selectedOrder.value.total)
  formData.append('status', selectedOrder.value.status || '')
  await axios.post(SCRIPT_URL, formData)
  await fetchOrders()
  showModal.value = false
}

const deleteOrder = async () => {
  if (!selectedOrder.value) return
  if (!confirm('Bạn có chắc chắn muốn xoá đơn này?')) return
  const formData = new FormData()
  formData.append('action', 'deleteOrder')
  formData.append('id', selectedOrder.value.id)
  await axios.post(SCRIPT_URL, formData)
  await fetchOrders()
  showModal.value = false
}

const formatCurrency = (val) => {
  if (!val || isNaN(val)) return '0₱'
  return Number(val).toLocaleString() + '₱'
}

const parseDate = (str) => {
  const [datePart, timePart = '00:00:00'] = str.split(/[, ]+/)
  const [day, month, year] = datePart.split('/').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, second)
}

const sortedAndFilteredOrders = computed(() => {
  let result = [...orders.value]

  if (currentTab.value === 'pending') {
    result = result.filter(o => !o.status)
  }

  if (currentTab.value === 'all' && selectedStatus.value) {
    result = result.filter(o => (o.status || '').trim() === selectedStatus.value)
  }

  if (sortOption.value === 'moinhat') {
    result.sort((a, b) => parseDate(b.date) - parseDate(a.date)).reverse()
  } else if (sortOption.value === 'cunhat') {
    result.sort((a, b) => parseDate(a.date) - parseDate(b.date))
  }

  return result
})

const uniqueStatuses = computed(() => {
  const set = new Set()
  orders.value.forEach(o => {
    if (o.status) set.add(o.status.trim())
  })
  return Array.from(set)
})

const selectOrder = (order) => {
  selectedOrder.value = { ...order }
  showModal.value = true
}

onMounted(() => {
  fetchOrders()
  setInterval(() => {
    fetchOrders(true)
  }, 10000)
})
</script>

<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4">📋 Quản lý đơn hàng</h3>

    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-outline-primary btn-sm" :class="{ active: currentTab === 'pending' }" @click="currentTab = 'pending'">✅ Duyệt đơn</button>
      <button class="btn btn-outline-secondary btn-sm" :class="{ active: currentTab === 'all' }" @click="currentTab = 'all'">📄 Tất cả đơn</button>
    </div>

    <div v-if="currentTab === 'all'" class="mb-3 d-flex gap-3 align-items-center">
      <div>
        <label class="me-2 fw-bold">📦 Trạng thái:</label>
        <select v-model="selectedStatus" class="form-select d-inline w-auto">
          <option value="">-- Tất cả --</option>
          <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
      <div>
        <label class="me-2 fw-bold">🕒 Sắp xếp:</label>
        <select v-model="sortOption" class="form-select d-inline w-auto">
          <option value="">-- Mặc định --</option>
          <option value="moinhat">🔽 Mới nhất</option>
          <option value="cunhat">🔼 Cũ nhất</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải đơn hàng...</p>
    </div>

    <div v-else-if="sortedAndFilteredOrders.length === 0">
      <p class="text-muted">Không có đơn hàng phù hợp.</p>
    </div>

    <div class="row g-3" v-else>
      <div class="col-md-6" v-for="(order, index) in sortedAndFilteredOrders" :key="index">
        <div class="border rounded p-3 shadow-sm bg-white h-100" @click="selectOrder(order)" style="cursor: pointer" :class="{ 'border-success': selectedOrder?.id === order.id }">
          <h6 class="fw-bold text-primary mb-2">🆔 Mã đơn: {{ order.id }}</h6>
          <p><strong>👤 Người mua:</strong> {{ order.username }}</p>
          <p><strong>📍 Địa chỉ:</strong> {{ order.address }}</p>
          <p><strong>📞 SĐT:</strong> {{ order.phone }}</p>
          <p><strong>🛍️ Sản phẩm:</strong> {{ order.products }}</p>
          <p class="fw-bold text-danger">💰 Tổng tiền: {{ formatCurrency(order.total) }}</p>
          <p class="text-muted">🕒 Ngày: {{ order.date }}</p>
          <p><strong>📦 Trạng thái:</strong> {{ order.status || 'Đang xử lý' }}</p>

          <!-- ✅ THÊM NÚT HOÀN THÀNH / TỪ CHỐI -->
          <div v-if="!order.status || order.status === 'Đang xử lý'" class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-success" @click.stop="updateStatus(order.id, 'Đã hoàn thành')">✅ Hoàn thành</button>
            <button class="btn btn-sm btn-danger" @click.stop="updateStatus(order.id, 'Đã từ chối')">❌ Từ chối</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal popup sửa đơn -->
    <div v-if="showModal" class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
      <div class="bg-white rounded shadow p-4" style="width: 400px">
        <h5 class="text-success fw-bold mb-3">✏️ Chi tiết đơn: {{ selectedOrder.id }}</h5>

        <div class="mb-2">
          <label class="form-label">Tên khách hàng</label>
          <input v-model="selectedOrder.username" class="form-control" />
        </div>
        <div class="mb-2">
          <label class="form-label">Số điện thoại</label>
          <input v-model="selectedOrder.phone" class="form-control" />
        </div>
        <div class="mb-2">
          <label class="form-label">Địa chỉ</label>
          <input v-model="selectedOrder.address" class="form-control" />
        </div>
        <div class="mb-2">
          <label class="form-label">Sản phẩm</label>
          <textarea v-model="selectedOrder.products" class="form-control" rows="2" />
        </div>
        <div class="mb-2">
          <label class="form-label">Tổng tiền</label>
          <input v-model="selectedOrder.total" type="number" class="form-control" />
        </div>
        <div class="mb-2">
          <label class="form-label">Trạng thái</label>
          <input v-model="selectedOrder.status" class="form-control" />
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-success btn-sm" @click="updateOrder">💾 Lưu</button>
          <button class="btn btn-danger btn-sm" @click="deleteOrder">🗑️ Xoá</button>
          <button class="btn btn-secondary btn-sm" @click="showModal = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}
button.active {
  font-weight: bold;
  border: 3px solid #000;
}
</style>
