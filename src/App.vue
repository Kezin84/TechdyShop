<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { KeepAlive } from 'vue'
import { ref, onMounted,onUnmounted } from 'vue'
import ProductSearch from './components/ProductSearch.vue'
import axios from 'axios'
import { useUserStore } from '@/store/user'
import ImageSlider from './components/ImageSlider.vue'
import ChatBotPopup from './components/ChatBotPopup.vue'
import Tintuc from './components/Tintuc.vue'
import { ShoppingCart, CreditCard, Banknote, ClipboardList,Truck 
  ,QrCode ,House ,Star,PackageSearch ,ArrowRightLeft ,NotebookPen ,Bell 
} from 'lucide-vue-next'
const orderCount = ref(0);
const avatarUrl = ref('')
const isLoading = ref(false)
const userStore = useUserStore()
const router = useRouter()
const categories = ref([])
const showDropdown = ref(false)
const pendingCount = ref(0)
const showNotification = ref(false)
let previousCount = 0

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'
const showScrollTop = ref(false);
const cartCount = ref(0)

function updateCartCount() {
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const username = user.username || userStore.username
  const cartKey = `cart_${username}`
  let cart = []
  try {
    cart = JSON.parse(localStorage.getItem(cartKey)) || []
  } catch { cart = [] }
  // Đếm tổng quantity, hoặc nếu chỉ cần số sản phẩm thì .length
  cartCount.value = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
}

// Khi mounted & khi chuyển trang/tác động cart (simple nhất)
onMounted(updateCartCount)
window.addEventListener('storage', updateCartCount)

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
onMounted(async () => {
  userStore.loadFromLocalStorage()
  // Lấy avatar ngay nếu đã đăng nhập
  if (userStore.isLoggedIn) {
    try {
      const resAva = await fetch(`${SCRIPT_URL}?action=getAvatarByUsername&username=${encodeURIComponent(userStore.username)}`);
      const dataAva = await resAva.json();
      avatarUrl.value = dataAva.avatar || 'https://i.ibb.co/nDypvGk/user-default.png';
    } catch {
      avatarUrl.value = 'https://i.ibb.co/nDypvGk/user-default.png';
    }
  } else {
    avatarUrl.value = 'https://i.ibb.co/nDypvGk/user-default.png';
  }

  if (userStore.role === 'client' && router.currentRoute.value.path === '/') {
    router.push('/category/TẤT%20CẢ')
    
    try {
      const check = new URLSearchParams({
        action: 'getCustomerInfo',
        username: userStore.username
      })
      const res = await fetch(`${SCRIPT_URL}?${check}`)
      const data = await res.json()
      const isMissing = !data.success || !data.diachi || !data.sdt
      if (isMissing) {
        localStorage.setItem('missingInfo', 'true')
        alert("⚠️ Bạn chưa cập nhật thông tin cá nhân. Vui lòng cập nhật ngay.")
        router.push('/profile')
        return
      } else {
        localStorage.removeItem('missingInfo')
      }
    } catch (err) {
      console.error('Lỗi kiểm tra thông tin cá nhân:', err)
    }
  }

  if (userStore.role === 'admin') {
    router.push('/manage-orders')
    checkNewOrders()
    setInterval(checkNewOrders, 10000)
  }

  try {
    const res = await axios.get(`${SCRIPT_URL}?action=getProducts`)
    const data = res.data
    const uniqueCats = [...new Set(data.map(p => p['DANH MỤC']).filter(Boolean))]
    categories.value = ['TẤT CẢ', ...uniqueCats]
  } catch (e) {
    console.error('Lỗi khi load danh mục:', e)
  }
})

router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 400) // hiệu ứng mượt
})


