<template>
  <div class="cart-vip-container">
    <h2 class="cart-header-tag-vip">
      🛒 Giỏ hàng của bạn
    </h2>

    <transition-group name="fade-slide" tag="div">
      <div v-if="cart.length === 0" class="cart-empty" key="empty">
        <span style="font-size: 2.3em;">📦</span><br>
        Giỏ hàng đang trống.
      </div>
      <div
        v-for="(item, index) in cart"
        :key="item.ID + '-' + index"
        class="cart-item-vip"
      >
        <img
          :src="item['ẢNH(URL)']"
          class="cart-item-img-vip"
          alt="Ảnh sản phẩm"
        />
        <div class="cart-info-vip">
          <!-- TAG TÊN SẢN PHẨM -->
          <div class="cart-product-tag-vip">
            {{ item['TÊN SẢN PHẨM'] }}
          </div>
          <!-- CÁC THUỘC TÍNH -->
          <div class="cart-attr-list-vip">
            <div v-for="attr in attrDisplay(item)" :key="attr" class="cart-attr-row">
              <span class="cart-attr-bullet">•</span> <span v-html="attr"></span>
            </div>
          </div>
          <!-- GIÁ VÀ SỐ LƯỢNG -->
          <div class="cart-row-meta">
            <span class="cart-price-vip">{{ Number(item['GIÁ']).toLocaleString() }}₱</span>
            <span class="cart-mult">× {{ item.quantity }} =</span>
            <span class="cart-price-vip cart-total">{{ (item['GIÁ'] * item.quantity).toLocaleString() }}₱</span>
          </div>
          <!-- NÚT SỐ LƯỢNG, XOÁ -->
          <div class="cart-actions-vip">
            <button class="qty-btn-vip" @click="decrease(index)" :disabled="item.quantity <= 1">
              <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" stroke="#441212" fill="none"/><rect x="6" y="10" width="10" height="2" fill="#441212"/></svg>
            </button>
            <span class="cart-qty-vip">{{ item.quantity }}</span>
            <button class="qty-btn-vip" @click="increase(index)">
              <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" stroke="#441212" fill="none"/><rect x="6" y="10" width="10" height="2" fill="#441212"/><rect x="10" y="6" width="2" height="10" fill="#441212"/></svg>
            </button>
            <button class="remove-btn-vip" @click="remove(index)" title="Xoá">
              <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" stroke="#c1121f" fill="none"/><line x1="7" y1="7" x2="15" y2="15" stroke="#c1121f" stroke-width="2"/><line x1="15" y1="7" x2="7" y2="15" stroke="#c1121f" stroke-width="2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- TỔNG CỘNG + THANH TOÁN -->
    <div v-if="cart.length > 0" class="cart-footer-vip">
      <div class="cart-total-vip">
        <span>Tổng cộng:</span>
        <b>{{ total.toLocaleString() }}₱</b>
      </div>
      <button class="checkout-btn-vip" @click="goToCheckout">
        💳 Thanh toán
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const attributeKeys = [
  'XUẤT XỨ',
  'BẢO HÀNH',
  'CHI NHÁNH',
  'TRỌNG LƯỢNG',
  'KIỂU DÁNG',
  'MÀU SẮC',
  'KÍCH THƯỚC',
  'CHẤT LIỆU',
  'THƯƠNG HIỆU'
]
const cart = ref([])
const username = ref('')
const router = useRouter()
const getCartKey = () => `cart_${username.value}`
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user || !user.username) {
    alert('Bạn cần đăng nhập để xem giỏ hàng')
    return router.push('/login')
  }
  username.value = user.username
  const stored = localStorage.getItem(getCartKey())
  if (stored) {
    const parsed = JSON.parse(stored)
    parsed.forEach(item => {
      if (!item['CHI NHÁNH']) item['CHI NHÁNH'] = 'Không rõ'
    })
    cart.value = parsed
  }
})
const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item['GIÁ'] * item.quantity, 0)
)
const decrease = (index) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity--
    updateCart()
  }
}
const increase = (index) => {
  cart.value[index].quantity++
  updateCart()
}
const remove = (index) => {
  cart.value.splice(index, 1)
  updateCart()
}
const updateCart = () => {
  localStorage.setItem(getCartKey(), JSON.stringify(cart.value))
}
const goToCheckout = () => {
  router.push('/checkout')
}
// Hiển thị thuộc tính theo hàng, mỗi hàng 1 dấu đầu dòng
const attrDisplay = (item) => {
  return attributeKeys
    .filter(key => item[key])
    .map(key => `<b>${key}:</b> ${item[key]}`)
}
</script>

