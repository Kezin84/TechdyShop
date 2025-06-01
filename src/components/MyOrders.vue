<template>
  <div class="order-container">
    <div class="order-header-vip d-flex flex-wrap align-items-center mb-3">
      <div class="title-vip px-4 py-2 d-flex align-items-center me-4">
        <Calendar class="lucide-icon me-2" size="28" />
        <span>ĐƠN HÀNG CỦA TÔI</span>
      </div>
      <div class="filters-vip d-flex align-items-center flex-wrap gap-3">
        <div class="filter-group-vip px-3 py-1">
          <span class="label-vip"><BadgeDollarSign class="lucide-icon" size="18" /> Trạng thái:</span>
          <select v-model="selectedStatus" class="filter-select-vip">
            <option value="">-- Tất cả --</option>
            <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="filter-group-vip px-3 py-1">
          <span class="label-vip"><SortDesc v-if="sortOption==='moinhat'" class="lucide-icon" size="18" />
                <SortAsc v-else class="lucide-icon" size="18" /> Sắp xếp:</span>
          <select v-model="sortOption" class="filter-select-vip">
            <option value="moinhat"><SortDesc class="lucide-icon" size="18" /> Mới nhất</option>
            <option value="cunhat"><SortAsc class="lucide-icon" size="18" /> Cũ nhất</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-3">
      <LoaderCircle class="lucide-icon animate-spin" size="42" />
    </div>

    <div v-else-if="filteredOrders.length === 0">
      <p class="text-muted animate-fade">Không có đơn hàng phù hợp.</p>
    </div>

    <transition-group name="order-list" tag="div" class="row g-3" v-else>
      <div class="col-12" v-for="(order, index) in filteredOrders" :key="order.id" :class="{ 'order-glow': order.status === 'ĐANG XỬ LÝ' }">
        <div class="order-card border rounded p-3 shadow-sm bg-white h-100 animate-card-in">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-brown mb-0 order-id animate-fade-right">
              <BadgeDollarSign class="lucide-icon me-1" size="16" /> Mã đơn: {{ order.id }}
            </h6>
            <span
              class="order-status"
              :class="statusClass(order.status)"
            >
              <span v-if="isProcessing(order.status)" class="animate-blink"><LoaderCircle class="lucide-icon" size="18" /></span>
              <span v-else-if="isDone(order.status)"><CheckCircle2 class="lucide-icon" size="18" /></span>
              <span v-else-if="isCancel(order.status)"><XCircle class="lucide-icon" size="18" /></span>
              {{ order.status }}
            </span>
          </div>
          <div class="order-info-grid">
            <div class="order-user">
              <User2 class="lucide-icon" size="16" />
              <span>{{ order.username }}</span>
            </div>
            <div class="order-addr">
              <Home class="lucide-icon" size="16" />
              <span>{{ order.address }}</span>
            </div>
            <div class="order-phone">
              <Phone class="lucide-icon" size="16" />
              <span>{{ order.phone }}</span>
            </div>
            <div class="order-date">
              <Calendar class="lucide-icon" size="16" />
              <span>{{ order.date }}</span>
            </div>
          </div>
          <div class="mb-1 mt-2 animate-fade">
            <strong><ShoppingCart class="lucide-icon" size="17" /> Sản phẩm:</strong>
            <transition-group name="product-list" tag="div">
              <div v-for="(item, i) in parseProducts(order.products)" :key="i"
                class="mb-2 ps-2 border-start border-2 border-brown animate-slide-up"
              >
                <div>
                  <strong>{{ item.name }}</strong> x {{ item.qty }}
                  <span class="text-brown fw-bold">x {{ item.price.toLocaleString() }}₱</span>
                  = <strong class="text-brown">{{ item.total.toLocaleString() }}₱</strong>
                </div>
                <p class="mb-0 text-muted small" v-if="item.branch">
                  <Building2 class="lucide-icon" size="14" /> Chi nhánh: {{ item.branch }}
                </p>
                <ul class="mb-1 ps-3" v-if="item.attributes.length">
                  <li v-for="(attr, idx) in item.attributes" :key="idx" class="text-muted small animate-fade">
                    <BadgeDollarSign class="lucide-icon" size="13" /> {{ attr }}
                  </li>
                </ul>
              </div>
            </transition-group>
          </div>
          <p class="fw-bold text-brown order-total animate-fade-big">
            <BadgeDollarSign class="lucide-icon" size="19" /> Tổng tiền: {{ formatCurrency(order.total) }}
          </p>
          <div class="d-flex flex-wrap gap-4 mt-2 order-extra-info">
            <span class="text-muted small"><StickyNote class="lucide-icon" size="15" /> {{ order.telegram }}</span>
            <span class="small"><Clock4 class="lucide-icon" size="15" /> {{ order.time }}</span>
            <span class="small"><StickyNote class="lucide-icon" size="15" /> {{ order.note }}</span>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>




