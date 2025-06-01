<template>
  <div class="container py-5 d-flex justify-content-center">
    <div class="login-card shadow rounded-4 p-4 bg-white" style="max-width: 600px; width: 100%;">
      <h3 class="mb-4 fw-bold text-center " style="color:white;font-size: 30px;font-weight: bold;">
        ĐĂNG NHẬP <i class="fa-solid fa-user fa-lg" style="color: #ffffff;"></i>
      </h3>
      <form @submit.prevent="handleLogin" class="row g-3">
        <div class="col-md-12">
          <label class="form-label fw-semibold">TÊN ĐĂNG NHẬP</label>
          <input v-model="username" required class="form-control form-control-lg" placeholder="Nhập tên đăng nhập" />
        </div>
        <div class="col-md-12">
          <label class="form-label fw-semibold">MẬT KHẨU</label>
          <input v-model="password" required type="password" class="form-control form-control-lg" placeholder="••••••••" />
        </div>
        <div class="col-12 d-flex flex-column flex-md-row align-items-center justify-content-between mt-3 gap-3">
          <button class="btn btn-primary px-4 w-100 w-md-auto" :disabled="loadingLogin">
            <span v-if="loadingLogin" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="fa-solid me-2"></i>
            <span style="font-weight: bold;">{{ loadingLogin ? 'LOADING...' : 'ĐĂNG NHẬP' }}</span>
          </button>
          <RouterLink to="/register" class="btn btn-outline-secondary w-100 w-md-auto">
            ĐĂNG KÝ
          </RouterLink>
          <button type="button" class="btn btn-light border w-100 w-md-auto"
            :disabled="loadingGuest"
            @click="loginAsGuest">
            <span v-if="loadingGuest" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="fa-solid fa-circle-right fa-lg"></i>
            <span style="font-weight: bold;">{{ loadingGuest ? 'LOADING...' : 'VÀO LUÔN KHỎI ĐĂNG KÝ' }}</span>
          </button>
        </div>
      </form>
    </div>
    <!-- Dialogs -->
    <SuccessDialog ref="successDialog" message="Đăng nhập thành công!" @ok="handleRedirectAfterLogin" />
    <ErrorDialog ref="errorDialog" :message="errorMessage" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import SuccessDialog from '@/components/SuccessDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'

const loadingLogin = ref(false)
const loadingGuest = ref(false)

const username = ref('')
const password = ref('')
const router = useRouter()
const userStore = useUserStore()

const successDialog = ref()
const errorDialog = ref()
const errorMessage = ref("")
let loginRole = null

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const handleLogin = async () => {
  loadingLogin.value = true
  try {
    const res = await axios.get(`${SCRIPT_URL}?action=getUsers2`)
    const users = res.data

    const user = users.find(u =>
      u['tên đăng nhập']?.toString().trim() === username.value.trim() &&
      u['password']?.toString().trim() === password.value.trim()
    )

    if (user) {
      const loginData = {
        username: user['tên đăng nhập'],
        role: user['vai trò']
      }
      localStorage.setItem('user', JSON.stringify(loginData))
      userStore.setUser(loginData)
      loginRole = loginData.role // lưu role lại để dùng khi bấm OK

      successDialog.value.open()
    } else {
      errorMessage.value = '❌ Sai tên đăng nhập hoặc mật khẩu!'
      errorDialog.value.open()
    }
  } catch (err) {
    errorMessage.value = 'Lỗi khi kết nối tới server.'
    errorDialog.value.open()
  }
  loadingLogin.value = false
}

// Bấm OK trên dialog thành công mới chuyển trang
function handleRedirectAfterLogin() {
  if (loginRole === 'admin') {
    router.push('/manage-orders')
  } else {
    router.push('/category/TẤT%20CẢ')
  }
}

const loginAsGuest = async () => {
  loadingGuest.value = true
  const guestUsername = randomGuestUsername()
  const guestPassword = randomGuestPassword()

  try {
    const formData = new FormData()
    formData.append('action', 'registerUser')
    formData.append('username', guestUsername)
    formData.append('password', guestPassword)

    const res = await axios.post(SCRIPT_URL, formData)
    if (typeof res.data === 'string' && res.data.includes('already exists')) {
      loadingGuest.value = false
      return loginAsGuest()
    }

    const guestData = {
      username: guestUsername,
      password: guestPassword,
      role: 'client'
    }
    localStorage.setItem('user', JSON.stringify(guestData))
    userStore.setUser(guestData)

    loginRole = 'client'
    successDialog.value.open()
  } catch (err) {
    errorMessage.value = '❌ Lỗi khi tạo tài khoản khách, thử lại.'
    errorDialog.value.open()
  }
  loadingGuest.value = false
}

