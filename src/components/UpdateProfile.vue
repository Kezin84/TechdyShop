<template>
  <div class="container py-4">
    <h2 class="mb-4">Cập nhật thông tin cá nhân</h2>

    <form @submit.prevent="submitForm" >

     <div class="text-center mt-3">
  <label for="avatarInput" class="avatar-wrapper d-inline-block position-relative">
    <img
      :src="avatarUrl || 'https://i.ibb.co/nDypvGk/user-default.png'"
      alt="avatar"
      class="avatar-img shadow"
    />
    <div class="overlay-text"><SwitchCamera size ="30"/></div>
  </label>
  <input
    id="avatarInput"
    type="file"
    accept="image/*"
    @change="handleUpload"
    style="display: none"
  />
</div>
      <div class="mb-3">
        <label class="form-label">Họ tên</label>
        <input v-model="form.hoten" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
  <label class="form-label">Telegram</label>
  <input v-model="form.telegram" type="text" class="form-control" required />
</div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="form.email" type="email" class="form-control"  />
      </div>

      <div class="mb-3">
        <label class="form-label">Số điện thoại</label>
        <input v-model="form.sdt" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Địa chỉ</label>
        <input v-model="form.diachi" type="text" class="form-control" required />
      </div>

      <button type="submit" class="btn btn-primary">Cập nhật</button>
     
    </form>

    <div v-if="message" class="alert mt-3" :class="{
      'alert-success': isSuccess,
      'alert-danger': !isSuccess
    }">
      {{ message }}
    </div>
    <button type="button" class="btn btn-sm btn-danger ms-2" @click="logout" style="font-weight: bold;">
  Đăng xuất
</button>

  </div>
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingCart, CreditCard, Banknote, ClipboardList,Truck 
  ,QrCode ,House ,Star,PackageSearch ,ArrowRightLeft ,NotebookPen ,Bell ,ShieldUser ,Users,SwitchCamera
}from 'lucide-vue-next'
import { useUserStore } from '@/store/user'   // <--- thêm dòng này
import { useRouter } from 'vue-router'        // <--- thêm dòng này

const userStore = useUserStore()              // <--- thêm dòng này
const router = useRouter()                    // <--- thêm dòng này
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const form = ref({
  username: '',
  hoten: '',
  email: '',
  sdt: '',
  diachi: '',
  telegram: '' // ✅ thêm dòng này
})

const message = ref('')
const isSuccess = ref(false)

onMounted(async () => {
  const savedUser = JSON.parse(localStorage.getItem('user'))
  if (savedUser) {
    form.value.username = savedUser.username

    // Lấy thông tin cá nhân
    const params = new URLSearchParams({
      action: 'getCustomerInfo',
      username: form.value.username
    })

    const res = await fetch(`${SCRIPT_URL}?${params}`)
    const data = await res.json()

    if (data.success) {
      form.value.hoten = data.hoten || ''
      form.value.email = data.email || ''
      form.value.sdt = data.sdt || ''
      form.value.diachi = data.diachi || ''
      form.value.telegram = data.telegram || ''
    }

    // ✅ Lấy avatar bằng API riêng
    const avatarRes = await fetch(`${SCRIPT_URL}?action=getAvatarByUsername&username=${form.value.username}`)
    const avatarData = await avatarRes.json()
    if (avatarData.success) {
      avatarUrl.value = avatarData.avatar || ''
    }
  }
})