const checkNewOrders = async () => {
  try {
    const res = await axios.get(`${SCRIPT_URL}?action=getAllOrders`)
    const all = res.data || []
    const pending = all.filter(o => !o.status).length
    pendingCount.value = pending
    if (pending > previousCount) {
      showNotification.value = true
      setTimeout(() => showNotification.value = false, 3000)
    }
    previousCount = pending
  } catch (e) {
    console.error('Lỗi khi kiểm tra đơn mới:', e)
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const goToCategory = (cat) => {
  showDropdown.value = false
  router.push(`/category/${encodeURIComponent(cat)}`)
}

const checkLogin = (path) => {
  if (!userStore.isLoggedIn) {
    alert('⚠️ Bạn cần đăng nhập để sử dụng chức năng này.')
    router.push('/login')
  } else {
    router.push(path)
  }
}

async function updateOrderCount() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const username = user.username || userStore.username;
  if (!username) {
    orderCount.value = 0;
    return;
  }
  try {
    const res = await axios.get(`${SCRIPT_URL}?action=getOrdersByUser&user=${encodeURIComponent(username)}`);

    console.log("orders:", res.data); // 👈 XEM KẾT QUẢ TRẢ VỀ
    const allOrders = res.data || [];
    orderCount.value = allOrders.filter(o =>
      o.status !== "ĐÃ GIAO" && o.status !== "HOÀN THÀNH"
    ).length;
    console.log("orderCount:", orderCount.value);
  } catch (e) {
    orderCount.value = 0;
    console.error("Order API error:", e);
  }
}

onMounted(() => {
  updateOrderCount();
});

const notificationCount = ref(1)

async function updateNotificationCount() {
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const username = user.username || userStore.username
  if (!username) {
    notificationCount.value = 1
    return
  }
  try {
    // Tuỳ API, thay action/getNotificationsByUser cho đúng endpoint của bạn!
    const res = await axios.get(`${SCRIPT_URL}?action=getNotificationsByUser&user=${encodeURIComponent(username)}`)
    const notiList = res.data || []
    // Giả sử trường là isRead hoặc status, filter lấy chưa đọc
    notificationCount.value = notiList.filter(n => !n.isRead || n.status === "UNREAD" || n.isRead === false).length
  } catch (e) {
    notificationCount.value = 0
    console.error('Notification API error:', e)
  }
}

onMounted(() => {
  // Chỉ user thường (không admin)
  if (userStore.role !== 'admin') updateNotificationCount()
})

</script>

<template>
  
  <!-- LOADING OVERLAY -->
<div v-if="isLoading" class="loading-overlay">
  <div class="dot-loader">
    <div></div>
    <div></div>
    <div></div>
  </div>
</div>

  <div class="layout-wrapper">
    <template v-if="userStore.role === 'admin'">
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <h5 class="text-primary fw-bold mb-3">🔐 ADMIN MENU</h5>
          <RouterLink to="/manage-orders" class="btn btn-outline-success btn-sm w-100 mb-2 d-flex justify-content-between align-items-center">
  <span>Quản lý đơn hàng</span>
  <span v-if="pendingCount > 0" class="badge bg-danger">{{ pendingCount }}</span>
</RouterLink>
          <RouterLink
  to="/admin/branches"
  class="btn btn-outline-danger w-100 text-start"
>
  🏬 Quản lý chi nhánh
</RouterLink>
<RouterLink to="/exchange" class="nav-link-clean">
  💱 ĐỔI NGOẠI TỆ
</RouterLink>

          <RouterLink to="/orders" class="btn btn-outline-secondary btn-sm w-100 mb-2">Tra cứu đơn</RouterLink>
          <RouterLink to="/admin" class="btn btn-outline-dark btn-sm w-100 mb-2">Quản lý sản phẩm</RouterLink>
          <RouterLink to="/admin-users" class="btn btn-outline-dark btn-sm w-100 mb-2">👥 Quản lý người dùng</RouterLink>
          <RouterLink to="/admin-stats" class="btn btn-outline-dark btn-sm w-100 mb-4">📊 Thống kê</RouterLink>
          <RouterLink to="/admin-notifications" class="btn btn-outline-danger btn-sm w-100 mb-4">
  📣 Gửi thông báo
</RouterLink>
          <RouterLink to="/admin-invoice">🧾 Quản lý Hóa đơn</RouterLink>
          <RouterLink to="/admin-shop-status" class="btn btn-outline-dark btn-sm w-100 mb-2">📦 Tình trạng shop</RouterLink>
          <router-link to="/admin/comments" class="dropdown-item">Quản lý bình luận</router-link>



          <div>
            👑 Xin chào Admin, <strong>{{ userStore.username }}</strong>
            <button class="btn btn-sm btn-danger mt-2 w-100"  @click="logout">Đăng xuất</button>
          </div>
        </aside>
        <main class="admin-main">
          <div class="admin-content">
            <RouterView />
          </div>
        </main>
      </div>
    </template>

    <template v-else>
      <header class="site-header">
<div class="header-inner">
  <!-- LOGO + NAV nằm cùng flex-box -->
  <div class="header-left d-flex align-items-center">
    <div class="logo-box d-flex align-items-center">
      <RouterLink to="/category/TẤT%20CẢ" class="d-flex align-items-center">
        <img
          src="https://i.ibb.co/JYYcGQp/techdy-logo-web-removebg-preview.png"
          alt="Logo techdy"
          class="logo-img"
        />
      </RouterLink>
    </div>
    <nav class="main-nav d-flex align-items-center gap-3">
       <a class="nav-link-clean" href="https://foody88.my.canva.site/food-restaurant-service-website-in-orange-cream-and-white-photographic-style"><House :size="50" class="me-1"/>GIỚI THIỆU</a>
      <RouterLink to="/comments" class="nav-link-clean"><NotebookPen :size="50" class="me-1" /> REVIEW KHÁCH</RouterLink>
      
      <div class="dropdown position-relative" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
        <span class="nav-link-clean" :class="{ 'active-scale': router.currentRoute.value.path.includes('/category') }" style="cursor: pointer;" @click="goToCategory('TẤT CẢ')"><PackageSearch :size="50" class="me-1" />SẢN PHẨM</span>
        <ul v-if="showDropdown" class="dropdown-menu show custom-dropdown">
          <li v-for="cat in categories" :key="cat">
            <a class="dropdown-item" @click.prevent="goToCategory(cat)">{{ cat }}</a>
          </li> 
        </ul>
      </div>
         <RouterLink to="/notifications" class="nav-link-clean" @click.prevent="checkLogin('/notifications')" style="position:relative;">
  <Bell :size="40" class="me-1"  /> THÔNG BÁO
  <span v-if="notificationCount > 0" class="cart-badge-vip">{{ notificationCount }}</span>
</RouterLink>
      <ProductSearch />
    </nav>
  </div>

  <!-- USER-INFO PHẢI -->
  <div class="header-right d-flex align-items-center gap-2">
   
     
<RouterLink to="/exchange" class="nav-link-clean">
 ĐỔI TIỀN <ArrowRightLeft :size="40" class="me-1"/> 
</RouterLink>
<RouterLink to="/payment-info" class="nav-link-clean">
   CHUYỂN KHOẢN<QrCode  :size="40" class="me-1" />
 
</RouterLink>
<RouterLink to="/cart" class="nav-link-clean" @click.prevent="checkLogin('/cart')" style="position:relative;">
  GIỎ HÀNG<ShoppingCart :size="40" class="me-1" /> 
  <span v-if="cartCount > 0" class="cart-badge-vip">{{ cartCount }}</span>

</RouterLink>

<RouterLink to="/checkout" class="nav-link-clean" @click.prevent="checkLogin('/checkout')" style="position:relative;">
   THANH TOÁN<CreditCard :size="40" class="me-1" />
  <span v-if="cartCount > 0" class="cart-badge-vip">{{ cartCount }}</span>
</RouterLink>

 
<RouterLink to="/my-orders" class="nav-link-clean" @click.prevent="checkLogin('/my-orders')" style="position:relative;">
  ĐƠN HÀNG<Truck :size="40" class="me-1" /> 
  <span v-if="orderCount > 0" class="cart-badge-vip">{{ orderCount }}</span>
</RouterLink>


    <template v-if="!userStore.isLoggedIn">
      <RouterLink to="/login" class="nav-link-clean" style="background-color: red;color:aqua;font-size:20px;border-radius: 20px;font-style: italic;"> ĐĂNG NHẬP</RouterLink>
      <RouterLink to="/register" class="nav-link-clean" style="background-color: green;color:aqua;font-size:20px;border-radius: 20px;font-style: italic;">ĐĂNG KÝ</RouterLink>
    </template>
    <template v-else>
      <RouterLink to="/profile" class="nav-link-clean">
        <img :src="avatarUrl" alt="Avatar" class="avatar-img me-2" />
         <strong style="color:yellow">{{ userStore.username }}</strong>
      </RouterLink>
      
    </template>
  </div>
</div>
</header>


 
  
    <!--MAIN -->
      <main class="site-main full-width px-4">
        <Tintuc />
        
        <div class="main-inner">
          <KeepAlive>
          <RouterView />
          </KeepAlive>
        </div>
      </main>

<footer class="site-footer full-width bg-dark text-white pt-4 pb-5">
  <div class="footer-inner">
    <div class="row">
      <div class="col-md-6 mb-3">
        <h5 class="fw-bold text-warning">🏪 FOODY88</h5>
        <p>📞 SĐT: <a href="tel:0933511334" class="text-white">0933 511 334</a></p>
        <p>📍 Địa chỉ: 147 Hiền Vương, Phú Thạnh, Tân Phú, Hồ Chí Minh</p>
        <p>📨 Telegram: <a href="https://t.me/SieubachhoaPH8888" target="_blank" class="text-white">t.me/SieubachhoaPH8888</a></p>
        <p>💬 Zalo: <a href="https://zalo.me/0933511334" target="_blank" class="text-white">zalo.me/0933511334</a></p>
        <p>📘 Facebook: <a href="https://www.facebook.com/messages/e2ee/t/8406799092714002/" target="_blank" class="text-white">facebook.com/foody88</a></p>
      </div>
      <div class="col-md-6">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.387609092827!2d106.6248211!3d10.781595999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752c1cc7bcbb73%3A0x34dbc1177251393e!2zMTQ3IMSQLiBIaeG7gW4gVsawxqFuZywgUGjDuiBUaOG6oW5oLCBUw6JuIFBow7osIEjhu5MgQ2jDrCBNaW5o!5e0!3m2!1svi!2s!4v1747808082099!5m2!1svi!2s"
          width="100%" height="250" style="border:0; border-radius: 12px;" allowfullscreen=""
          loading="lazy" referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </div>
</footer>

    </template>
  </div>
  <ChatBotPopup  />

  <!-- Floating Chat Buttons -->
<div class="floating-icons  slidein-right />">
  <button
    v-show="showScrollTop"
    class="back-to-top-btn"
    @click="scrollToTop"
    aria-label="Lên đầu trang"
  >
   <i class="fa-regular fa-circle-up fa-xl"></i>
  </button>
   <a href="https://www.facebook.com/messages/e2ee/t/8406799092714002/" target="_blank" class="icon facebook">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/1024px-2023_Facebook_icon.svg.png" alt="Facebook" />
  </a>
  <a href="https://zalo.me/0933511334" target="_blank" class="icon zalo">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png" alt="Zalo" />
  </a>
  <a href="https://t.me/SieubachhoaPH8888" target="_blank" class="icon telegram">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png" alt="Telegram" />
  </a>
</div>


</template>

<style scoped>
.site-header {
  padding: 20px 0;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
 background: rgb(68, 18, 18);
  min-height: 70px;
  z-index: 99;
  border-bottom: 1px solid #eee;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;;
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
  gap: 12px;
  width: 100%;
  padding: 0 32px 0 24px;
  box-sizing: border-box;
  /* background: none !important; */
     position: relative;
  right: 300px; /* Hoặc số px mong muốn */
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.admin-sidebar {
  width: 240px;
  background-color: #f8f9fa;
  padding: 20px;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
  box-sizing: border-box;
}

.admin-main {
  flex: 1;
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.admin-content {
  width: 100%;
  max-width: 1440px;
  padding: 24px;
  box-sizing: border-box;
}

.full-width {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  box-sizing: border-box;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
  width: 100%;
  gap: 12px;
  padding: 0 32px 0 24px;
  box-sizing: border-box;
  background: rgb(68, 18, 18)}

/* Nhóm trái gồm logo + nav */
.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Logo */
.logo-box {
  height: 60px;
  margin-right: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.logo-img {
  height: 90px;
  width: auto;
  object-fit: contain;
  display: block;
}

/* Navigation */
.main-nav {
  display: flex;
  align-items: center;
  gap: 18px;
   flex-wrap: nowrap;
}

/* Thanh search nhỏ lại nếu bị dài */
.main-nav > *:not(.dropdown):not(.nav-link-clean) {
  max-width: 200px;
  flex-shrink: 1;
}

/* Nhóm phải user info, nút đăng nhập, v.v */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
}

/* Fix responsive đẹp */
@media (max-width: 1100px) {
  .header-inner { flex-direction: column; align-items: stretch; gap: 6px; padding: 0 6px; }
  .header-left, .header-right { justify-content: flex-start; gap: 6px; }
  .main-nav { gap: 5px; }
  .logo-box { height: 46px; }
  .logo-img { height: 36px; }
}

.footer-inner,
.main-inner {
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
  padding: 0 24px;
}

.site-main {
  flex: 1;
  background: #f5f3f3;
}

.site-footer {
  font-size: 14px;
  position: relative;
  z-index: 5;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: linear-gradient(to bottom, #e94504, #fef3f0); /* nền trắng kem pha chút cam */
  overflow-x: hidden;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  display: block;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 10px;

  z-index: 10;
}

.dropdown-item {
  padding: 5px 12px;
  cursor: pointer;
  color: black;
  font-weight: bold;
}

.dropdown-item:hover {
 background: rgb(68, 18, 18);
color: #ddd;
}

.toast-custom {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  z-index: 9999;
  animation: fadeInOut 3s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px); }
}


.nav-link-clean {

  position: relative;
  color: white !important;
  font-weight: bold;
  text-decoration: none;
  height: fit-content;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 16px;
  background: transparent; /* tránh màu nền mặc định */
   white-space: nowrap; white-space: nowrap;
}

.nav-link-clean::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ffffff;
  transition: width 0.3s ease;
}


.nav-link-clean:hover::after {
  width: 100%;
}

.nav-link-clean {
  line-height: 1.5;
}

.nav-link-clean:hover::after {
  width: 100%;
  border-radius: 2px;
}

.floating-icons {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 930;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.floating-icons .icon {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px 2px #c1d6ffbb;
  border: 2px solid #fff;
  background: transparent;
  margin-bottom: 14px;
  overflow: visible; /* ĐỂ SÓNG KHÔNG BỊ CHE */
  z-index: 2;
  transition: box-shadow 0.22s, transform 0.22s;
  animation: zoomPulse 1.4s infinite;
}

.floating-icons .icon img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 50%;
  z-index: 3;
  pointer-events: none;
  animation: zoomPulse 1.4s infinite;
}

.floating-icons .icon::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120px; height: 120px; /* TO HẲN RA */
  border-radius: 50%;
  background: rgba(0, 89, 255, 0.21); /* Đổi màu từng icon bên dưới */
  transform: translate(-50%, -50%) scale(0.5);
  z-index: 1;
  pointer-events: none;
  animation: radar 1.6s infinite cubic-bezier(.42,0,.58,1);
  opacity: 0.75;
}

