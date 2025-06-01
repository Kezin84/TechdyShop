<template>
    <header class="bg-white shadow-sm border-b py-3 sticky top-0 z-50">
      <div class="container mx-auto flex justify-between items-center px-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" class="h-10 w-auto" />
          <h1 class="text-xl font-bold text-gray-800 uppercase">TechShop</h1>
        </RouterLink>
  
        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink to="/" class="hover:text-red-600 font-medium">Trang chủ</RouterLink>
          <RouterLink to="/about" class="hover:text-red-600 font-medium">Giới thiệu</RouterLink>
          <RouterLink to="/category/TẤT CẢ" class="hover:text-red-600 font-medium">Sản phẩm</RouterLink>
          <RouterLink to="/contact" class="hover:text-red-600 font-medium">Liên hệ</RouterLink>
        </nav>
  
        <!-- Icons / User -->
        <div class="flex items-center gap-3">
          <RouterLink to="/cart" class="relative">
            <i class="fas fa-shopping-cart text-xl text-gray-600"></i>
          </RouterLink>
  
          <RouterLink to="/login" class="btn btn-sm btn-outline-primary hidden md:inline-block">Đăng nhập</RouterLink>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>
  
  <style scoped>
  header {
    transition: box-shadow 0.3s ease;
  }
  </style>
  