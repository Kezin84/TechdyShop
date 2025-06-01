<template>
    <div class="container py-4">
      <h2 class="mb-4">👥 Quản lý người dùng</h2>
  
      <!-- Tìm kiếm + gợi ý -->
      <div class="input-group mb-3 position-relative w-100">
        <input
          v-model="searchInput"
          @input="filterUsers"
          type="text"
          class="form-control"
          placeholder="🔍 Nhập tên, username, sđt hoặc email để tra cứu"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
        />
        <button class="btn btn-primary" @click="filterUsers">Tra cứu</button>
        <button class="btn btn-secondary" @click="resetSearch">Hiện tất cả</button>
  
        <ul v-if="showSuggestions && suggestions.length" class="list-group position-absolute w-100 shadow" style="z-index: 99; top: 100%; left: 0">
          <li class="list-group-item list-group-item-action" v-for="s in suggestions" :key="s" @mousedown.prevent="selectSuggestion(s)">
            {{ s }}
          </li>
        </ul>
      </div>
  
      <!-- Bảng người dùng -->
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
       <tr>
    <th>USERNAME</th>
    <th>HỌ TÊN</th>
    <th>TELEGRAM</th> <!-- 👈 Thêm đúng chỗ -->
    <th>EMAIL</th>
    <th>SĐT</th>
    <th>ĐỊA CHỈ</th>
    <th>NGÀY ĐĂNG KÝ</th>
    <th>GHI CHÚ</th>
    <th>HÀNH ĐỘNG</th>
  </tr>
        </thead>
        <tbody>
          <tr v-for="kh in filteredUsers" :key="kh.username">
            <td>{{ kh.username }}</td>
             
            <td>{{ kh.hoten }}</td>
            <td>{{ kh.telegram }}</td>
            <td>{{ kh.email }}</td>
            <td>{{ kh.sdt }}</td>
            <td>{{ kh.diachi }}</td>
            <td>{{ kh.ngaydk }}</td>
            <td>{{ kh.ghichu }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-1" @click="startEdit(kh)">✏️ Sửa</button>
              <button class="btn btn-sm btn-danger" @click="deleteUser(kh.username)">🗑️ Xóa</button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="9" class="text-center text-muted">Không tìm thấy người dùng nào</td>
          </tr>
        </tbody>
      </table>
  
      <!-- Modal chỉnh sửa -->
      <div v-if="editingUser" class="modal-backdrop">
        <div class="modal-content p-4 bg-white border rounded shadow">
          <h5>✏️ Sửa thông tin: {{ editingUser.username }}</h5>
          <div class="mb-2">
            <label>Họ tên</label>
            <input class="form-control" v-model="editingUser.hoten" />
          </div>
          <div class="mb-2">
  <label>Telegram</label>
  <input class="form-control" v-model="editingUser.telegram" />
</div>

          <div class="mb-2">
            <label>Email</label>
            <input class="form-control" v-model="editingUser.email" />
          </div>
          <div class="mb-2">
            <label>SĐT</label>
            <input class="form-control" v-model="editingUser.sdt" />
          </div>
          <div class="mb-2">
            <label>Địa chỉ</label>
            <input class="form-control" v-model="editingUser.diachi" />
          </div>
          <div class="mb-2">
            <label>Ghi chú</label>
            <input class="form-control" v-model="editingUser.ghichu" />
          </div>
          <button class="btn btn-success me-2" @click="saveEdit">💾 Lưu</button>
          <button class="btn btn-secondary" @click="editingUser = null">❌ Hủy</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const users = ref([])
  const filteredUsers = ref([])
  const searchInput = ref('')
  const suggestions = ref([])
  const showSuggestions = ref(false)
  const editingUser = ref(null)
  
  const normalizeText = (str) => {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\u0300-\u036f/g, '')
  }
  
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'
  
  onMounted(async () => {
    const res = await fetch(`${SCRIPT_URL}?action=getAllCustomers`)
    users.value = await res.json()
    filteredUsers.value = users.value
  })
  
  const filterUsers = () => {
    const kw = normalizeText(searchInput.value.trim())
    if (kw === '') {
      filteredUsers.value = users.value
      suggestions.value = []
      return
    }
  
    filteredUsers.value = users.value.filter((u) =>
      normalizeText(u.username).includes(kw) ||
      normalizeText(u.hoten).includes(kw) ||
      normalizeText(u.email).includes(kw) ||
      normalizeText(u.sdt).includes(kw) ||
      normalizeText(u.diachi).includes(kw)
    )
  
    const suggestSet = new Set()
    users.value.forEach((u) => {
      suggestSet.add(u.username)
      suggestSet.add(u.hoten)
      suggestSet.add(u.email)
      suggestSet.add(u.sdt)
    })
    suggestions.value = [...suggestSet].filter((s) => normalizeText(s).includes(kw)).slice(0, 10)
    showSuggestions.value = true
  }
  
  const selectSuggestion = (text) => {
    searchInput.value = text
    filterUsers()
    showSuggestions.value = false
  }
  
  const hideSuggestions = () => {
    setTimeout(() => {
      showSuggestions.value = false
    }, 200)
  }
  
  const resetSearch = () => {
    searchInput.value = ''
    filteredUsers.value = users.value
    suggestions.value = []
  }
  
  const startEdit = (user) => {
    editingUser.value = { ...user }
  }
  
  const saveEdit = async () => {
    const body = new URLSearchParams({
      action: 'updateCustomerInfo',
      ...editingUser.value
    })
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body
    })
    alert('Đã lưu thông tin!')
    editingUser.value = null
    onMounted()
  }
  
  const deleteUser = async (username) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa user "${username}" khỏi cả 2 sheet?`)) return
  
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: new URLSearchParams({
        action: 'deleteCustomer',
        username
      })
    })
  
    const result = await res.text()
    alert(result)
    onMounted()
  }
  </script>
  
  <style>
  .table td,
  .table th {
    text-transform: none !important;
  }
  .list-group-item:hover {
    background-color: #f0f0f0;
    cursor: pointer;
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 150px;
    z-index: 1000;
  }
  .modal-content {
    width: 100%;
    max-width: 500px;
  }
  </style>
  