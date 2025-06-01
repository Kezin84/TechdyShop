<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-3">📊 Thống kê doanh thu và đơn hàng</h3>

    <div class="btn-group mb-4">
      <button class="btn btn-outline-primary" :class="{ active: selected === 'day' }" @click="selected = 'day'">Theo ngày</button>
      <button class="btn btn-outline-primary" :class="{ active: selected === 'week' }" @click="selected = 'week'">Theo tuần</button>
      <button class="btn btn-outline-primary" :class="{ active: selected === 'month' }" @click="selected = 'month'">Theo tháng</button>
      <button class="btn btn-outline-primary" :class="{ active: selected === 'year' }" @click="selected = 'year'">Theo năm</button>
    </div>

    <div v-if="selected === 'week'" class="row g-3 mb-3">
      <div class="col">
        <label class="form-label">Từ ngày</label>
        <input type="date" v-model="weekStart" class="form-control" />
      </div>
      <div class="col">
        <label class="form-label">Đến ngày</label>
        <input type="date" v-model="weekEnd" class="form-control" />
      </div>
    </div>
    <div v-if="selected === 'month'" class="mb-3">
      <label class="form-label">Chọn tháng</label>
      <input type="month" v-model="selectedMonth" class="form-control" />
    </div>
    <div v-if="selected === 'year'" class="mb-3">
      <label class="form-label">Chọn năm</label>
      <input type="number" v-model="selectedYear" class="form-control" min="2000" max="2100" />
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4" v-for="(value, label) in displayStats" :key="label">
        <div class="card p-3 shadow-sm">
          <h5>{{ label }}</h5>
          <p class="fs-4">{{ value }}</p>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <canvas id="barChart"></canvas>
      </div>
      <div class="col-md-6">
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

const selected = ref('day')
const selectedMonth = ref('')
const selectedYear = ref(new Date().getFullYear())
const weekStart = ref('')
const weekEnd = ref('')

const stats = ref({})
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const displayStats = ref({})
let barChart, pieChart

const fetchStats = async () => {
  const params = { action: 'getStats', type: selected.value }

  if (selected.value === 'month') params.month = selectedMonth.value
  if (selected.value === 'year') params.year = selectedYear.value
  if (selected.value === 'week' && weekStart.value && weekEnd.value) {
    const [ys, ms, ds] = weekStart.value.split('-')
    const [ye, me, de] = weekEnd.value.split('-')
    params.weekStart = `${ds}/${ms}/${ys}`
    params.weekEnd = `${de}/${me}/${ye}`
  }

  try {
    const res = await axios.get(SCRIPT_URL, { params })
    stats.value = res.data
    updateStatsDisplay()
    drawCharts()
  } catch (e) {
    console.error('Lỗi thống kê:', e)
  }
}

const updateStatsDisplay = () => {
  displayStats.value = {
    '📦 TỔNG ĐƠN HÀNG': stats.value.totalOrders || 0,
    '💰 DOANH THU': formatCurrency(stats.value.totalRevenue),
    '📈 LỢI NHUẬN': formatCurrency(stats.value.profit),
    '🛒 SẢN PHẨM ĐÃ BÁN': stats.value.totalItems || 0,
    '✅ ĐƠN HOÀN THÀNH': stats.value.completed || 0,
    '📦 ĐƠN ĐANG XỬ LÝ': stats.value.processing || 0,
    '❌ ĐƠN BỊ HỦY': stats.value.cancelled || 0
  }
}

const drawCharts = () => {
  const ctxBar = document.getElementById('barChart')
  const ctxPie = document.getElementById('pieChart')
  const labels = Object.keys(displayStats.value)
  const values = Object.values(displayStats.value).map(v => typeof v === 'string' ? parseFloat(v.replace(/[₱,]/g, '')) : v)

  barChart?.destroy()
  pieChart?.destroy()

  barChart = new Chart(ctxBar, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Giá trị', data: values }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })

  pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: { labels, datasets: [{ label: 'Tỷ lệ', data: values }] },
    options: { responsive: true }
  })
}

const formatCurrency = val => Number(val || 0).toLocaleString() + '₱'

watchEffect(fetchStats)
</script>

<style scoped>
.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
}
canvas {
  width: 100% !important;
  height: auto !important;
}
</style>
