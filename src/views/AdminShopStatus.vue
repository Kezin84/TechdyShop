<template>
  <div class="container py-4">
    <h2 class="fw-bold mb-4">📊 Tình Trạng Shop</h2>

    <!-- Sản phẩm hết hàng -->
    <div class="mb-4">
      <h5 class="text-primary">⛔️ Sản phẩm hết hàng ({{ outStock.length }})</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="p in outStock" :key="p.ID">
          <strong>🆔 {{ p.ID }}</strong> | {{ p['TÊN SẢN PHẨM'] }} (SL: {{ p['SỐ LƯỢNG'] }})<br />
          <div v-for="(val, label) in productAttrs(p)" :key="label">{{ label }}: {{ val }}</div>
        </li>
      </ul>
    </div>

    <!-- Sản phẩm sắp hết hàng -->
    <div class="mb-4">
      <h5 class="text-primary">⚠️ Sản phẩm sắp hết hàng ({{ lowStock.length }})</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="p in lowStock" :key="p.ID">
          <strong>🆔 {{ p.ID }}</strong> | {{ p['TÊN SẢN PHẨM'] }} (SL: {{ p['SỐ LƯỢNG'] }})<br />
          <div v-for="(val, label) in productAttrs(p)" :key="label">{{ label }}: {{ val }}</div>
        </li>
      </ul>
    </div>

    <!-- Đơn chuẩn bị giao -->
    <div class="mb-4">
      <h5 class="text-primary">🚚 Đơn hàng chuẩn bị giao ({{ upcoming.length }})</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="o in upcoming" :key="o.id">
  {{ o['TELEGRAM'] || '-' }} | {{ o['SĐT'] || '-' }} | {{ o['ĐỊA CHỈ'] || '-' }} | Nhận lúc: {{ o['THỜI GIAN NHẬN'] || '-' }}
</li>
      </ul>
    </div>

    <!-- Bình luận -->
    <div class="mb-4">
      <h5 class="text-primary">💬 Bình luận mới hôm nay ({{ comments.length }})</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="c in comments" :key="c['THỐI GIAN']">
          {{ c['TÊN ĐĂNG NHẬP'] }} bình luận sản phẩm {{ c['ID SẢN PHẨM'] }}:
          {{ c['BÌNH LUẬN'] }} ({{ c['ĐÁNH GIÁ'] }}⭐)
        </li>
      </ul>
    </div>

    <!-- Khách hàng mới -->
    <div class="mb-4">
      <h5 class="text-primary">🤝 Khách hàng mới hôm nay ({{ customers.length }})</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="u in customers" :key="u['USERNAME']">
  👤 {{ u['USERNAME'] || '-' }} | 📧 {{ u['TELEGRAM'] || '-' }} | 📰 {{ u['EMAIL'] || '-' }} | 📞 {{ u['SỐ ĐIỆN THOẠI'] || '-' }} | 🏠 {{ u['ĐỊA CHỈ'] || '-' }}
</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const outStock = ref([])
const lowStock = ref([])
const upcoming = ref([])
const comments = ref([])
const customers = ref([])

onMounted(async () => {
  const [pro, upc, cmt, cus] = await Promise.all([
    axios.get(SCRIPT_URL, { params: { action: 'getLowStockProducts' } }),
    axios.get(SCRIPT_URL, { params: { action: 'getUpcomingOrders' } }),
    axios.get(SCRIPT_URL, { params: { action: 'getTodayComments' } }),
    axios.get(SCRIPT_URL, { params: { action: 'getNewCustomers' } })
  ])

  const all = pro.data || []
  outStock.value = all.filter(p => Number(p['SỐ LƯỢNG']) === 0)
  lowStock.value = all.filter(p => Number(p['SỐ LƯỢNG']) > 0 && Number(p['SỐ LƯỢNG']) <= 5)

  upcoming.value = upc.data
  comments.value = cmt.data
  customers.value = cus.data
})

const productAttrs = (p) => {
  const fields = {
    '📋 Trọng lượng': p['TRỌNG LƯỢNG'],
    '🗺️ Kích thước': p['KÍCH THƯỚC'],
    '🪨 Chất liệu': p['CHẤT LIỆU'],
    '🌺 Màu sắc': p['MÀU SẬC'],
    '🎓 Thương hiệu': p['THƯƠNG HIỆU'],
    '🌍 Xuất xứ': p['XUẤT XỨ'],
    '📅 Bảo hành': p['BẢO HÀNH']
  }
  return Object.fromEntries(Object.entries(fields).filter(([_, val]) => val && val.toString().trim()))
}
</script>

<style scoped>
.list-group-item {
  font-size: 14px;
}
</style>