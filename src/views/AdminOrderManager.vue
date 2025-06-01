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

    // ✅ Nếu duyệt hoàn thành thì trừ kho
    if (status === 'Đã hoàn thành') {
      const order = orders.value.find(o => o.id === id)
      if (order && order.products) {
        const productList = String(order.products).split(',').map(item => item.trim())

        for (const item of productList) {
          // ✅ Tách ID và SL: "X9T4M1 – Tên SP x 10 (thuộc tính)"
          const main = item.split('(')[0].trim() // bỏ phần thuộc tính
          const match = main.match(/^(.*?)–.*?x\s*(\d+)/)

          if (!match) continue

          const productId = match[1].trim()
          const qty = parseInt(match[2].trim()) || 0

          const inventoryForm = new FormData()
          inventoryForm.append('action', 'decreaseStock')
          inventoryForm.append('productId', productId)
          inventoryForm.append('quantity', qty)

          await axios.post(SCRIPT_URL, inventoryForm)
        }
      }
    }

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
  formData.append('telegram', selectedOrder.value.telegram || '')
formData.append('time', selectedOrder.value.time || '')
formData.append('note', selectedOrder.value.note || '')
formData.append('chiNhanh', selectedOrder.value.branch || '')

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




const productMap = ref({})

const fetchProductPrices = async () => {
  const res = await axios.get(SCRIPT_URL, {
    params: { action: 'getProducts' }
  })
  const data = res.data
  const map = {}
  data.forEach(item => {
    map[item['ID']] = {
      name: item['TÊN SẢN PHẨM'],
      price: Number(item['GIÁ']),
      cost: isNaN(Number(item['GIÁ GỐC'])) ? 0 : Number(item['GIÁ GỐC']),


      'KIỂU DÁNG': item['KIỂU DÁNG'] || '',
      'MÀU SẮC': item['MÀU SẮC'] || '',
      'KÍCH THƯỚC': item['KÍCH THƯỚC'] || '',
      'CHẤT LIỆU': item['CHẤT LIỆU'] || '',
      'THƯƠNG HIỆU': item['THƯƠNG HIỆU'] || '',
      'XUẤT XỨ': item['XUẤT XỨ'] || '',
      'BẢO HÀNH': item['BẢO HÀNH'] || ''
    }
  })
  productMap.value = map
}


const parseProducts = (raw) => {
  if (!raw) return []

  return String(raw).split(',').map(item => {
    const cleaned = item.trim()
    const [idRaw, qtyRaw] = cleaned.split(' x ')

    // ⚠️ Bỏ qua nếu thiếu id hoặc qty hoặc qty không phải số
    if (!idRaw || !qtyRaw || isNaN(Number(qtyRaw.trim()))) {
      return { line: cleaned + ' ❌', attributes: '' }
    }

    const id = idRaw.includes('–') ? idRaw.split('–')[0].trim() : idRaw.trim()
    const qty = Number(qtyRaw.trim())
    const info = productMap.value[id]

    if (info) {
      const total = qty * info.price
      const attrs = [
        `KIỂU DÁNG: ${info['KIỂU DÁNG']}`,
        `MÀU SẮC: ${info['MÀU SẮC']}`,
        `KÍCH THƯỚC: ${info['KÍCH THƯỚC']}`,
        `CHẤT LIỆU: ${info['CHẤT LIỆU']}`,
        `THƯƠNG HIỆU: ${info['THƯƠNG HIỆU']}`,
        `XUẤT XỨ: ${info['XUẤT XỨ']}`,
        `BẢO HÀNH: ${info['BẢO HÀNH']}`
      ].filter(e => !e.includes('undefined') && !e.includes('null')).join(' | ')

      return {
        line: `${info.name} x ${qty} x ${info.price.toLocaleString()}₱ = ${total.toLocaleString()}₱`,
        attributes: attrs
      }
    } else {
      return { line: `${id} x ${qty} ❌`, attributes: '' }
    }
  })
}



onMounted(async () => {
  await fetchProductPrices()
  await fetchOrders()
  setInterval(() => fetchOrders(true), 10000)
})

const pendingCount = computed(() => {
  return orders.value.filter(o => !o.status).length
})

const calculateProfit = (order) => {
  if (!order || !order.products) return 0

  const productList = String(order.products).split(',').map(item => item.trim())
  let totalCost = 0

  for (const item of productList) {
    // ✅ Bỏ phần (thuộc tính)
    const main = item.split('(')[0].trim()

    // ✅ Tách ID và số lượng từ "X9T4M1 – Tên SP x 10"
    const match = main.match(/^([^\–]+)–.*?x\s*(\d+)/)
    if (!match) continue

    const id = match[1].trim()
    const qty = parseInt(match[2]) || 0
    const product = productMap.value[id]

    if (product) {
      totalCost += qty * product.cost
    }
  }

  return Number(order.total) - totalCost
}



</script>

<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4">📋 Quản lý đơn hàng</h3>

    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-outline-primary btn-sm" :class="{ active: currentTab === 'pending' }" @click="currentTab = 'pending'">
  ✅ Duyệt đơn <span v-if="pendingCount > 0" class="badge bg-danger ms-1">{{ pendingCount }}</span>
</button>

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
         <p><strong>🛍️ Sản phẩm:</strong></p>
<ul class="mb-2 ps-4">
<li v-for="(item, i) in parseProducts(order.products)" :key="i">
  {{ item.line }}
  <div v-if="item.attributes" class="text-muted small ps-2">
    {{ item.attributes }}
  </div>
</li>


</ul>


          <p class="fw-bold text-danger">💰 Tổng tiền: {{ formatCurrency(order.total) }}</p>
          <p class="text-muted">🕒 Ngày: {{ order.date }}</p>
          <p><strong>📨 Telegram:</strong> {{ order.telegram }}</p>
<p><strong>⏰ Thời gian nhận:</strong> {{ order.time }}</p>
<p><strong>📝 Ghi chú:</strong> {{ order.note }}</p>
<p><strong>🏢 Chi nhánh:</strong> {{ order.branch || 'Không rõ' }}</p>

          <p><strong>📦 Trạng thái:</strong> {{ order.status || 'Đang xử lý' }}</p>

          <!-- ✅ THÊM NÚT HOÀN THÀNH / TỪ CHỐI -->
          <div v-if="!order.status || order.status === 'Đang xử lý'" class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-success" @click.stop="updateStatus(order.id, 'Đã hoàn thành')">✅ Hoàn thành</button>
            <button class="btn btn-sm btn-danger" @click.stop="updateStatus(order.id, 'Đã từ chối')">❌ Từ chối</button>
          </div>
          <div class="mt-2 text-success fw-bold">
  📈 Lợi nhuận: {{ formatCurrency(calculateProfit(order)) }}
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
  <label class="form-label">Chi nhánh</label>
  <input v-model="selectedOrder.branch" class="form-control" />
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
  <label class="form-label">Telegram</label>
  <input v-model="selectedOrder.telegram" class="form-control" />
</div>
<div class="mb-2">
  <label class="form-label">Thời gian nhận</label>
  <input v-model="selectedOrder.time" class="form-control" />
</div>
<div class="mb-2">
  <label class="form-label">Ghi chú</label>
  <input v-model="selectedOrder.note" class="form-control" />
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
.badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 12px;
}

</style>
