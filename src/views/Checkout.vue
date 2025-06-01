<template>
  <div class="checkout-vip-flex">
    <!-- DIV 1: Sản phẩm -->
    <div class="checkout-vip-products">
      <div class="checkout-vip-products-inner animate-fadein">
        <label class="form-label fw-semibold checkout-label-vip">
          <span class="checkout-icon-vip"><ShoppingCart size="30" /></span> SẢN PHẨM ĐÃ ĐẶT
        </label>
        <div class="product-list">
          <transition-group name="pro-fade-slide" tag="div">
            <div v-if="cart.length === 0" class="checkout-empty-vip" key="empty">
              <span style="font-size: 2.3em;">📦</span><br>
              Giỏ hàng đang trống.
            </div>
            <div
              v-for="(item, index) in cart"
              :key="item.ID + '-' + index"
              class="checkout-product-item-vip animate-product"
            >
              <img
                :src="item['ẢNH(URL)']"
                alt="Ảnh sản phẩm"
                class="checkout-product-img-vip"
              />
              <div class="checkout-product-content-vip">
                <div class="product-title-box-vip">
                  <span class="product-title-vip">{{ item['TÊN SẢN PHẨM'] }}</span>
                  <span class="product-qty-vip">x{{ item.quantity }}</span>
                </div>
                <div class="product-attrs-vip" v-html="formatProductAttrs(item)" />
                <div class="product-branch-vip" v-if="item['CHI NHÁNH']">
                  <b>Chi nhánh:</b> {{ item['CHI NHÁNH'] }}
                </div>
                <div class="product-price-vip">{{ formatMoney(item['GIÁ'] * item.quantity) }}₱</div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
    <!-- DIV 2+3: Đặt hàng + tổng tiền -->
    <div class="checkout-vip-side animate-slidein">
      <form class="checkout-info-vip card-vip animate-fadein" @submit.prevent="submitOrder">
        <div class="section-title-vip">
          <User size="40" /> THÔNG TIN KHÁCH
        </div>
        <div class="info-fields-vip">
          <label class="form-label-vip">Telegram</label>
          <input v-model="telegram" placeholder="Telegram" required />

          <label class="form-label-vip">Địa chỉ nhận hàng <span class="text-danger">*</span></label>
          <input v-model="address" required placeholder="Địa chỉ nhận hàng" />

          <label class="form-label-vip">Số điện thoại <span class="text-danger">*</span></label>
          <input v-model="phone" required placeholder="Số điện thoại" />

          <label class="form-label-vip">Thời gian mong muốn nhận <span class="text-danger">*</span></label>
          <div class="time-row-vip" required>
            <input v-model="dateOnly" type="date" required />
            <label class="form-label-vip">Giờ nhận <span class="text-danger">*</span></label>
            <TimePicker v-model="timeOnly" format="HH:mm" is24hr hide-clear-button required/>
            <label class="form-label-vip">Buổi nhận <span class="text-danger">*</span></label>
            <select v-model="period" required>
              <option disabled value="">Buổi</option>
              <option value="Sáng">Sáng</option>
              <option value="Chiều">Chiều</option>
              <option value="Tối">Tối</option>
            </select>
          </div>
          <label class="form-label-vip">Ghi chú đơn hàng</label>
          <textarea v-model="note" rows="2" placeholder="Ghi chú đơn hàng"></textarea>
        </div>
      </form>
      <div class="checkout-total-vip card-vip checkout-total-dark animate-bouncein">
        <div class="total-label-vip">
          <span style="font-weight: bold;font-size: 32px;color: aliceblue;">TOTAL: </span>
          <span class="total-value-vip">{{ formatMoney(total) }}₱</span>
        </div>
        <button
  class="btn-checkout-vip btn-animate-vip"
  @click="submitOrder"
  :disabled="isSubmitting"
  style="position:relative; min-width:170px;"
>
  <span v-if="!isSubmitting" style="font-weight: bold;">ĐẶT HÀNG</span>
  <span v-else class="checkout-spinner"></span>
  <span class="btn-glow"></span>
</button>

      </div>
    </div>
  </div>
  <!-- DIALOG ĐẶT HÀNG THÀNH CÔNG -->