<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Calendar, User2, Home, Phone, BadgeDollarSign, ShoppingCart, Building2, Clock4, StickyNote, SortDesc, SortAsc, LoaderCircle, CheckCircle2, XCircle } from 'lucide-vue-next'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const orders = ref([])
const loading = ref(true)
const selectedStatus = ref('ĐÃ HOÀN THÀNH')
const sortOption = ref('moinhat')
const productMap = ref({})
const toTimestamp = (str) => {
  try {
    if (!str) return 0
    const [time, date] = str.trim().split(' ')
    const [hour, minute, second] = time.split(':').map(Number)
    const [day, month, year] = date.split('/').map(Number)
    return new Date(year, month - 1, day, hour, minute, second).getTime()
  } catch {
    return 0
  }
}

// Trạng thái duy nhất
const uniqueStatuses = computed(() => {
  const set = new Set()
  orders.value.forEach(o => set.add(o.status?.trim() || 'ĐANG XỬ LÝ'))
  return Array.from(set)
})

// Lọc và sắp xếp
const filteredOrders = computed(() => {
  let result = orders.value.map(o => ({
    ...o,
    status: o.status?.trim() || 'ĐANG XỬ LÝ',
    timestamp: toTimestamp(o.date)
  }))

  if (selectedStatus.value) {
    result = result.filter(o => o.status === selectedStatus.value)
  }

  result.sort((a, b) =>
    sortOption.value === 'moinhat'
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp
  )

  return result
})

const formatCurrency = (val) => {
  return Number(val || 0).toLocaleString() + '₱'
}

const fetchProductPrices = async () => {
  const res = await axios.get(SCRIPT_URL, {
    params: { action: 'getProducts' }
  })
  const data = res.data
  const map = {}
  data.forEach(item => {
    map[item['ID']] = {
      name: item['TÊN SẢN PHẨM'],
      price: Number(item['GIÁ']) || 0
    }
  })
  productMap.value = map
}

// Tách từng sản phẩm thành dòng riêng
const parseProducts = (raw) => {
  if (!raw) return []

  return String(raw)
    .split(',')
    .map(item => {
      // 👉 CẮT CHI NHÁNH nếu có
      const [mainPart, branchPart] = item.split('– CHI NHÁNH:')
      const branch = branchPart?.trim() || ''

      // 👉 Lấy thuộc tính trong ngoặc
      const attrMatch = mainPart.match(/\((.*?)\)/)
      const attrs = attrMatch ? attrMatch[1] : ''
      const cleanItem = mainPart.replace(/\(.*?\)/, '').trim()

      // 👉 Tách ID và tên
      const [idRaw, qtyRaw] = cleanItem.split(' x ')
      const [id, nameFromId] = idRaw.includes('–')
        ? idRaw.split('–').map(s => s.trim())
        : [idRaw.trim(), '']

      const qty = Number(qtyRaw)
      const info = productMap.value[id]

      if (!info || isNaN(qty)) return {
        name: nameFromId || id,
        qty: qty || 1,
        price: 0,
        total: 0,
        attributes: attrs
          ? attrs.split('|').map(x => x.trim()).filter(Boolean)
          : [],
        branch
      }

      const total = qty * info.price
      return {
        name: nameFromId || info.name,
        qty,
        price: info.price,
        total,
        attributes: attrs
          ? attrs.split('|').map(x => x.trim()).filter(Boolean)
          : [],
        branch
      }
    })
    .filter(Boolean)
}


