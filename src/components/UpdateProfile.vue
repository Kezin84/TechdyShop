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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingCart, CreditCard, Banknote, ClipboardList,Truck 
  ,QrCode ,House ,Star,PackageSearch ,ArrowRightLeft ,NotebookPen ,Bell ,ShieldUser ,Users,SwitchCamera
}from 'lucide-vue-next'
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

</script>
<style scoped>
h2 {
  font-weight: bold;
  color: #ed3737;
}

.form-label {
  font-weight: 600;
  color: #333;
}

.form-control {
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 10px 14px;
  transition: all 0.2s ease-in-out;
}

.form-control:focus {
  border-color: #fd1d1d;
  box-shadow: 0 0 6px rgba(253, 29, 29, 0.3);
}

.btn-primary {
  background: linear-gradient(
    90deg,
    rgba(237, 55, 55, 1) 0%,
    rgba(253, 29, 29, 1) 45%,
    rgba(252, 176, 69, 1) 100%
  );
  border: none;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 0 10px rgba(253, 29, 29, 0.4);
  transform: translateY(-1px);
}

.alert {
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  padding: 12px 16px;
}

.alert-success {
  background-color: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.avatar-wrapper {
  width: 160px;
  height: 160px;
  cursor: pointer;
  margin: 0 auto;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #ddd;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
}


.avatar-wrapper:hover .avatar-img {
  opacity: 0.8;
}

.overlay-text {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 12px;
}

</style>