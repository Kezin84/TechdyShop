<template>
  <div class="container py-4">
    <h4 class="fw-bold text-primary mb-3">🏬 Quản lý chi nhánh</h4>

    <!-- DANH SÁCH CHI NHÁNH -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-light text-center">
          <tr>
            <th>MÃ CHI NHÁNH</th>
            <th>TÊN CHI NHÁNH</th>
            <th>ĐỊA CHỈ</th>
            <th>NGƯỜI QUẢN LÝ</th>
            <th>SDT</th>
            <th>EMAIL</th>
            <th>TELEGRAM</th>
            <th>ZALO</th>
            <th>FB</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(b, index) in branches" :key="index">
            <td>{{ b['MÃ CHI NHÁNH'] }}</td>
            <td>{{ b['TÊN CHI NHÁNH'] }}</td>
            <td>{{ b['ĐỊA CHỈ'] }}</td>
            <td>{{ b['NGƯỜI QUẢN LÝ'] }}</td>
            <td>{{ b['SDT'] }}</td>
            <td>{{ b['EMAIL'] }}</td>
            <td>{{ b['TELEGRAM'] }}</td>
            <td>{{ b['ZALO'] }}</td>
            <td>{{ b['FB'] }}</td>
            <td class="text-center">
              <button class="btn btn-sm btn-info me-1" @click="editBranch(b)">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="deleteBranch(b['MÃ CHI NHÁNH'])">Xoá</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FORM THÊM/SỬA -->
    <div class="card p-3 shadow-sm">
      <h5 class="text-primary fw-bold">{{ isEditing ? '✏️ Sửa chi nhánh' : '➕ Thêm chi nhánh' }}</h5>
      <div class="row g-3 mt-2">
        <div class="col-md-4">
          <input v-model="form['MÃ CHI NHÁNH']" class="form-control" placeholder="Mã chi nhánh" :disabled="isEditing" />
        </div>
        <div class="col-md-4">
          <input v-model="form['TÊN CHI NHÁNH']" class="form-control" placeholder="Tên chi nhánh" />
        </div>
        <div class="col-md-4">
          <input v-model="form['ĐỊA CHỈ']" class="form-control" placeholder="Địa chỉ" />
        </div>
        <div class="col-md-3">
          <input v-model="form['NGƯỜI QUẢN LÝ']" class="form-control" placeholder="Người quản lý" />
        </div>
        <div class="col-md-3">
          <input v-model="form['SDT']" class="form-control" placeholder="Số điện thoại" />
        </div>
        <div class="col-md-3">
          <input v-model="form['EMAIL']" class="form-control" placeholder="Email" />
        </div>
        <div class="col-md-3">
          <input v-model="form['TELEGRAM']" class="form-control" placeholder="Telegram" />
        </div>
        <div class="col-md-3">
          <input v-model="form['ZALO']" class="form-control" placeholder="Zalo" />
        </div>
        <div class="col-md-3">
          <input v-model="form['FB']" class="form-control" placeholder="Facebook" />
        </div>
        <div class="col-md-3">
          <button class="btn btn-success w-100" @click="submitForm">
            {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CHI TIẾT BÁO CÁO DOANH THU -->
    <div v-if="selectedBranch" class="mt-4">
      <h5 class="text-success fw-bold mb-3">📊 Thống kê cho chi nhánh: {{ selectedBranch['TÊN CHI NHÁNH'] }}</h5>
      <div class="row g-3">
        <div class="col-md-3">
          <div class="card p-3 text-center shadow-sm">
            <div class="fw-bold">Tổng đơn</div>
            <div class="text-danger fs-5">{{ stats.totalOrders }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center shadow-sm">
            <div class="fw-bold">Doanh thu</div>
            <div class="text-success fs-5">{{ stats.totalRevenue.toLocaleString() }}₱</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center shadow-sm">
            <div class="fw-bold">Lợi nhuận</div>
            <div class="text-primary fs-5">{{ stats.profit.toLocaleString() }}₱</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3 text-center shadow-sm">
            <div class="fw-bold">Sản phẩm đang bán</div>
            <div class="fs-5">{{ stats.products }}</div>
          </div>
        </div>
      </div>
      <!-- Bảng sản phẩm bán chạy -->
      <div v-if="stats.bestSellers?.length" class="mt-4">
        <h6 class="fw-bold text-primary mb-3">🔥 Sản phẩm bán chạy</h6>
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th>TÊN SẢN PHẨM</th>
              <th>LƯỢT MUA</th>
              <th v-for="attr in stats.attributes" :key="attr">{{ attr }}</th>
              <th>GIÁ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in stats.bestSellers" :key="idx">
              <td>{{ p['TÊN SẢN PHẨM'] }}</td>
              <td>{{ p['LƯỢT MUA'] }}</td>
              <td v-for="attr in stats.attributes" :key="attr">
                {{ p[attr] || '-' }}
              </td>
              <td>{{ p['GIÁ'].toLocaleString() }}₱</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const branches = ref([])
const form = ref({})
const isEditing = ref(false)
const selectedBranch = ref(null)
const stats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  profit: 0,
  products: 0,
  bestSellers: [],
  attributes: []
})

const SCRIPT = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const fetchBranches = async () => {
  const res = await axios.get(`${SCRIPT}?action=getAllBranches`)
  branches.value = res.data
}

const submitForm = async () => {
  const action = isEditing.value ? 'updateBranch' : 'addBranch'
  await axios.post(`${SCRIPT}?action=${action}`, new URLSearchParams(form.value))
  await fetchBranches()
  form.value = {}
  isEditing.value = false
  selectedBranch.value = null
}

const editBranch = async (b) => {
  form.value = { ...b }
  isEditing.value = true
  selectedBranch.value = b
  await fetchStats(b['MÃ CHI NHÁNH'])
}

const deleteBranch = async (maChiNhanh) => {
  if (!confirm('Xoá chi nhánh này?')) return
  await axios.post(`${SCRIPT}?action=deleteBranch`, new URLSearchParams({ 'MÃ CHI NHÁNH': maChiNhanh }))
  await fetchBranches()
  if (selectedBranch.value?.['MÃ CHI NHÁNH'] === maChiNhanh) selectedBranch.value = null
}

const fetchStats = async (branchCode) => {
  const res = await axios.get(`${SCRIPT}?action=getStats&type=branch&branch=${encodeURIComponent(branchCode)}`)
  stats.value = res.data
}

onMounted(fetchBranches)
</script>

<style scoped>
.card {
  border-radius: 16px;
  background: #fffdfa;
  border: 1px solid #eee;
}
</style>