onMounted(async () => {
  await fetchProductPrices()

  const saved = localStorage.getItem('user')
  if (!saved) return
  const { username } = JSON.parse(saved)

  try {
    const res = await axios.get(SCRIPT_URL, {
      params: {
        action: 'getOrdersByUser',
        user: username
      }
    })

    orders.value = res.data.map(o => ({
      ...o,
      status: o.status?.trim() || 'ĐANG XỬ LÝ',
        telegram: o.telegram || '',
  time: o.time || '',
  note: o.note || '',
      timestamp: toTimestamp(o.date)
    }))

    const hasProcessing = orders.value.some(o => o.status === 'ĐANG XỬ LÝ')
    selectedStatus.value = hasProcessing ? 'ĐANG XỬ LÝ' : ''

  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err)
  } finally {
    loading.value = false
  }
})

// Chuẩn hóa luôn cho chắc chắn
const normalizeStatus = status => (status || '').toUpperCase().trim()

const isDone = status =>
  normalizeStatus(status) === 'ĐÃ HOÀN THÀNH'

const isProcessing = status =>
  normalizeStatus(status) === 'ĐANG XỬ LÝ'

const isCancel = status =>
  ['ĐÃ BỊ HUỶ', 'ĐÃ TỪ CHỐI', 'HUỶ', 'TỪ CHỐI'].includes(normalizeStatus(status))

const statusClass = status => {
  if (isDone(status)) return 'order-status-done'
  if (isCancel(status)) return 'order-status-cancel'
  if (isProcessing(status)) return 'order-status-processing'
  return 'order-status-processing'
}

</script>

<style scoped>
.order-container {
  background: #fff;
  padding: 28px 22px;
  border-radius: 20px;
  max-width: 1050px;
  margin: 38px auto 28px;
  box-shadow: 0 16px 36px rgba(68,18,18,0.11), 0 1px 4px #44121222;
  min-height: 70vh;
  
}
.page-title {
  color: rgb(68, 18, 18);
  font-size: 2.15em;
  letter-spacing: 1.2px;
  font-weight: 900;
  text-shadow: 0 3px 14px #44121230;
  animation: pop-in 0.9s cubic-bezier(.25,1.5,.5,1);
}
.text-brown {
  color: rgb(68, 18, 18) !important;
}
.border-brown {
  border-color: rgb(68, 18, 18) !important;
}
.form-select {
  border-radius: 8px;
  border: 1.5px solid #b9937b;
  color: rgb(68, 18, 18);
  font-weight: 600;
  transition: border 0.2s;
  background: #fff;
}
.form-select:focus {
  border-color: rgb(68, 18, 18);
  box-shadow: 0 0 8px #44121234;
}

.order-card {
  border-radius: 18px !important;
  background: linear-gradient(112deg, #fff5f2 70%, #fff 100%);
  box-shadow: 0 6px 18px #44121212, 0 1px 3px #4412120c;
  transition: box-shadow 0.29s, transform 0.18s;
  border: none !important;
  position: relative;
  overflow: hidden;
  z-index: 1;
  animation: cardIn 0.62s cubic-bezier(.33,1.3,.68,1.07);
}
.order-card:hover {
  box-shadow: 0 18px 36px #44121244, 0 2.5px 7px #44121211;
  transform: scale(1.02) translateY(-5px);
}
.order-glow .order-card {
  box-shadow: 0 0 26px 0 #b0040450, 0 2.5px 7px #ffd60022;
  border: 2.5px solid rgb(68, 18, 18) !important;
}

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 18px;
  margin-bottom: 8px;
}
@media (max-width: 700px) {
  .order-info-grid { grid-template-columns: 1fr; }
}
.order-emoji {
  font-size: 1.2em;
  margin-right: 4px;
}

.order-status {
  font-size: 1.09em;
  font-weight: 900;
  padding: 4px 18px;
  border-radius: 14px;
  letter-spacing: 0.03em;
  background: #fff8e6;
  border: 1.4px solid #eee;
  transition: background 0.24s, color 0.23s;
  display: inline-block;
  min-width: 120px;
  text-align: center;
}
.order-status-done {
  color: #28a745 !important;         /* Xanh lá cây */
  background: #e3fce9 !important;
  border-color: #28a74577 !important;
}
.order-status-processing {
  color: #0084ff !important;         /* Xanh dương */
  background: #e4f1ff !important;
  border-color: #0084ff88 !important;
}
.order-status-processing {
  color: #0084ff !important;         /* Xanh dương */
  background: #e4f1ff !important;
  border-color: #0084ff88 !important;
}
.order-status-processing .animate-blink {
  color: #b9931b;
}