<transition name="fade-scale">
  <div v-if="showOrderSuccess" class="order-success-dialog-backdrop" @click="closeOrderDialog">
    <div class="order-success-dialog" @click.stop>
      <div class="success-icon"><span>✅</span></div>
      <h3>Đặt hàng thành công!</h3>
      <p class="order-success-sub">Cảm ơn bạn đã đặt hàng.<br>
        Bạn có thể xem lại đơn hàng trong mục <b>Đơn hàng của tôi</b>.
      </p>
      <div style="margin-top: 18px;">
        <button class="btn btn-warning" @click="goToMyOrders" style="font-weight:bold">Xem đơn hàng</button>
        <button class="btn btn-outline-secondary ms-2" @click="closeOrderDialog">Đóng</button>
      </div>
    </div>
  </div>
</transition>

</template>

<script setup>
import SuccessDialog from '@/components/SuccessDialog.vue'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import TimePicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'
import axios from 'axios'
import { ShoppingCart, CreditCard, Banknote, ClipboardList,Truck 
  ,QrCode ,House ,Star,PackageSearch ,ArrowRightLeft ,NotebookPen ,User 
} from 'lucide-vue-next'
const isSubmitting = ref(false)
const showOrderSuccess = ref(false)
let orderDialogTimer = null

function closeOrderDialog() {
  showOrderSuccess.value = false
  clearTimeout(orderDialogTimer)
}
function goToMyOrders() {
  showOrderSuccess.value = false
  clearTimeout(orderDialogTimer)
  window.location.href = '/my-orders'
}
const attributeKeys = [
  'TRỌNG LƯỢNG', 'KIỂU DÁNG', 'MÀU SẮC', 'KÍCH THƯỚC',
  'CHẤT LIỆU', 'THƯƠNG HIỆU', 'XUẤT XỨ', 'BẢO HÀNH'
]
const formatProductAttrs = (item) => {
  return attributeKeys
    .filter(key => item[key])
    .map(key => `<b>${key}:</b> ${item[key]}`)
    .join(' | ')
}
const cart = ref([])
const telegram = ref('')
const address = ref('')
const phone = ref('')
const dateOnly = ref('')
const timeOnly = ref('')
const period = ref('')
const note = ref('')
const user = JSON.parse(localStorage.getItem('user')) || {}
const username = user.username || ''
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const formatMoney = (val) => {
  if (!val) return '0'
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

watch(timeOnly, (newVal) => {
  const hour = parseInt(newVal?.split(':')[0])
  if (!isNaN(hour)) {
    if (hour >= 5 && hour < 12) period.value = 'Sáng'
    else if (hour >= 12 && hour < 18) period.value = 'Chiều'
    else period.value = 'Tối'
  }
})

onMounted(async () => {
  const cartKey = `cart_${username}`
  const stored = localStorage.getItem(cartKey)
  if (stored) cart.value = JSON.parse(stored)
  if (username) {
    try {
      const params = new URLSearchParams({ action: 'getCustomerInfo', username })
      const res = await fetch(`${SCRIPT_URL}?${params}`)
      const data = await res.json()
      if (data.success) {
        address.value = data.diachi
        phone.value = data.sdt
        telegram.value = data.telegram || ''
      }
    } catch (err) { }
  }
  await nextTick()
  // Tự động set chiều cao bằng cột phải (nếu muốn)
  const rightCol = document.querySelector('.checkout-vip-side')
  const leftBox = document.querySelector('.checkout-vip-products-inner')
  if (rightCol && leftBox) {
    leftBox.style.height = rightCol.offsetHeight + 'px'
    leftBox.style.maxHeight = rightCol.offsetHeight + 'px'
  }
})

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item['GIÁ'] * item.quantity, 0)
)