const submitForm = async () => {
  const sdt = String(form.value.sdt || '').trim()
  const diachi = String(form.value.diachi || '').trim()

  if (!sdt || !diachi) {
    message.value = '⚠️ Vui lòng nhập đầy đủ Số điện thoại và Địa chỉ.'
    isSuccess.value = false
    return
  }

  const body = new URLSearchParams({
    action: 'updateCustomerInfo',
    ...Object.fromEntries(
      Object.entries(form.value).map(([k, v]) => [k, String(v ?? '')])
    )
  })

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body
  })

  const data = await res.json()
  if (data.success) {
    message.value = '✅ Cập nhật thành công!'
    isSuccess.value = true
  } else {
    message.value = '❌ Có lỗi xảy ra, vui lòng thử lại.'
    isSuccess.value = false
  }
}

  const avatarUrl = ref('')

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=b202a4bdc79bf1dc72f6f6ded6b74501`, {
    method: 'POST',
    body: formData
  })
  const result = await res.json()
  if (result.success) {
    avatarUrl.value = result.data.url

    // Gửi lên Google Sheet
    const updateAvatar = new URLSearchParams({
      action: 'updateCustomerAvatar',
      username: form.value.username,
      avatar: avatarUrl.value
    })

    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: updateAvatar
    })

    message.value = '✅ Cập nhật ảnh đại diện thành công!'
    isSuccess.value = true
  } else {
    message.value = '❌ Lỗi khi upload ảnh'
    isSuccess.value = false
  }
}
const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
<style scoped>
/* Animation */
@keyframes fadein-pop {
  0% { opacity: 0; transform: scale(0.97) translateY(30px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
@keyframes slideUp {
  0% { opacity: 0; transform: translateY(20px);}
  100% { opacity: 1; transform: translateY(0);}
}

body {
  background: #f6f7f9;
}

.container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px 0 rgba(40, 60, 90, 0.12);
  max-width: 420px;
  margin-bottom:50px ;
  padding: 42px 32px 34px 32px;
  animation: fadein-pop .55s cubic-bezier(.7,0,.23,1);
}

h2 {
  font-weight: 800;
  color: #23263b;
  font-size: 1.42rem;
  letter-spacing: .01em;
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 0 1.5px 0 rgba(70,80,120,0.04);
}

.form-label {
  font-weight: 600;
  color: #344053;
  margin-bottom: 7px;
  font-size: 1rem;
  letter-spacing: 0.01em;
  display: block;
}

.form-control {
  border-radius: 11px;
  border: 1.4px solid #e2e8f0;
  background: #f8fafc;
  padding: 11px 16px;
  transition: border-color 0.18s, box-shadow 0.2s;
  font-size: 1.09rem;
  color: #23263b;
  box-shadow: 0 2px 8px 0 rgba(100,110,140,0.03);
}

.form-control:focus {
  border-color: #ff4747;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 2.2px #f0ecff, 0 2px 12px 0 rgba(108,71,255,.09);
}

/* AVATAR */
.avatar-wrapper {
  width: 118px;
  height: 118px;
  cursor: pointer;
  margin: 0 auto 18px auto;
  border-radius: 50%;

  
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: transparent;
  transition: box-shadow .18s, border-color .17s, transform .18s;
  z-index: 2;
}
.avatar-img {
  width: 102px;
  height: 102px;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: opacity 0.17s;
  box-shadow: 0 1px 7px 0 rgba(120,130,170,0.06);
}
.avatar-wrapper:hover {
  border-color: transparent;
  box-shadow: 0 7px 32px 0 rgba(108,71,255,0.10),0 1.5px 12px rgba(30,41,59,0.11);
  transform: translateY(-2px) scale(1.04);
}
.avatar-wrapper:hover .avatar-img {
  opacity: 0.85;
}
.overlay-text {
  position: absolute;
  bottom: 8px;
  right: 7px;
  background: rgb(68, 18, 18);
  color: #fff;
  font-size: 13px;
  border-radius: 17px;
  padding: 4px 8.5px 4px 8.5px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(108,71,255,0.11);
  border: 1.5px solid #fff;
  z-index: 2;
  transition: background .15s;
}
.avatar-wrapper:hover .overlay-text {
  background: #5232c7;
}

/* FORM SPACING */
form .mb-3 {
  margin-bottom: 23px;
}
form {
  margin-bottom: 10px;
  animation: fadein-pop .67s cubic-bezier(.75,0,.19,1);
}
.text-center {
  margin-bottom: 10px;
}

/* BUTTONS */
.btn-primary {
  background:rgb(68, 18, 18);
  color: #fff;
  border: none;
  font-weight: 700;
  border-radius: 9px;
  padding: 12px 0;
  width: 100%;
  transition: background .18s, box-shadow .14s, transform .11s;
  font-size: 1.09rem;
  letter-spacing: .01em;
  box-shadow: 0 2.5px 10px rgba(120,100,255,0.07);
  margin-bottom: 8px;
  margin-top: 5px;
  cursor: pointer;
  animation: fadein-pop .7s cubic-bezier(.71,0,.27,1);
}
.btn-primary:active {
  transform: scale(0.97);
}
.btn-primary:hover {
  
  box-shadow: 0 5px 24px rgba(120,100,255,0.14);
transform: scale(1.03);
}

.btn-danger, .btn.btn-danger {
  background: #fcf5f8;
  color: #e23d2a;
  border: 1.1px solid #f4dada;
  border-radius: 9px;
  font-weight: 700;
  width: 100%;
  padding: 11px 0;
  font-size: 1.06rem;
  margin-top: 5px;
  box-shadow: 0 1px 8px rgba(230,55,55,0.05);
  transition: background .17s, color .13s, border-color .14s, transform .11s;
  cursor: pointer;
  animation: fadein-pop .75s cubic-bezier(.71,0,.27,1);
}
.btn-danger:hover {
  background: #ffeaea;
  color: #c91f1f;
  border-color: #fdc8c8;
  transform: scale(1.03);
}
.btn:active { transform: scale(.98); }

/* ALERT MESSAGE */
.alert {
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  padding: 12px 19px;
  margin: 0 auto 0 auto;
  max-width: 330px;
  text-align: center;
  margin-bottom: 8px;
  margin-top: 22px;
  animation: slideUp .53s cubic-bezier(.76,0,.2,1);
}
.alert-success {
  background-color: #eefcf3;
  border: 1px solid #bbf7d0;
  color: #12883b;
}
.alert-danger {
  background-color: #fff4f4;
  border: 1px solid #fecaca;
  color: #e23d2a;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .container {
    max-width: 99vw;
    padding: 18px 3vw 17px 3vw;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
  h2 { font-size: 1.05rem; }
  .avatar-wrapper { width: 78px; height: 78px; }
  .avatar-img { width: 64px; height: 64px; }
}
</style>