.order-total {
  font-size: 1.11em;
  font-weight: 900;
  color: rgb(68, 18, 18);
  letter-spacing: 0.04em;
  margin-bottom: 0.2em;
  margin-top: 0.5em;
}

.order-extra-info span {
  color: #8a633a;
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.8) translateY(-30px);}
  90% { opacity: 1; transform: scale(1.07) translateY(6px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.animate-pop-in { animation: pop-in 0.85s cubic-bezier(.21,1.12,.56,1); }
.animate-fade { animation: fadeIn 0.66s; }
@keyframes fadeIn { from { opacity: 0;} to { opacity: 1;} }
.animate-fade-big { animation: fadeBig 0.6s cubic-bezier(.3,1.5,.7,1); }
@keyframes fadeBig {
  0% { opacity: 0; transform: scale(1.2);}
  100% { opacity: 1; transform: scale(1);}
}
.animate-fade-right { animation: fadeRight 0.7s; }
@keyframes fadeRight { 0% { opacity: 0; transform: translateX(-30px);} 100% { opacity: 1; transform: translateX(0);} }
.animate-slide-up { animation: slideUp 0.7s cubic-bezier(.25,1.3,.5,1); }
@keyframes slideUp { from {opacity: 0; transform: translateY(30px);} to {opacity: 1; transform: translateY(0);} }
.animate-blink { animation: blink 1.4s infinite linear; }
@keyframes blink { 0%, 100% { opacity: 1;} 50% { opacity: 0.2;}}

.product-list-enter-active, .product-list-leave-active,
.order-list-enter-active, .order-list-leave-active {
  transition: all 0.54s cubic-bezier(.2,1.3,.55,1);
}
.product-list-enter-from, .order-list-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.98);
}
.product-list-leave-to, .order-list-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.93);
}

.custom-spinner {
  width: 48px;
  height: 48px;
  position: relative;
  margin: 24px auto;
}
.double-bounce1, .double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgb(68, 18, 18);
  opacity: 0.6;
  position: absolute;
  top: 0; left: 0;
  animation: bounce 2s infinite ease-in-out;
}
.double-bounce2 { animation-delay: -1s;}
@keyframes bounce {
  0%, 100% { transform: scale(0);}
  50% { transform: scale(1);}
}

@media (max-width: 700px) {
  .order-container {
    padding: 10px 2px;
    border-radius: 12px;
    margin: 0;
  }
  .order-card { padding: 14px 7px; }
}

.order-header-vip {
 background: rgb(68, 18, 18);
  padding: 16px 16px 14px 12px;
  border-radius: 18px;
  box-shadow: 0 2.5px 18px #44121213, 0 1px 3px #4412120a;
  margin-bottom: 28px;
  align-items: center;
  gap: 16px;
}
.title-vip {
  background: rgb(68, 18, 18);
  color: #fff;
  font-weight: bold;
  font-size: 2em;
  border-radius: 12px;
  box-shadow: 0 3px 16px #44121233;
  letter-spacing: 0.01em;
  text-shadow: 0 2.5px 18px #44121230;
  display: flex;
  align-items: center;
}
.emoji-vip { font-size: 1.5em; }
.filters-vip {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.filter-group-vip {
  background: #ffe3d1;
  border-radius: 10px;
  box-shadow: 0 1px 5px #44121213;
  display: flex;
  align-items: center;
  gap: 8px;
}
.label-vip {
  font-weight: 700;
  color: rgb(68, 18, 18);
  margin-right: 6px;
  font-size: 1em;
}
.filter-select-vip {
  border-radius: 8px;
  border: 1.5px solid #b9937b;
  color: rgb(68, 18, 18);
  font-weight: 600;
  padding: 3px 10px 3px 7px;
  background: #fff8f6;
  font-size: 1em;
  transition: border 0.22s, box-shadow 0.18s;
}
.filter-select-vip:focus {
  border-color: rgb(68, 18, 18);
  box-shadow: 0 0 8px #44121238;
}
@media (max-width: 700px) {
  .order-header-vip {
    flex-direction: column;
    gap: 10px;
    padding: 10px 4px;
  }
  .title-vip { font-size: 1.2em; }
}
.lucide-icon {
  vertical-align: -2px;
  margin-right: 4px;
  color: #b9937b;
  stroke-width: 2.1;
}
.animate-spin {
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}

</style>