function randomGuestUsername() {
  return 'guest_' + Math.random().toString(36).slice(2, 10)
}
function randomGuestPassword() {
  return Math.random().toString(36).slice(2, 10)
}

</script>

<style scoped>
.login-card {
  background: linear-gradient(135deg, rgb(68, 18, 18) 80%, #833c3c 100%);
  border-radius: 24px;
  padding: 36px 32px 32px 32px;
  box-shadow: 0 10px 36px 0 rgba(68, 18, 18, 0.18), 0 2px 6px 0 rgba(253,29,29,0.09);
  transition: box-shadow 0.3s, transform 0.3s;
  animation: fadeInLoginCard 0.6s cubic-bezier(.64,-0.14,.56,1.19);
  color: #fff;
  position: relative;
  overflow: hidden;
}

@keyframes fadeInLoginCard {
  from { opacity: 0; transform: translateY(40px) scale(0.98);}
  to   { opacity: 1; transform: translateY(0) scale(1);}
}

.login-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(circle at 80% 0%, #ffe48b66 0%, transparent 60%);
  opacity: 0.4;
  pointer-events: none;
}

h3 {
  color: #ffd16d;
  font-weight: bold;
  text-shadow: 0 2px 10px #31121270, 0 0px 3px #ffd16d44;
  letter-spacing: 0.5px;
  margin-bottom: 32px;
  animation: fadeInLoginCard 0.8s cubic-bezier(.64,-0.14,.56,1.19);
}

.form-label {
  font-weight: 600;
  color: #ffd16d;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}

.form-control {
  border-radius: 10px;
  border: 1.5px solid #a97e60;
  padding: 10px 14px;
  font-size: 16px;
  background: rgba(255,255,255,0.87);
  color: #38100c;
  box-shadow: 0 2px 12px 0 #ffe48b08;
  transition: border-color 0.18s, box-shadow 0.18s;
  margin-bottom: 8px;
}

.form-control:focus {
  border-color: #ffd16d;
  box-shadow: 0 0 0 2px #ffd16d33, 0 2px 10px #ffe48b19;
  background: #fff;
  color: #38100c;
}

/* Nút Đăng nhập */
.btn-primary {
  background: linear-gradient(90deg, #ffd16d 0%, #fd8d29 100%);
  border: none;
  color: rgb(68, 18, 18);
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0 2px 18px 0 #ffd16d33;
  transition: box-shadow 0.25s, transform 0.17s, background 0.18s;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(90deg, #fd8d29 0%, #ffd16d 100%);
  color: #311212;
  box-shadow: 0 0 20px #ffd16d80, 0 6px 28px #ffd16d44;
  transform: scale(1.03);
}

.btn-light {
  background-color: #fff8f0;
  color: rgb(68, 18, 18);
  border: 1.5px solid #ffd16d;
  border-radius: 12px;
  transition: background 0.16s, color 0.16s, box-shadow 0.16s;
  font-weight: 600;
}

.btn-light:hover {
  background: #ffd16d;
  color: #311212;
  box-shadow: 0 2px 16px #ffd16d33;
}

/* Nút Đăng ký */
.btn-outline-secondary {
  border-radius: 12px;
  font-weight: bold;
  color: #ffd16d;
  border: 1.5px solid #ffd16d;
  background: transparent;
  transition: background 0.18s, color 0.18s, box-shadow 0.2s;
}

.btn-outline-secondary:hover {
  background: #ffd16d;
  color: #311212;
  box-shadow: 0 2px 12px #ffd16d19;
}

.spinner-border {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border: 0.16em solid #ffd16d;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .6s linear infinite;
  vertical-align: text-bottom;
  margin-right: 4px;
}
@keyframes spinner-border {
  100% { transform: rotate(360deg); }
}

.row.g-3 > * {
  animation: fadeInLoginCard 0.85s cubic-bezier(.64,-0.14,.56,1.19);
}

.login-card button:active {
  transform: scale(0.98);
}

@media (max-width: 600px) {
  .login-card {
    padding: 18px 4vw 18px 4vw;
    border-radius: 12px;
  }
  h3 { font-size: 1.3rem;}
}


</style>