const submitOrder = async () => {
  if (isSubmitting.value) return
  if (cart.value.length === 0) return alert('Giỏ hàng trống!')
   if (!dateOnly.value || !timeOnly.value || !period.value) {
    alert('Vui lòng điền đầy đủ ngày, giờ và buổi nhận hàng!')
    return
  }
  isSubmitting.value = true

  const formattedTime = `${timeOnly.value} (${period.value}) ngày ${new Date(dateOnly.value).toLocaleDateString('vi-VN')}`
  const productList = cart.value.map(item => {
    const attributes = attributeKeys.filter(key => item[key]).map(key => `${key}: ${item[key]}`).join(' | ')
    return `${item.ID} – ${item['TÊN SẢN PHẨM']} x ${item.quantity}${attributes ? ` (${attributes})` : ''} – CHI NHÁNH: ${item['CHI NHÁNH'] || 'Không rõ'}`
  }).join(', ')
try {
  await axios.post(SCRIPT_URL, new URLSearchParams({
    action: 'addOrder', user: username, name: address.value, phone: phone.value,
    products: productList, total: total.value, date: new Date().toLocaleString(),
    telegram: telegram.value, time: formattedTime, note: note.value,
    branch: [...new Set(cart.value.map(i => i['CHI NHÁNH']).filter(Boolean))].join(', '),
    items: JSON.stringify(cart.value.map(item => ({
      id: item.ID,
      name: item['TÊN SẢN PHẨM'],
      price: item['GIÁ'],
      quantity: item.quantity,
      attributes: attributeKeys.filter(key => item[key]).map(key => `${key}: ${item[key]}`).join(' | ')
    })))
  }))
  await axios.post(SCRIPT_URL, new URLSearchParams({
    action: 'updateStock',
    items: JSON.stringify(cart.value.map(item => ({ id: item.ID, quantity: item.quantity })))
  }))
  showOrderSuccess.value = true
  orderDialogTimer = setTimeout(() => {
    goToMyOrders()
  }, 2300)
  localStorage.removeItem(`cart_${username}`)
  cart.value = []
} catch (error) {
  alert('Lỗi khi đặt hàng!')
} finally {
  isSubmitting.value = false
}

}

</script>

<style scoped>
/* Animation */
@keyframes fadein {
  from { opacity: 0; transform: translateY(24px);}
  to { opacity: 1; transform: none;}
}
@keyframes slidein {
  from { opacity: 0; transform: translateX(64px);}
  to { opacity: 1; transform: none;}
}
@keyframes bouncein {
  0% {transform: scale(0.7) translateY(60px);}
  70% {transform: scale(1.06) translateY(-10px);}
  100% {transform: scale(1) translateY(0);}
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 18px 8px #ffd35844, 0 0 0 0 #ffd35800;}
  50% { box-shadow: 0 0 32px 16px #ffd358cc, 0 0 0 4px #ffd35866;}
}

/* Transition for product list */
.pro-fade-slide-enter-active, .pro-fade-slide-leave-active {
  transition: all 0.36s cubic-bezier(.4,1.4,.6,1);
}
.pro-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(22px) scale(0.98);
}
.pro-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(1.02);
}

/* Animate utility classes */
.animate-fadein { animation: fadein 0.7s cubic-bezier(.44,1.32,.47,.94) both; }
.animate-slidein { animation: slidein 0.8s cubic-bezier(.32,1.54,.46,1) both;}
.animate-bouncein { animation: bouncein 1s cubic-bezier(.38,2.2,.34,1) both;}
.animate-product { animation: fadein 0.68s cubic-bezier(.44,1.32,.47,.94) both;}

.checkout-vip-flex {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  justify-content: center;
  max-width: 1500px;
  margin: 48px auto 36px auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
}

/* SẢN PHẨM */
.checkout-vip-products {
  flex: 2.2;
  min-width: 540px;
  max-width: 860px;
  display: flex;
  flex-direction: column;
}
.checkout-vip-products-inner {
  height: 900px;
  max-height: 950px;
  background: #fff;
  border-radius: 32px;
  box-shadow:
    0 12px 48px 0 rgba(68,18,18,0.16),
    0 4px 32px 0 rgba(68,18,18,0.09),
    0 0px 0px 1.5px #ed373713;
  padding: 34px 34px 38px 34px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.checkout-label-vip {
  background: rgb(68,18,18);
  color: #fff !important;
  font-weight: 900;
  font-size: 1.32em;
  letter-spacing: 1.2px;
  border-radius: 18px;
  display: inline-block;
  padding: 13px 38px 13px 22px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px #44121222;
  text-transform: uppercase;
  border: none;
  position: relative;
  z-index: 1;
}
.checkout-icon-vip { font-size: 1.24em; margin-right: 8px; vertical-align: -2px;}

.product-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 0px;
  padding: 10px;
  gap: 32px;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
}

