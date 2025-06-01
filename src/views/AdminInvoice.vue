<template>
  <div class="container py-4">
    <h2 class="fw-bold mb-4 fs-3 text-primary border-bottom pb-2">Tạo Hóa Đơn Bán Hàng</h2>

    <div class="row">
      <!-- FORM -->
      <div class="col-lg-6">
        <form @submit.prevent="addInvoiceRow" class="bg-white p-4 border rounded shadow-sm">
          <div class="mb-3">
            <label class="form-label">Telegram</label>
            <input v-model="form.tele" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Số điện thoại</label>
            <input v-model="form.sdt" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ nhận hàng</label>
            <input v-model="form.diachi" class="form-control" required />
          </div>

          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label">Ngày nhận</label>
              <input v-model="dateOnly" type="date" class="form-control" required />
            </div>
            <div class="col">
              <label class="form-label">Giờ</label>
              <TimePicker v-model="timeOnly" format="HH:mm" is24hr hide-clear-button class="w-100" />
            </div>
            <div class="col">
              <label class="form-label">Buổi</label>
              <select v-model="period" class="form-select" required>
                <option disabled value="">Chọn</option>
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
                <option value="Tối">Tối</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Tên sản phẩm</label>
            <input v-model="form.tenSp" @input="handleProductTyping" list="product-suggestions" class="form-control" required />
         <datalist id="product-suggestions">
  <option
    v-for="item in products"
    :key="item.ID"
    :value="item['TÊN SẢN PHẨM'] + formatAttrs(item)"
  />
