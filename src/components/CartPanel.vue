<template>
  <div class="cart-overlay" v-if="isOpen" @click.self="close">
    <div class="cart-panel shadow">
      <h5 class="fw-bold border-bottom pb-2 text-danger-emphasis">
        🛒 Giỏ hàng của bạn
      </h5>

      <div v-if="cart.length === 0" class="text-muted mt-3">Chưa có sản phẩm nào.</div>

      <div
        v-for="(item, index) in cart"
        :key="item.ID"
        class="cart-item mb-3 d-flex align-items-start"
      >
        <img
          :src="item['ẢNH(URL)']"
          style="width: 60px; height: 60px; object-fit: cover;"
          class="rounded border me-2"
        />

        <div class="flex-grow-1 me-2">
          <div class="fw-semibold">{{ item['TÊN SẢN PHẨM'] }}</div>
          <div class="small">Số lượng: {{ item.quantity }}</div>
          <div class="text-danger fw-bold small">Giá: {{ item['GIÁ'] }}P</div>
        </div>

        <button
          class="btn btn-outline-danger btn-sm mt-1"
          @click="removeItem(index)"
        >
          Xóa
        </button>
      </div>

      <div class="text-end mt-3" v-if="cart.length > 0">
        <div class="fw-bold mb-2">Tổng tiền: {{ total }}P</div>
        <div class="d-flex gap-2">
          <RouterLink to="/cart" class="btn btn-warning w-50 btn-sm fw-bold" @click="close">
            Xem giỏ hàng
          </RouterLink>
          <RouterLink to="/checkout" class="btn btn-danger w-50 btn-sm fw-bold" @click="close">
            Thanh toán
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const close = () => emit('close')

const username = JSON.parse(localStorage.getItem('user'))?.username || ''
const cartKey = `cart_${username}`
const cart = ref(JSON.parse(localStorage.getItem(cartKey)) || [])

const total = computed(() =>
  cart.value.reduce((sum, item) => sum + item['GIÁ'] * item.quantity, 0)
)

const removeItem = (index) => {
  cart.value.splice(index, 1)
  localStorage.setItem(cartKey, JSON.stringify(cart.value))
}

// Cập nhật khi giỏ hàng thay đổi từ trang khác
watch(() => props.isOpen, (val) => {
  if (val) {
    cart.value = JSON.parse(localStorage.getItem(cartKey)) || []
  }
})
</script>

<style scoped>

</style>
