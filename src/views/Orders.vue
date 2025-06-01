<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4">✨ Tra cứu đơn hàng</h3>

    <!-- Bộ lọc tìm kiếm -->
    <div class="row g-3 mb-3 align-items-center">
      <div class="col-auto">
        <input
          v-model="query"
          type="text"
          class="form-control"
          placeholder="Nhập SĐT hoặc @telegram"
        />
      </div>
      <div class="col-auto">
        <select v-model="selectedStatus" class="form-select">
          <option value="">-- Tất cả trạng thái --</option>
          <option value="ĐANG XỬ LÝ">📦 Đang xử lý</option>
          <option value="ĐÃ HOÀN THÀNH">✅ Hoàn thành</option>
          <option value="ĐÃ BỊ HUỶ">❌ Từ chối</option>
        </select>
      </div>
      <div class="col-auto">
        <select v-model="sortOrder" class="form-select">
          <option value="moinhat">🔽 Mới nhất</option>
          <option value="cunhat">🔼 Cũ nhất</option>
        </select>
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="fetchOrders">Tra cứu</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Không tìm thấy -->
    <div v-else-if="filteredOrders.length === 0 && searched">
      <p class="text-muted">Không tìm thấy đơn hàng nào.</p>
    </div>

    <!-- Kết quả -->
    <div v-else>
      <div
        v-for="(order, index) in filteredOrders"
        :key="index"
        class="card mb-3 shadow-sm"
      >
        <div class="card-body">
          <h6 class="fw-bold">🆔 Mã đơn: {{ order.id }}</h6>
          <p class="mb-1">👤 Người mua: {{ order.username }}</p>
          <p class="mb-1">📍 Địa chỉ: {{ order.address }}</p>
          <p class="mb-1">📞 SĐT: {{ order.phone }}</p>
          <p class="mb-1">🛒 Sản phẩm:</p>
<ul class="mb-2 ps-3">
<li v-for="(item, i) in parseProducts(order.products)" :key="i">
  <div v-if="item.name">
    {{ item.name }}<br />
    ➤ Số lượng: {{ item.quantity }} |
    Đơn giá: {{ formatCurrency(item.price) }} |
    Thành tiền:
    <strong class="text-danger">{{ formatCurrency(item.subtotal) }}</strong>
  </div>
  <div v-else>
    {{ item.text }}
  </div>
</li>

</ul>


          <p class="mb-1 fw-bold text-danger">💰 Tổng tiền: {{ formatCurrency(order.total) }}</p>
          <p class="mb-1 text-muted">🕒 Ngày: {{ order.date }}</p>
          <p class="mb-1">
            📌 Trạng thái:
            <span
              :class="{
                'text-success': order.status === 'ĐÃ HOÀN THÀNH',
                'text-danger': order.status === 'ĐÃ BỊ HUỶ',
                'text-primary': order.status === 'ĐANG XỬ LÝ'
              }"
              class="fw-bold"
            >
              {{ order.status }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed ,onMounted} from 'vue'
import axios from 'axios'

const query = ref('')
const orders = ref([])
const loading = ref(false)
const searched = ref(false)
const selectedStatus = ref('')
const sortOrder = ref('moinhat')

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const fetchOrders = async () => {
  if (!query.value) return alert('Nhập số điện thoại hoặc Telegram!')

  loading.value = true
  searched.value = false
  orders.value = []

  try {
    const params = {
      action: 'getOrdersByPhone'
    }
    if (query.value.startsWith('@')) {
      params.telegram = query.value.trim()
    } else {
      params.phone = query.value.trim()
    }

    const res = await axios.get(SCRIPT_URL, { params })
    orders.value = res.data.map(row => {
      const rawStatus = (row[7] || '').trim().toLowerCase()
      const status =
        rawStatus === 'đã hoàn thành' ? 'ĐÃ HOÀN THÀNH'
        : rawStatus === 'đã từ chối' ? 'ĐÃ BỊ HUỶ'
        : 'ĐANG XỬ LÝ'

      return {
        id: row[0],
        username: row[1],
        address: row[2],
        phone: row[3],
        products: row[4],
        total: row[5],
        date: row[6],
        status
      }
    })
    searched.value = true
  } catch (err) {
    alert('Lỗi khi tra cứu!')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const toTimestamp = (str) => {
  try {
    const [time, date] = str.split(' ')
    const [h, m, s] = time.split(':').map(Number)
    const [d, mo, y] = date.split('/').map(Number)
    return new Date(y, mo - 1, d, h, m, s).getTime()
  } catch {
    return 0
  }
}
const products = ref([])

const fetchProducts = async () => {
  try {
    const res = await axios.get(`${SCRIPT_URL}?action=getProducts`)
    products.value = res.data
  } catch (err) {
    console.error('Lỗi tải danh sách sản phẩm:', err)
  }
}

onMounted(() => {
  fetchProducts()
})
const filteredOrders = computed(() => {
  let result = [...orders.value]
  if (selectedStatus.value) {
    result = result.filter(o => o.status === selectedStatus.value)
  }

  result.sort((a, b) => {
    const ta = toTimestamp(a.date)
    const tb = toTimestamp(b.date)
    return sortOrder.value === 'moinhat' ? tb - ta : ta - tb
  })

  return result
})

const formatCurrency = (val) => Number(val || 0).toLocaleString() + '₱'

const parseProducts = (raw) => {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map(p => {
      const match = p.match(/(\w+)\s*–\s*(.*?)\s*x\s*(\d+)/)
      if (!match) return { text: p.trim() }

      const id = match[1]
      const quantity = Number(match[3])

      const found = products.value.find(item => item.ID === id)
      if (!found) return { text: `${match[2]} x ${quantity}` }

      const attrList = [
        found['TRỌNG LƯỢNG'],
        found['KIỂU DÁNG'],
        found['MÀU SẮC'],
        found['KÍCH THƯỚC'],
        found['CHẤT LIỆU'],
        found['THƯƠNG HIỆU'],
        found['XUẤT XỨ'],
        found['BẢO HÀNH']
      ].filter(v => v && v.toString().trim() !== '').join(' / ')

      const name = attrList ? `${found['TÊN SẢN PHẨM']} (${attrList})` : found['TÊN SẢN PHẨM']
      const price = Number(found['GIÁ'] || 0)
      const subtotal = quantity * price

      return { name, quantity, price, subtotal }
    })
}


</script>

<style scoped>
input.form-control {
  width: 250px;
}
</style>