.checkout-product-item-vip {
  display: flex;
  align-items: flex-start;
  gap: 34px;
  background: #fff8f5;
  border-radius: 32px;
  margin-bottom: 0;
  box-shadow: 0 4px 18px rgba(68,18,18,0.09);
  padding: 36px 40px 30px 30px;
  border: 2px solid #e7dad6;
  transition: box-shadow 0.22s, transform 0.2s;
  min-width: 0;
  max-width: 100%;
  opacity: 1;
  will-change: box-shadow, transform;
}
.checkout-product-item-vip:hover {
  box-shadow: 0 16px 38px rgba(68,18,18,0.18),0 0 0 2px #fd8801aa;
  transform: translateY(-4px) scale(1.032) rotateZ(-1.2deg);
}
.checkout-product-img-vip {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 20px;
  border: 3px solid #e9c7b9;
  margin-top: 2px;
  background: #fff;
  box-shadow: 0 2px 8px #e0c2b744;
  transition: box-shadow 0.22s;
}
.checkout-product-img-vip:hover {
  box-shadow: 0 8px 18px #fd880188,0 0 0 2.5px #fd8801bb;
}

.checkout-product-content-vip {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.product-title-box-vip {
  background: rgb(68,18,18);
  color: #fff;
  font-weight: 900;
  font-size: 1.18em;
  border-radius: 12px;
  padding: 12px 24px 11px 16px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  letter-spacing: 0.7px;
  box-shadow: 0 1.5px 8px #50222218;
  min-width: 180px;
  word-break: break-word;
  will-change: box-shadow;
}
.product-title-vip {
  font-size: 1.08em;
  font-weight: 800;
}
.product-qty-vip {
  color: #ffd358;
  font-weight: 900;
  margin-left: 18px;
  font-size: 1em;
  letter-spacing: 0.7px;
  text-shadow: 0 1px 3px #39210999;
}
.product-attrs-vip {
  font-size: 1.08em;
  color: #4d2121;
  margin-top: 2px;
  font-weight: 600;
}
.product-branch-vip {
  font-size: 1em;
  color: #9b2222;
  font-weight: 700;
  margin-bottom: 2px;
}
.product-price-vip {
  color: #fd8801;
  font-size: 1.19em;
  font-weight: bold;
  margin-top: 4px;
  text-shadow: 0 1px 3px #fff7;
}
.checkout-empty-vip {
  text-align: center;
  color: #bcbcbc;
  margin-top: 60px;
  font-size: 1.25em;
  padding: 42px 0;
}

/* CỘT PHẢI */
.checkout-vip-side {
  flex: 1.2;
  min-width: 420px;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 38px;
}
.card-vip {
  background: #ffffff;
  border-radius: 32px;
  border: 2.5px solid #c9b1b1;
  box-shadow: 0 8px 26px 0 rgba(68,18,18,0.10);
  padding: 28px 28px 10px 28px;
  margin-bottom: 0;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.card-vip:not(:last-child) {
  margin-bottom: 13px;
}
.section-title-vip {
  background: rgb(68,18,18);
  color: #fff !important;
  font-weight: 900;
  font-size: 1.07em;
  letter-spacing: 1px;
  border-radius: 12px;
  display: inline-block;
  padding: 11px 26px 10px 17px;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px #44121222;
  text-transform: uppercase;
  border: none;
  position: relative;
  z-index: 1;
}

.info-fields-vip { margin-top: 0; margin-bottom: 0; }
.form-label-vip {
  display: block;
  font-weight: bold;
  color: #441212;
  font-size: 1.05em;
  margin-bottom: 4px;
  margin-top: 7px;
  letter-spacing: 0.4px;
  line-height: 1.11;
}
.info-fields-vip input,
.info-fields-vip select,
.info-fields-vip textarea {
  margin-bottom: 4px;
  padding: 9px 13px;
  font-size: 1em;
  width: 100%;
  border-radius: 10px;
  border: 2px solid #dac3c3;
  background: #fff7f2;
  color: #441212;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.info-fields-vip input:focus,
.info-fields-vip select:focus,
.info-fields-vip textarea:focus {
  border-color: rgb(68,18,18);
  outline: none;
  box-shadow: 0 2px 10px #e9c7b944;
}
.info-fields-vip textarea { min-height: 36px; }
.info-fields-vip input:last-child,
.info-fields-vip textarea:last-child,
.info-fields-vip select:last-child { margin-bottom: 0 !important; }
.info-fields-vip label + input,
.info-fields-vip label + select,
.info-fields-vip label + textarea { margin-top: 0; }
.time-row-vip { display: flex; flex-direction: column; gap: 5px !important; margin-bottom: 0; margin-top: 0; }

/* Tổng tiền & nút đặt hàng */
.checkout-total-vip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 16px;
  padding-bottom: 15px;
}
.total-label-vip {
  display: flex;
  align-items: center;
  gap: 18px;
  font-weight: 900;
  font-size: 1.23em;
  color: #fff;
}
.total-value-vip {
  color: #ffd358 !important;
  font-size: 1.6em;
  font-weight: bold;
  letter-spacing: 1.2px;
  text-shadow: 0 1px 8px #c03d24b0;
}
.btn-checkout-vip {
  background: #ffd358 !important;
  color: rgb(68,18,18) !important;
  font-weight: 900;
  font-size: 1.1em;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(68,18,18,0.13);
  margin-top: -3px;
  transition: background 0.22s, box-shadow 0.16s, transform 0.18s;
  padding: 15px 40px;
  border: none;
  cursor: pointer;
  letter-spacing: 1.2px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.btn-checkout-vip:hover, .btn-checkout-vip:focus {
  background: #fff;
  color: rgb(68,18,18);
  border: 1.5px solid #ffd358;
  transform: translateY(-3px) scale(1.07);
  box-shadow: 0 12px 30px rgba(68,18,18,0.23);
}

.btn-animate-vip .btn-glow {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  pointer-events: none;
  border-radius: 16px;
  z-index: 0;
  animation: glow 2s infinite linear;
  opacity: 0.5;
  background: none;
  filter: blur(2px);
}

/* Màu nền tổng tiền */
.checkout-total-dark {
  background: rgb(68, 18, 18) !important;
  color: #fff !important;
  border: none;
  box-shadow: 0 10px 28px rgba(68,18,18,0.19);
}
.checkout-total-dark .total-label-vip,
.checkout-total-dark .total-value-vip,
.checkout-total-dark .btn-checkout-vip { color: #180808 !important; }
.checkout-total-dark .total-label-vip {
  font-weight: 900;
  font-size: 1.38em;
  opacity: 0.93;
}
.checkout-total-dark .total-value-vip {
  color: #ffd358 !important;
  text-shadow: 0 2px 10px #c03d24b0;
}
.text-danger { color: #d00000; }

/* Responsive tối ưu */
@media (max-width: 1100px) {
  .checkout-vip-flex { flex-direction: column; gap: 30px; }
  .checkout-vip-products-inner, .checkout-vip-side { max-width: 100vw; min-width: 0; }
  .checkout-vip-side { align-items: stretch; }
}
@media (max-width: 720px) {
  .checkout-vip-products-inner { padding: 10px 5px 15px 5px; }
  .card-vip { padding: 12px 4vw 4px 4vw; }
  .checkout-label-vip, .section-title-vip { font-size: 1em; padding: 10px 9vw 8px 5vw;}
}
.checkout-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 4px solid #ffd358;
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: checkoutSpin 0.8s linear infinite;
  margin: 0 auto;
  vertical-align: middle;
}
@keyframes checkoutSpin {
  0% { transform: rotate(0);}
  100% { transform: rotate(360deg);}
}

.order-success-dialog-backdrop {
  position: fixed;
  z-index: 99999;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(44, 16, 16, 0.60);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadein 0.3s;
}
.order-success-dialog {
  background: #fff;
  border-radius: 28px;
  padding: 34px 32px 28px 32px;
  box-shadow: 0 12px 48px 0 #43121223, 0 4px 32px 0 #fd880133;
  text-align: center;
  min-width: 350px;
  max-width: 90vw;
  animation: bouncein 0.6s cubic-bezier(.38,2.2,.34,1);
}
.success-icon {
  font-size: 3.2em;
  color: #44c777;
  margin-bottom: 16px;
  filter: drop-shadow(0 2px 12px #44c77766);
}
.order-success-dialog h3 {
  color: #381818;
  font-size: 1.54em;
  font-weight: 900;
  margin-bottom: 7px;
  letter-spacing: 1.1px;
}
.order-success-sub {
  color: #654c4c;
  font-size: 1.09em;
  margin-bottom: 9px;
}
.order-success-dialog .btn {
  font-size: 1em;
  padding: 8px 24px;
  border-radius: 10px;
  margin: 0 2px;
}
@media (max-width: 600px) {
  .order-success-dialog { min-width: 95vw; padding: 18px 2vw 12px 2vw;}
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all .25s cubic-bezier(.52,1.8,.41,.96);
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

</style>
