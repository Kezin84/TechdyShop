<template>
  <div class="product-grid">
    <div class="product-card" v-for="product in products" :key="product.ID">
      <img :src="product['ẢNH(URL)']" alt="Product" />
      <h4>{{ product['TÊN SẢN PHẨM'] }}</h4>
      <p class="price">{{ product['GIÁ'] }}P</p>
      <p class="desc">{{ product['MÔ TẢ'] }}</p>
      <p class="stock">Kho: {{ product['SỐ LƯỢNG'] }}</p>
    </div>
  </div>
</template>

<script setup>
const products = defineProps(['products'])
</script>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  max-width: 1440px;
}

.product-card {
  background: white;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: 0.2s ease;
}

.product-card:hover {
  transform: scale(1.02);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.price {
  color: red;
  font-weight: bold;
  margin: 4px 0;
}

.desc, .stock {
  font-size: 14px;
  color: #555;
}
</style>