.icon.facebook::before  { background: rgba(0, 89, 255, 0.23);}
.icon.zalo::before      { background: rgba(0, 153, 255, 0.18);}
.icon.telegram::before  { background: rgba(39, 166, 229, 0.15);}

/* Radar animation: */
@keyframes radar {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.75;
  }
  70% {
    opacity: 0.19;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}

/* ---- Shake animation ---- */
@keyframes shake {
  0%, 100% { transform: translateX(0) scale(1); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px) scale(1.01); }
  20%, 40%, 60%, 80% { transform: translateX(2px) scale(1.01); }
}
/* 🔁 Hiệu ứng Zoom In-Out */
@keyframes zoomPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.active-scale {
  transform: scale(1.2);
  color: #ffd700 !important;
}

/* Khi hover: scale to nhẹ */
.nav-link-clean {
  position: relative;
  color: rgb(255, 255, 255) !important;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 16px;
  background: transparent;
  transition: transform 0.3s ease, color 0.3s ease;
  transform-origin: center bottom; /* scale từ đáy lên cho đẹp */
}

.nav-link-clean::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 40%;
  height: 2px;
  background-color: #ffffff;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}


.nav-link-clean:hover {
  transform: scale(1.2);
  color: #ffd900;
}

.nav-link-clean:hover::after,
.router-link-exact-active.nav-link-clean::after {
  transform: translateX(-50%) scaleX(0.8);
  
}


