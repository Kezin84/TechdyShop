<template>
  <div class="register-wrapper py-5">
    <div class="register-box shadow-lg p-4 bg-white rounded-4">
      <h3 class="mb-4 text-center fw-bold" style="color:brown">📝 ĐĂNG KÝ TÀI KHOẢN MỚI</h3>
      <form @submit.prevent="handleRegister" class="row g-3">
        <!-- Tên đăng nhập -->
        <div class="col-md-12">
          <label class="form-label">Tên đăng nhập</label>
          <input v-model="username" @input="checkUsername" required class="form-control" :class="{ 'is-invalid': usernameExists }" />
          <div v-if="usernameExists" class="invalid-feedback d-block">
            ⚠️ Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.
          </div>
        </div>
        <!-- Mật khẩu -->
        <div class="col-md-12">
          <label class="form-label">Mật khẩu</label>
          <input v-model="password" required type="password" class="form-control" />
        </div>
        <!-- Nút đăng ký -->
        <div class="col-12 d-flex justify-content-between align-items-center mt-3">
          <RouterLink to="/login" class="text-decoration-none fw-bold text-secondary">🔐 Đã có tài khoản?</RouterLink>
          <button class="btn btn-danger px-4 fw-bold" :disabled="loading || usernameExists">
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </div>
      </form>
    </div>
    <!-- Popup -->
    <SuccessDialog ref="dialogRef" message="Đăng ký thành công!" @ok="router.push('/login')" />
    <ErrorDialog ref="errorDialogRef" message="Đăng ký thất bại hoặc tên đăng nhập đã tồn tại!" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import SuccessDialog from '@/components/SuccessDialog.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const usernameExists = ref(false)
const router = useRouter()
const dialogRef = ref()
const errorDialogRef = ref()

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

// Hàm checkUsername
function checkUsername() {
  if (!username.value.trim()) {
    usernameExists.value = false
    return
  }
  const form = new FormData()
  form.append('action', 'getUsers2')
  axios.post(SCRIPT_URL, form)
    .then(res => {
      const users = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      usernameExists.value = users.some(u => u.username === username.value.trim())
    })
    .catch(() => usernameExists.value = false)
}

// Watch khi username thay đổi
watch(username, checkUsername)

// Hàm đăng ký
const handleRegister = async () => {
  if (usernameExists.value) {
    errorDialogRef.value.open()
    return
  }
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('action', 'registerUser')
    formData.append('username', username.value.trim())
    formData.append('password', password.value)
    const res = await axios.post(SCRIPT_URL, formData)
    const result = res.data?.toString() || ''
    if (result.includes('already exists')) {
      errorDialogRef.value.open()
    } else {
      dialogRef.value.open()
    }
  } catch (e) {
    errorDialogRef.value.open()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s ease-in-out;
}
.register-box {
  width: 100%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(255, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.register-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(255, 0, 0, 0.15);
}
.form-label {
  font-weight: 600;
  color: #333;
}
.form-control {
  border-radius: 10px;
  border: 1px solid #ccc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 6px rgba(220, 53, 69, 0.4);
}
.btn-danger {
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  border: none;
  color: #fff;
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}
.btn-danger:hover {
  transform: scale(1.03);
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>
