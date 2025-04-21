<template>
    <div class="container py-4">
      <h3 class="fw-bold mb-3">
        📊 Doanh thu, tổng đơn
      </h3>
  
      <!-- Loading trạng thái -->
      <div v-if="loading" class="mb-3 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải dữ liệu...</span>
        </div>
      </div>
  
      <!-- Tabs -->
      <div class="btn-group mb-4">
        <button
          class="btn btn-outline-primary"
          :class="{ active: selected === 'day' }"
          @click="selected = 'day'"
        >
          Theo ngày
        </button>
        <button
          class="btn btn-outline-primary"
          :class="{ active: selected === 'month' }"
          @click="selected = 'month'"
        >
          Theo tháng
        </button>
        <button
          class="btn btn-outline-primary"
          :class="{ active: selected === 'year' }"
          @click="selected = 'year'"
        >
          Theo năm
        </button>
      </div>
  
      <!-- Chọn tháng hoặc năm -->
      <div v-if="selected === 'month'" class="mb-3">
        <label class="form-label">Chọn tháng</label>
        <input type="month" v-model="selectedMonth" class="form-control" />
      </div>
      <div v-if="selected === 'year'" class="mb-3">
        <label class="form-label">Chọn năm</label>
        <input type="number" v-model="selectedYear" class="form-control" min="2000" max="2100" />
      </div>
  
      <!-- Dữ liệu -->
      <div class="row g-3" v-if="!loading">
        <div class="col-md-6">
          <div class="card p-3">
            <h5>📦 TỔNG ĐƠN HÀNG</h5>
            <p class="fs-4">{{ stats.totalOrders }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>💰 DOANH THU</h5>
            <p class="fs-4 text-success">{{ formatCurrency(stats.totalRevenue) }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>🛒 SẢN PHẨM ĐÃ BÁN</h5>
            <p class="fs-4">{{ stats.totalItems }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>✅ĐƠN HOÀN THÀNH</h5>
            <p class="fs-4">{{ stats.completed }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>❌ĐƠN BỊ HỦY</h5>
            <p class="fs-4">{{ stats.cancelled }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watchEffect } from 'vue'
  import axios from 'axios'
  
  const selected = ref('day')
  const selectedMonth = ref('')
  const selectedYear = ref(new Date().getFullYear())
  const loading = ref(false)
  
  const stats = ref({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    completed: 0,
    cancelled: 0
  })
  
  const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'
  
  const fetchStats = async () => {
    loading.value = true
    try {
      const params = {
        action: 'getStats',
        type: selected.value
      }
  
      if (selected.value === 'month') {
        params.month = selectedMonth.value
      }
      if (selected.value === 'year') {
        params.year = selectedYear.value
      }
  
      const res = await axios.get(SCRIPT_URL, { params })
      stats.value = res.data
    } catch (err) {
      console.error('Lỗi thống kê:', err)
    } finally {
      loading.value = false
    }
  }
  
  watchEffect(fetchStats)
  
  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '0₱'
    return Number(val).toLocaleString() + '₱'
  }
  </script>
  
  <style scoped>
  .btn-group .btn.active {
    background-color: #0d6efd;
    color: white;
  }
  </style>
  