/* ✅ ACTIVE: scale + giữ underline */
.active-scale,
.router-link-exact-active.nav-link-clean {
  transform: scale(1.2);
  color: #ffd700 !important;
}

.router-link-exact-active.nav-link-clean::after {
  width: 100%;
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out forwards;
  background: transparent;
  backdrop-filter: none;
  pointer-events: none;
}


/* DOT LOADER */
.dot-loader {
  display: flex;
  gap: 8px;
}

.dot-loader div {
  width: 16px;
  height: 16px;
  background-color: rgb(68, 18, 18);
  border-radius: 50%;
  animation: pulse 0.6s ease-in-out infinite;
}

.dot-loader div:nth-child(2) {
  animation-delay: 0.2s;
}
.dot-loader div:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.site-footer {
  background: linear-gradient(90deg, #1f1f1f, #2c2c2c);
  color: #f1f1f1;
  font-size: 15px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
  padding-top: 40px;
  padding-bottom: 40px;
}

.site-footer h5 {
  font-size: 20px;
  font-weight: 700;
  color: #fcb045;
  margin-bottom: 20px;
}

.site-footer p {
  margin: 0 0 10px;
  line-height: 1.6;
  color: #ccc;
}

.site-footer a {
  color: #ffcc70;
  text-decoration: none;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.site-footer a:hover {
  color: #ffffff;
  text-shadow: 0 0 8px #fcb045;
}

.site-footer iframe {
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .site-footer .row {
    flex-direction: column;
  }

  .site-footer .col-md-6 {
    width: 100%;
    margin-bottom: 24px;
  }

  .site-footer iframe {
    height: 200px;
  }
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #faf600;
  background: #eeeeee;
  margin-right: 6px;
}

.back-to-top-btn {
  position: fixed;
  right: 20px;
  bottom: 270px;   /* hoặc thử 420px, tùy số icon và kích thước */
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background:rgb(68, 18, 18);
  color: #fff;
  font-size: 26px;
  font-weight: 900;
  box-shadow: 0 0 16px #fcb04555, 0 4px 12px #ed373777;
  z-index: 931;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.24s, transform 0.24s;
  opacity: 0.94;
  cursor: pointer;
  animation: zoomPulse 1.4s infinite;
}

.back-to-top-btn:hover {
  background: linear-gradient(135deg, #fcb045 40%, #ed3737 100%);
  color: #fff700;
  opacity: 1;
  transform: scale(1.12);
}

/* Đặt ở style global hoặc cuối <style> */
.nav-link-clean:hover,
.nav-link-clean:focus,
.router-link-exact-active.nav-link-clean,
.router-link-active.nav-link-clean {
  color: #ffd700 !important;
  background: transparent !important;
  transform: scale(1.2);
  transition: color 0.22s, transform 0.22s;
}

.slidein-right {
  animation: slideinRight 0.42s cubic-bezier(.7,1.5,.3,1);
  will-change: transform, opacity;
}
@keyframes slideinRight {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  60% {
    transform: translateX(-3%);
    opacity: 1;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.cart-badge-vip {
  position: absolute;
  top: -8px;
  right: -9px;
  background: #fd3535;
  color: #fff;
  font-weight: bold;
  font-size: 1em;
  padding: 2px 9px;
  border-radius: 18px;
  box-shadow: 0 2px 12px #d630307a;
  border: 2px solid #fff;
  z-index: 3;
  min-width: 20px;
  text-align: center;
  animation: cartPop .3s;
}
@keyframes cartPop {
  0% { transform: scale(0.7);}
  70% { transform: scale(1.25);}
  100% { transform: scale(1);}
}

</style>