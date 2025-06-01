<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-4">🛠 Quản lý sản phẩm</h3>

    <!-- FORM SỬA SẢN PHẨM (MODAL) -->
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.6);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">✏️ Chỉnh sửa sản phẩm</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Tên sản phẩm</label>
                  <input v-model="form['TÊN SẢN PHẨM']" class="form-control" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Giá gốc</label>
                  <input v-model.number="form['GIÁ GỐC']" type="number" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Giá bán</label>
                  <input v-model.number="form['GIÁ']" type="number" class="form-control" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Tồn kho</label>
                  <input v-model.number="form['SỐ LƯỢNG']" type="number" class="form-control" required />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Đơn vị tính</label>
                  <input v-model="form['ĐƠN VỊ TÍNH']" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mô tả</label>
                  <input v-model="form['MÔ TẢ']" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Link ảnh</label>
                  <input v-model="form['ẢNH(URL)']" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Danh mục</label>
                  <input v-model="form['DANH MỤC']" class="form-control" />
                </div>
                <div class="col-md-3" v-for="label in ['NHÃN','KHUYẾN MÃI','LƯỢT MUA','ĐÁNH GIÁ','TÌNH TRẠNG','ẢNH PHỤ 1','ẢNH PHỤ 2','ẢNH PHỤ 3','ẢNH PHỤ 4','TRỌNG LƯỢNG','KIỂU DÁNG','MÀU SẮC','KÍCH THƯỚC','CHẤT LIỆU','THƯƠNG HIỆU','XUẤT XỨ','BẢO HÀNH','CHI NHÁNH','THÔNG TIN KHUYẾN MÃI']" :key="label">
                  <label class="form-label">{{ label }}</label>
                  <input v-model="form[label]" class="form-control" />
                </div>
              </div>
              <div class="mt-3 d-flex gap-2">
                <button type="submit" class="btn btn-primary">💾 Lưu</button>
                <button type="button" class="btn btn-danger" @click="deleteFromModal">🗑 Xoá</button>
                <button type="button" class="btn btn-secondary" @click="closeModal">Đóng</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM -->
    <div class="card shadow-sm mb-4">
      <div class="card-header fw-bold text-primary">
        {{ isEditing ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới' }}
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tên sản phẩm</label>
              <input v-model="form['TÊN SẢN PHẨM']" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Giá gốc</label>
              <input v-model.number="form['GIÁ GỐC']" type="number" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Giá bán</label>
              <input v-model.number="form['GIÁ']" type="number" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Tồn kho</label>
              <input v-model.number="form['SỐ LƯỢNG']" type="number" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Đơn vị tính</label>
              <input v-model="form['ĐƠN VỊ TÍNH']" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Mô tả</label>
              <input v-model="form['MÔ TẢ']" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Link ảnh</label>
              <input v-model="form['ẢNH(URL)']" class="form-control" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Danh mục</label>
              <input v-model="form['DANH MỤC']" class="form-control" />
            </div>

            <!-- BỔ SUNG CÁC CỘT MỚI -->
            <div
      class="col-md-3"
      v-for="label in [
        'NHÃN','KHUYẾN MÃI','LƯỢT MUA','ĐÁNH GIÁ','TÌNH TRẠNG',
        'ẢNH PHỤ 1','ẢNH PHỤ 2','ẢNH PHỤ 3','ẢNH PHỤ 4',
        'TRỌNG LƯỢNG','KIỂU DÁNG','MÀU SẮC','KÍCH THƯỚC',
        'CHẤT LIỆU','THƯƠNG HIỆU','XUẤT XỨ','BẢO HÀNH' ,'CHI NHÁNH', 'THÔNG TIN KHUYẾN MÃI'
      ]"
      :key="label"
    >
              <label class="form-label">{{ label }}</label>
              <input v-model="form[label]" class="form-control" />
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button type="submit" class="btn btn-primary fw-bold">
              {{ isEditing ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm' }}
            </button>
<div class="mt-3">
  <label class="form-label fw-bold">📥 Import file Excel</label>
  <div class="d-flex gap-2">
    <input type="file" class="form-control" accept=".xlsx" @change="onFileChange" />
    <button class="btn btn-success fw-bold" @click="importToSheet">➕ Import vào Google Sheet</button>
  </div>
</div>


            <button v-if="isEditing" type="button" @click="resetForm" class="btn btn-secondary">
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SEARCH + FILTER -->
    <div class="d-flex gap-3 mb-3 align-items-center">
      <input v-model="searchQuery" class="form-control w-50" placeholder="🔍 Tìm theo tên hoặc ID..." />
      <select v-model="sortOption" class="form-select w-auto">
        <option value="">SẮP XẾP : TẤT CẢ</option>
        <option v-for="cat in categories" :key="cat" :value="cat">📁 {{ cat }}</option>
        <option value="hethang">❌ Hết hàng</option>
      </select>
    </div>
    <!-- BẢNG DANH SÁCH NGẮN GỌN -->
    <table v-if="filteredProducts.length" class="table table-bordered table-hover text-nowrap">
  <thead class="table-light">
    <tr>
      <th>ID</th>
      <th>Tên</th>
      <th>Giá</th>
      <th>Giá gốc</th>
      <th>Tồn</th>
      <th>Đơn vị</th>
      <th>Danh mục</th>
      <th>Khuyến mãi</th>
      <th>Đánh giá</th>
      <th>Lượt mua</th>
      <th>Trạng thái</th>
      <th>Ảnh</th>
      <th v-for="i in 4" :key="'img' + i">Ảnh phụ {{ i }}</th>
      <th v-for="label in ['Trọng lượng','Kiểu dáng','Màu sắc','Kích thước','Chất liệu','Thương hiệu','Xuất xứ','Bảo hành']" :key="label">{{ label }}</th>
      <th>Chi nhánh</th>
<th>Thông tin khuyến mãi</th>

    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in filteredProducts" :key="index" @click="edit(item)" style="cursor:pointer">
      <td>{{ item.ID }}</td>
      <td>{{ item['TÊN SẢN PHẨM'] }}</td>
      <td>{{ item['GIÁ'] }}</td>
      <td>{{ item['GIÁ GỐC'] }}</td>
      <td>{{ item['SỐ LƯỢNG'] }}</td>
      <td>{{ item['ĐƠN VỊ TÍNH'] }}</td>
      <td>{{ item['DANH MỤC'] }}</td>
      <td>{{ item['KHUYẾN MÃI'] }}</td>
      <td>{{ item['ĐÁNH GIÁ'] }}</td>
      <td>{{ item['LƯỢT MUA'] }}</td>
      <td>{{ item['TÌNH TRẠNG'] }}</td>
      <td><img :src="item['ẢNH(URL)']" width="40" height="40" style="object-fit: cover; border-radius: 5px" /></td>
      <td v-for="i in 4" :key="'imgval' + i">
        <img :src="item['ẢNH PHỤ ' + i]" width="40" height="40" style="object-fit: cover; border-radius: 5px" />
      </td>
      <td>{{ item['TRỌNG LƯỢNG'] }}</td>
      <td>{{ item['KIỂU DÁNG'] }}</td>
      <td>{{ item['MÀU SẮC'] }}</td>
      <td>{{ item['KÍCH THƯỚC'] }}</td>
      <td>{{ item['CHẤT LIỆU'] }}</td>
      <td>{{ item['THƯƠNG HIỆU'] }}</td>
      <td>{{ item['XUẤT XỨ'] }}</td>
      <td>{{ item['BẢO HÀNH'] }}</td>
      <td>{{ item['CHI NHÁNH'] }}</td>
<td>{{ item['THÔNG TIN KHUYẾN MÃI'] }}</td>

    </tr>
  </tbody>
</table>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const showModal = ref(false)
const products = ref([])
const categories = ref([])
const searchQuery = ref('')
const sortOption = ref('')
const isEditing = ref(false)

const form = ref({
  ID: '',
  'TÊN SẢN PHẨM': '',
  'GIÁ': '',
  'GIÁ GỐC': '',
  'MÔ TẢ': '',
  'ẢNH(URL)': '',
  'DANH MỤC': '',
  'SỐ LƯỢNG': 0,
  'ĐƠN VỊ TÍNH': '',
  'NHÃN': '',
  'KHUYẾN MÃI': 0,
  'LƯỢT MUA': 0,
  'ĐÁNH GIÁ': 0,
  'TÌNH TRẠNG': '',
  'ẢNH PHỤ 1': '',
  'ẢNH PHỤ 2': '',
  'ẢNH PHỤ 3': '',
  'ẢNH PHỤ 4': '',
  'TRỌNG LƯỢNG': '',
'KIỂU DÁNG': '',
'MÀU SẮC': '',
'KÍCH THƯỚC': '',
'CHẤT LIỆU': '',
'THƯƠNG HIỆU': '',
'XUẤT XỨ': '',
'BẢO HÀNH': ''


})

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const fetchData = async () => {
  const res = await axios.get(`${SCRIPT_URL}?action=getProducts`)
  products.value = res.data
  const danhMucSet = new Set()
  res.data.forEach(p => {
    if (p['DANH MỤC']) danhMucSet.add(p['DANH MỤC'])
  })
  categories.value = Array.from(danhMucSet)
}

const handleSubmit = async () => {
  const action = isEditing.value ? 'updateProduct' : 'addProduct'
  const payload = new FormData()
  if (isEditing.value) payload.append('id', form.value.ID)
  payload.append('action', action)
  Object.entries(form.value).forEach(([k, v]) => payload.append(k, v))
  await axios.post(SCRIPT_URL, payload)
  await fetchData()
  closeModal()
}

const deleteFromModal = async () => {
  if (!form.value.ID) return
  if (confirm('Bạn có chắc muốn xoá sản phẩm này?')) {
    const payload = new FormData()
    payload.append('action', 'deleteProduct')
    payload.append('id', form.value.ID)
    await axios.post(SCRIPT_URL, payload)
    await fetchData()
    closeModal()
  }
}

const closeModal = () => {
  resetForm()
  showModal.value = false
}

const resetForm = () => {
  for (const key in form.value) {
    form.value[key] = typeof form.value[key] === 'number' ? 0 : ''
  }
  isEditing.value = false
}

const edit = (item) => {
  form.value = { ...item }
  isEditing.value = true
  showModal.value = true
}

const filteredProducts = computed(() => {
  let list = [...products.value]
  const q = searchQuery.value.toLowerCase()
  if (q) {
    list = list.filter(p =>
      p['TÊN SẢN PHẨM'].toLowerCase().includes(q) || p.ID.toLowerCase().includes(q)
    )
  }
  if (sortOption.value === 'hethang') {
    list = list.filter(p => Number(p['SỐ LƯỢNG']) === 0)
  } else if (sortOption.value && categories.value.includes(sortOption.value)) {
    list = list.filter(p => p['DANH MỤC'] === sortOption.value)
  }
  return list
})


import * as XLSX from 'xlsx'


const selectedFile = ref(null)

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

// FE - Import theo đúng cột trong sheet SANPHAM (theo vị trí)
const importToSheet = async () => {
  if (!selectedFile.value) {
    alert("❌ Bạn chưa chọn file Excel");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = evt.target.result;
    const workbook = XLSX.read(data, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const trimmed = raw.slice(2); // bỏ 2 dòng đầu
    if (!trimmed.length || !trimmed[0]) return alert("❌ File không có dữ liệu!");

    const rotated = trimmed[0].map((_, colIndex) =>
      trimmed.map((row) => row[colIndex])
    );
    const keys = rotated[0];

    const columnMap = {
      "TÊN SẢN PHẨM": "TÊN SẢN PHẨM",
      "GIÁ BÁN": "GIÁ",
      "MÔ TẢ": "MÔ TẢ",
      "ẢNH ( URL)": "ẢNH(URL)",
      "DANH MỤC": "DANH MỤC",
      "SỐ LƯỢNG": "SỐ LƯỢNG",
      "GIÁ GỐC": "GIÁ GỐC",
      "ĐƠN VỊ TÍNH": "ĐƠN VỊ TÍNH",
      "NHÃN": "NHÃN",
      "KHUYẾN MÃI": "KHUYẾN MÃI",
      "LƯỢT MUA": "LƯỢT MUA",
      "ĐÁNH GIÁ SAO": "ĐÁNH GIÁ",
      "TÌNH TRẠNG": "TÌNH TRẠNG",
      "ẢNH PHỤ 1": "ẢNH PHỤ 1",
      "ẢNH PHỤ 2": "ẢNH PHỤ 2",
      "ẢNH PHỤ 3": "ẢNH PHỤ 3",
      "ẢNH PHỤ 4": "ẢNH PHỤ 4",
      "TRỌNG LƯỢNG": "TRỌNG LƯỢNG",
      "KIỂU DÁNG": "KIỂU DÁNG",
      "MÀU SẮC": "MÀU SẮC",
      "KÍCH THƯỚC": "KÍCH THƯỚC",
      "CHẤT LIỆU": "CHẤT LIỆU",
      "THƯƠNG HIỆU": "THƯƠNG HIỆU",
      "XUẤT XỨ": "XUẤT XỨ",
      "BẢO HÀNH": "BẢO HÀNH",
      "CHI NHÁNH": "CHI NHÁNH",
      "THÔNG TIN KHUYẾN MÃI": "THÔNG TIN KHUYẾN MÃI",
    };

    const result = rotated.slice(1).map((row) => {
      const item = {};
      keys.forEach((key, i) => {
        const mappedKey = columnMap[key?.trim()];
        if (mappedKey) item[mappedKey] = row[i];
      });
      return item;
    });

    await fetch(`${SCRIPT_URL}?action=importSanPhamTuExcel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
      mode: "no-cors",
    });

    alert(`✅ Đã import ${result.length} sản phẩm`);
    fetchData();
  };

  reader.readAsBinaryString(selectedFile.value);
};


onMounted(fetchData)
</script>

<style scoped>
img {
  border-radius: 5px;
}
.modal.fade.show {
  display: block;
  z-index: 1050;
}
.table {
  font-size: 14px;
}
th, td {
  white-space: nowrap;
}
</style>