<style scoped>
.cart-vip-container {
  max-width: 760px;
  margin: 50px auto 32px auto;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 10px 42px #44121220;
  padding: 38px 26px 18px 26px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
  animation: fadeInCart .7s cubic-bezier(.61,1.44,.39,1.01);
}
@keyframes fadeInCart {
  0% { opacity: 0; transform: translateY(60px) scale(.96);}
  100% { opacity: 1; transform: none;}
}
.cart-title-vip {
  font-size: 2rem;
  font-weight: 900;
  color: #441212;
  letter-spacing: .04em;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cart-empty {
  text-align: center;
  color: #b1b1b1;
  font-size: 1.2em;
  padding: 64px 0 52px 0;
  font-weight: 700;
}
.cart-item-vip {
  display: flex;
  align-items: flex-start;
  background: #fdf7f6;
  border-radius: 18px;
  box-shadow: 0 2px 12px #e9c46a12;
  margin-bottom: 22px;
  padding: 17px 19px;
  gap: 26px;
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
  animation: slideInCartItem .6s cubic-bezier(.61,1.44,.39,1.01);
}
@keyframes slideInCartItem {
  0% { opacity: 0; transform: translateX(80px) scale(.97);}
  100% { opacity: 1; transform: none;}
}
.cart-item-vip:hover {
  background: #f6efed;
  box-shadow: 0 7px 22px #44121228;
  transform: scale(1.01) translateY(-2px);
}
.cart-item-img-vip {
  width: 76px;
  height: 76px;
  border-radius: 13px;
  object-fit: cover;
  background: #fff;
  border: 2.3px solid #f6ece6;
  box-shadow: 0 2px 7px #44121217;
}
.cart-info-vip {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cart-product-tag-vip {
  display: inline-block;
  background: #441212;
  color: #fff;
  font-size: 1.15em;
  font-weight: 900;
  padding: 7px 22px 6px 22px;
  border-radius: 18px;
  margin-bottom: 7px;
  box-shadow: 0 3px 15px #44121229, 0 2px 9px #e9c46a28;
  letter-spacing: .01em;
}
.cart-attr-list-vip {
  margin-bottom: 4px;
  margin-top: 1px;
}
.cart-attr-row {
  color: #312d2d;
  font-size: 1em;
  font-weight: 500;
  margin-bottom: 0px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
}
.cart-attr-bullet {
  color: #e9c46a;
  font-size: 1.07em;
  line-height: 1.16;
  padding-right: 2px;
}
.cart-row-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 3px 0 7px 0;
  flex-wrap: wrap;
}
.cart-price-vip {
  font-size: 1.08em;
  font-weight: 900;
  color: #199945;
  margin-right: 3px;
}
.cart-total {
  color: #441212;
  font-size: 1.15em;
  margin-left: 3px;
}
.cart-mult {
  color: #bbb;
  font-weight: 700;
  font-size: 1em;
  margin: 0 2px;
}
.cart-actions-vip {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 3px;
  flex-wrap: wrap;
}
.qty-btn-vip {
  background: #fff;
  color: #441212;
  border: 1.6px solid #e9c46a;
  border-radius: 50%;
  width: 33px;
  height: 33px;
  font-size: 1.12em;
  font-weight: 900;
  transition: background 0.15s, color 0.13s, border 0.13s;
  cursor: pointer;
  margin: 0 1px;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn-vip:disabled {
  opacity: 0.33;
  cursor: not-allowed;
}
.qty-btn-vip:hover {
  background: #e9c46a;
  color: #fff;
}
.cart-qty-vip {
  font-size: 1.09em;
  font-weight: 800;
  padding: 0 10px;
  min-width: 24px;
  display: inline-block;
  text-align: center;
}
.remove-btn-vip {
  background: #fff;
  color: #c1121f;
  border: none;
  border-radius: 50%;
  width: 33px;
  height: 33px;
  font-size: 1.08em;
  margin-left: 4px;
  transition: background 0.12s, color 0.13s;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1.5px 4px #c1121f18;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn-vip:hover {
  background: #c1121f;
  color: #fff;
}
.cart-footer-vip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  margin-top: 32px;
  border-top: 1.3px solid #e9c46a44;
  padding-top: 21px;
  gap: 10px;
}
.cart-total-vip {
  font-size: 1.29em;
  font-weight: 900;
  color: #441212;
  letter-spacing: .02em;
  margin-bottom: 4px;
  text-align: right;
}
.checkout-btn-vip {
  background: linear-gradient(95deg,#199945 0%,#e9c46a 100%);
  color: #fff;
  font-weight: 900;
  font-size: 1.15em;
  border: none;
  border-radius: 16px;
  padding: 13px 44px;
  box-shadow: 0 3px 16px #e9c46a36;
  transition: background 0.13s, transform 0.15s, box-shadow 0.14s;
  cursor: pointer;
  letter-spacing: .07em;
  outline: none;
}
.checkout-btn-vip:hover {
  background: linear-gradient(90deg,#e9c46a 0%,#199945 100%);
  transform: scale(1.04) translateY(-2px);
  box-shadow: 0 7px 28px #19994517;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(.41,1.11,.46,1.13);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px) scale(.97);
}
@media (max-width: 900px) {
  .cart-vip-container { padding: 6vw 1vw 4vw 1vw; }
  .cart-item-vip { flex-direction: column; gap: 10px; padding: 12px 2vw; }
  .cart-footer-vip { align-items: flex-end; }
  .checkout-btn-vip { width: 100%; }
}
.cart-header-tag-vip {
  display: inline-block;
  background: #441212;
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  padding: 13px 42px 12px 35px;
  border-radius: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 16px #44121228, 0 2px 10px #e9c46a28;
  letter-spacing: .04em;
  text-align: left;
  line-height: 1.17;
  animation: fadeInCartHeader .7s cubic-bezier(.61,1.44,.39,1.01);
}
@keyframes fadeInCartHeader {
  0% { opacity: 0; transform: translateY(-20px) scale(.96);}
  100% { opacity: 1; transform: none;}
}

</style>