</datalist>



          </div>

          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label">Đơn vị tính</label>
              <input v-model="form.donViTinh" class="form-control" required />
            </div>
            <div class="col">
              Số lượng 
  <span v-if="productStock > 0" class="text-muted">(Còn lại: {{ productStock }})</span>
             <div v-if="form.productId && productStock === 0" class="text-danger fw-bold mt-1">Hết hàng</div>

              <input v-else v-model.number="form.soLuong" :max="productStock || undefined" type="number" class="form-control" required />
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label">Đơn giá</label>
              <input v-model.number="form.donGia" type="number" class="form-control" required />
            </div>
            <div class="col">
              <label class="form-label">Phí ship</label>
              <input v-model.number="form.phiShip" type="number" class="form-control" required />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 fw-bold">
            ➕ Thêm vào hóa đơn
          </button>
        </form>
      </div>

      <!-- DANH SÁCH HÓA ĐƠN -->
      <div class="col-lg-6">
        <h3 class="fw-bold mb-3 fs-5">📋 Danh sách hóa đơn</h3>
        <div class="table-responsive border rounded shadow-sm">
          <table class="table table-bordered table-striped align-middle text-center mb-0">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>ĐVT</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(inv, i) in invoices" :key="i" @click="editRow(inv, i)" style="cursor: pointer">
                <td>{{ i + 1 }}</td>
                <td class="text-start">{{ inv.tenSp }}</td>
                <td>{{ inv.donViTinh }}</td>
                <td>{{ inv.soLuong }}</td>
                <td class="text-end">{{ inv.donGia.toLocaleString('vi-VN') }}</td>
                <td class="text-end">{{ inv.thanhTien.toLocaleString('vi-VN') }}</td>
              </tr>
              <tr>
                <td colspan="5" class="text-end fw-semibold">Phí ship</td>
                <td class="text-end">
                  {{ invoices.reduce((sum, i) => sum + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
                </td>
              </tr>
              <tr class="table-success fw-bold">
                <td colspan="5" class="text-end">TỔNG CỘNG</td>
                <td class="text-end">
                  {{ invoices.reduce((sum, i) => sum + Number(i.thanhTien || 0) + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-end mt-3">
          <button @click="openInvoicePopup" class="btn btn-warning mt-2 px-4 fw-bold">
            👁 XEM TRƯỚC HÓA ĐƠN
          </button><br>
          <button @click="printMiniInvoice" class="btn btn-dark mt-2 px-4 fw-bold">
  🖨 In Hóa Đơn Mini
</button>

          <button @click="copyInvoiceImage" class="btn btn-secondary px-4 fw-bold">
  📋 Copy ảnh hóa đơn
</button><br>
          <button @click="submitAndExport" class="btn btn-success px-4 fw-bold">
            CHỐT ĐƠN & LƯU ẢNH
          </button><br>
       
        </div>
      </div>
    </div>

    <!-- MODAL SỬA -->
    <div v-if="modalShow" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sửa sản phẩm</h5>
            <button type="button" class="btn-close" @click="modalShow = false"></button>
          </div>
          <div class="modal-body">
            <input v-model="editItem.tenSp" class="form-control mb-2" placeholder="Tên sản phẩm" />
            <input v-model="editItem.donViTinh" class="form-control mb-2" placeholder="Đơn vị tính" />
            <input v-model.number="editItem.soLuong" class="form-control mb-2" placeholder="Số lượng" />
            <input v-model.number="editItem.donGia" class="form-control mb-2" placeholder="Đơn giá" />
            <input v-model.number="editItem.phiShip" class="form-control mb-2" placeholder="Phí ship" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger" @click="deleteItem">Xoá</button>
            <button class="btn btn-primary" @click="updateItem">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- HÓA ĐƠN XEM TRƯỚC (ĐỂ IN RA ẢNH) -->
    <div id="invoice-preview" style="position: absolute; top: -9999px; left: -9999px; width: 800px; background: #fff; padding: 24px; font-family: Arial, sans-serif; font-size: 14px;">

      <!-- Header chia 3 cột: logo, thông tin, QR -->
      <div class="invoice-header-3col">
        <div class="header-col logo">
          <img src="https://i.ibb.co/3YNHfCB1/FOODY-88.png" alt="Logo" />
        </div>
        <div class="header-col info">
          <div>FOODY88</div>
          <div>ĐỊA CHỈ: PASAY, PHILIPPINES</div>
          <div>SỐ ĐIỆN THOẠI: 09335113342</div>
          <div>TELEGRAM: @SIEUBACHHOAPH8888</div>
          <div>ZALO: 0933511334</div>
          <div>WEBSITE: XNXX.COM</div>
        </div>
        <div class="header-col qr">
          <img src="https://i.ibb.co/fYwv6PRx/BLACKKQR.jpg" alt="QR Code" />
        </div>
      </div>

      <h2 style="text-align: center; margin: 20px 0; border-top: 1px solid #000; padding-top: 12px;">HÓA ĐƠN BÁN HÀNG</h2>

      <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <div>TELE NGƯỜI NHẬN: {{ form.tele }}</div>
          <div>SỐ ĐIỆN THOẠI: {{ form.sdt }}</div>
          <div>ĐỊA CHỈ: {{ form.diachi }}</div>
          <div>THỜI GIAN NHẬN: {{ invoices[0]?.gioNhan || '' }}</div>
        </div>
        <div style="text-align: right;">
          <div>MÃ HÓA ĐƠN: HD{{ Date.now() }}</div>
          <div>NGÀY: {{ new Date().toLocaleDateString('vi-VN') }}</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #000;">STT</th>
            <th style="border: 1px solid #000;">TÊN SẢN PHẨM</th>
            <th style="border: 1px solid #000;">ĐƠN VỊ TÍNH</th>
            <th style="border: 1px solid #000;">SỐ LƯỢNG</th>
            <th style="border: 1px solid #000;">ĐƠN GIÁ</th>
            <th style="border: 1px solid #000;">THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoices" :key="index">
            <td style="border: 1px solid #000; text-align: center;">{{ index + 1 }}</td>
            <td style="border: 1px solid #000;">{{ item.tenSp }}</td>
            <td style="border: 1px solid #000; text-align: center;">{{ item.donViTinh }}</td>
            <td style="border: 1px solid #000; text-align: center;">{{ item.soLuong }}</td>
            <td style="border: 1px solid #000; text-align: right;">{{ item.donGia.toLocaleString('vi-VN') }}</td>
            <td style="border: 1px solid #000; text-align: right;">{{ item.thanhTien.toLocaleString('vi-VN') }}</td>
          </tr>
          <tr>
            <td colspan="5" style="border: 1px solid #000; text-align: right;">PHÍ SHIP</td>
            <td style="border: 1px solid #000; text-align: right;">
              {{ invoices.reduce((s, i) => s + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
            </td>
          </tr>
          <tr>
            <td colspan="5" style="border: 1px solid #000; text-align: right; font-weight: bold;">TỔNG CỘNG</td>
            <td style="border: 1px solid #000; text-align: right; font-weight: bold;">
              {{ invoices.reduce((s, i) => s + Number(i.thanhTien || 0) + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
            </td>
          </tr>
        </tbody>
      </table>

      <p style="text-align: center; margin-top: 24px; font-style: italic;">
        ****XIN CẢM ƠN VÀ HẸN GẶP LẠI QUÝ KHÁCH****
      </p>
    </div>
    </div>

    <!-- HÓA ĐƠN MINI RIÊNG CHO IN -->
<div id="invoice-print-mini" style="display: none;">
  <div style="width: 260px; font-family: Arial, sans-serif; font-size: 11px; padding: 4px; line-height: 1.4;">
    <div style="text-align: center; font-weight: bold;">
      FOODY88<br />
      ĐỊA CHỈ: PASAY, PHILIPPINES<br />
      SỐ ĐIỆN THOẠI: 09335113342<br />
      TELEGRAM: @SIEUBACHHOAPH8888<br />
      ZALO: 0933511334<br />
      WEBSITE: XNXX.COM
    </div>

    <div style="text-align: center; margin: 6px 0; font-weight: bold;">HÓA ĐƠN BÁN HÀNG</div>

    <div style="font-size: 11px;">
      TELE: {{ form.tele }}<br />
      SĐT: {{ form.sdt }}<br />
      ĐC: {{ form.diachi }}<br />
      TG NHẬN: {{ invoices[0]?.gioNhan || '' }}<br />
      MÃ: HD{{ Date.now() }}<br />
      NGÀY: {{ new Date().toLocaleDateString('vi-VN') }}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
      <thead>
        <tr>
          <th style="border: 1px solid #000;">#</th>
          <th style="border: 1px solid #000;">Tên</th>
          <th style="border: 1px solid #000;">SL</th>
          <th style="border: 1px solid #000;">Giá</th>
          <th style="border: 1px solid #000;">TT</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in invoices" :key="i">
          <td style="border: 1px solid #000; text-align: center;">{{ i + 1 }}</td>
          <td style="border: 1px solid #000;">{{ item.tenSp }}</td>
          <td style="border: 1px solid #000; text-align: center;">{{ item.soLuong }}</td>
          <td style="border: 1px solid #000; text-align: right;">{{ item.donGia.toLocaleString('vi-VN') }}</td>
          <td style="border: 1px solid #000; text-align: right;">{{ item.thanhTien.toLocaleString('vi-VN') }}</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: right; border: 1px solid #000;">Phí ship</td>
          <td style="text-align: right; border: 1px solid #000;">
            {{ invoices.reduce((s, i) => s + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
          </td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: right; font-weight: bold; border: 1px solid #000;">TỔNG CỘNG</td>
          <td style="text-align: right; font-weight: bold; border: 1px solid #000;">
            {{ invoices.reduce((s, i) => s + Number(i.thanhTien || 0) + Number(i.phiShip || 0), 0).toLocaleString('vi-VN') }}
          </td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 8px; font-style: italic;">
      ****XIN CẢM ƠN VÀ HẸN GẶP LẠI QUÝ KHÁCH****
    </div>
  </div>
</div>

</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import TimePicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'
import axios from 'axios'
import html2canvas from 'html2canvas'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec'

const products = ref([])
const invoices = ref([])
const modalShow = ref(false)
const editItem = ref({})
const editIndex = ref(-1)

const form = ref({
  tele: '',
  sdt: '',
  diachi: '',
  soLuong: 1,
  donGia: 0,
  phiShip: 0,
  tenSp: '',
  donViTinh: '',
  productId: ''
})
const formatAttrs = (item) => {
  const attrList = [
    item['TRỌNG LƯỢNG'],
    item['KIỂU DÁNG'],
    item['MÀU SẮC'],
    item['KÍCH THƯỚC'],
    item['CHẤT LIỆU'],
    item['THƯƠNG HIỆU'],
    item['XUẤT XỨ'],
    item['BẢO HÀNH']
  ].filter(v => v && v.toString().trim() !== '')

  return attrList.length ? ` (${attrList.join(' / ')})` : ''
}

const dateOnly = ref('')
const timeOnly = ref('')
const period = ref('')

const productStock = computed(() => {
  const found = products.value.find(p => p.ID === form.value.productId)
  return found ? Number(found['SỐ LƯỢNG'] || 0) : 0
})


watch(timeOnly, (val) => {
  const hour = parseInt(val?.split(':')[0])
  if (!isNaN(hour)) {
    if (hour >= 5 && hour < 12) period.value = 'Sáng'
    else if (hour >= 12 && hour < 18) period.value = 'Chiều'
    else period.value = 'Tối'
  }
})

const handleProductTyping = () => {
  const rawInput = form.value.tenSp.trim()
  const baseName = rawInput.split(' (')[0].trim() // Lấy phần trước dấu (
  
  const found = products.value.find(p =>
    p['TÊN SẢN PHẨM'].toLowerCase().trim() === baseName.toLowerCase()
  )

  if (found) {
    const attrList = [
      found['TRỌNG LƯỢNG'],
      found['KIỂU DÁNG'],
      found['MÀU SẮC'],
      found['KÍCH THƯỚC'],
      found['CHẤT LIỆU'],
      found['THƯƠNG HIỆU'],
      found['XUẤT XỨ'],
      found['BẢO HÀNH']
    ].filter(v => v && v.toString().trim() !== '').join(' / ')

    form.value.tenSp = attrList
      ? `${found['TÊN SẢN PHẨM']} (${attrList})`
      : found['TÊN SẢN PHẨM']

    form.value.donGia = found['GIÁ']
    form.value.donViTinh = found['ĐƠN VỊ TÍNH']
    form.value.productId = found.ID
  } else {
    form.value.donGia = 0
    form.value.donViTinh = ''
    form.value.productId = ''
  }
}



const fetchProducts = async () => {
  const res = await axios.get(`${SCRIPT_URL}?action=getProducts`)
  products.value = res.data
}

onMounted(fetchProducts)

const addInvoiceRow = () => {
  if (!dateOnly.value || !timeOnly.value || !period.value) return alert('Vui lòng nhập đủ thời gian')
  if (productStock.value === 0) return alert('Sản phẩm đã hết hàng')

  const gioNhan = `${timeOnly.value} (${period.value}) ngày ${new Date(dateOnly.value).toLocaleDateString('vi-VN')}`
  const ngayTao = new Date().toLocaleString('vi-VN')
  const thanhTien = form.value.soLuong * form.value.donGia
  const tongTien = thanhTien + form.value.phiShip

  invoices.value.push({ ...form.value, gioNhan, ngayTao, thanhTien, tongTien, id: Date.now().toString() })

  form.value.tenSp = ''
  form.value.soLuong = 1
  form.value.donGia = 0
  form.value.donViTinh = ''
  form.value.phiShip = 0
  form.value.productId = ''
}

const editRow = (item, index) => {
  editItem.value = { ...item }
  editIndex.value = index
  modalShow.value = true
}

const updateItem = () => {
  const updated = editItem.value
  updated.thanhTien = updated.soLuong * updated.donGia
  updated.tongTien = updated.thanhTien + Number(updated.phiShip || 0)
  invoices.value[editIndex.value] = updated
  modalShow.value = false
}

const deleteItem = () => {
  invoices.value.splice(editIndex.value, 1)
  modalShow.value = false
}

const submitAndExport = async () => {
  const target = document.getElementById('invoice-preview')
  if (!target) return alert('Không tìm thấy hóa đơn để xử lý!')

  try {
    const canvas = await html2canvas(target, { scale: 2, useCORS: true })



    // ✅ GHI ĐƠN HÀNG
    if (invoices.value.length === 0) return alert('Không có sản phẩm nào!')
    const total = invoices.value.reduce((sum, i) => sum + i.thanhTien + i.phiShip, 0)
    const productLines = invoices.value.map(i => `${i.productId} – ${i.tenSp} x ${i.soLuong}`).join(', ')
    const stockPayload = invoices.value.map(i => ({ id: i.productId, quantity: i.soLuong, name: i.tenSp, price: i.donGia }))

    const payload = {
      action: 'addOrder',
      user: 'admin',
      name: invoices.value[0].diachi,
      phone: invoices.value[0].sdt,
      products: productLines,
      total,
      date: invoices.value[0].ngayTao,
      telegram: invoices.value[0].tele,
      time: invoices.value[0].gioNhan,
      note: 'Xuất từ trang AdminInvoice',
      status: 'Đã hoàn thành',
      items: JSON.stringify(stockPayload)
    }

    await axios.post(SCRIPT_URL, new URLSearchParams(payload))
    await axios.post(SCRIPT_URL, new URLSearchParams({ action: 'updateStock', items: JSON.stringify(stockPayload) }))
    alert('✅ Đã ghi đơn hàng và trừ kho thành công!')

    // ✅ TẢI VỀ FILE PNG
    const link = document.createElement('a')
    link.download = `hoadon-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()

    invoices.value = []
  } catch (err) {
    console.error(err)
    alert('❌ Lỗi khi xử lý hóa đơn!')
  }
}


const copyInvoiceImage = () => {
  const target = document.getElementById('invoice-preview')
  if (!target) return alert('Không tìm thấy nội dung hóa đơn để copy!')
  html2canvas(target, { scale: 2, useCORS: true }).then(canvas => {
    canvas.toBlob(blob => {
      if (!blob) return alert('Không thể tạo ảnh từ hóa đơn!')
      const item = new ClipboardItem({ 'image/png': blob })
      navigator.clipboard.write([item])
        .then(() => alert('✅ Đã copy ảnh hóa đơn vào clipboard!'))
        .catch(err => {
          console.error(err)
          alert('❌ Copy thất bại. Trình duyệt không hỗ trợ!')
        })
    })
  })
}

const openInvoicePopup = () => {
  const previewDiv = document.getElementById('invoice-preview')
  if (!previewDiv) return alert('Không tìm thấy hóa đơn để xem trước!')

  const html = previewDiv.innerHTML
  const popup = window.open('', '_blank', 'width=900,height=1000')
  popup.document.write(`
    <html><head><title>Xem trước hóa đơn</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; padding: 24px; background: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; }
        th { background: #f0f0f0; }
        h2 { text-align: center; margin: 20px 0; border-top: 1px solid #000; padding-top: 12px; }
        .invoice-header-3col {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #000;
          gap: 12px;
        }
        .header-col { flex: 1; text-align: center; }
        .header-col img { max-width: 100px; height: auto; }
      </style>
    </head><body>${html}</body></html>
  `)
  popup.document.close()
}

const printMiniInvoice = () => {
  const div = document.getElementById('invoice-print-mini')
  if (!div) return alert('Không tìm thấy nội dung hóa đơn mini để in!')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>In hóa đơn mini</title>
        <style>
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              width: 58mm;
              margin: 0;
              padding: 4px;
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #000;
              padding: 2px;
            }
            th {
              background: #eee;
            }
            body * {
              visibility: hidden;
            }
            #invoice-print-mini, #invoice-print-mini * {
              visibility: visible;
            }
            #invoice-print-mini {
              position: absolute;
              top: 0;
              left: 0;
            }
          }
        </style>
      </head>
      <body onload="window.print()">
        <div id="invoice-print-mini">
          ${div.innerHTML}
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=380,height=600')
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}


</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
.modal .form-control {
  font-size: 14px;
}
.header-row {
  border-bottom: 1px solid #000;
  padding-bottom: 10px;
  font-family: 'Segoe UI', sans-serif;
}

.header-logo,
.header-info,
.header-qr {
  width: 32%;
}

.header-logo img {
  height: 60px;
  object-fit: contain;
}

.header-info {
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
  color: #222;
}

.header-qr img {
  height: 60px;
  object-fit: contain;
}

.invoice-header-3col {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #000;
  font-family: Arial, sans-serif;
  gap: 12px;
}

.header-col {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-col.logo img {
  width: 120px;      /* Chiều rộng mong muốn */
  height: auto;
  object-fit: contain;
}

.header-col.info {
  flex-direction: column;
  font-size: 14px;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
  padding: 0 12px;
}

.header-col.qr img {
  width: 100px;       /* Cố định chiều rộng QR */
  height: 100px;      /* Cố định chiều cao QR */
  object-fit: cover;
  border-radius: 4px;
}

</style>
