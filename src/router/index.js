import { createRouter, createWebHistory } from 'vue-router'

import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import Orders from '../views/Orders.vue'
import Admin from '../views/Admin.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import UpdateProfile from '../components/UpdateProfile.vue' 
import ManageUsers from '../components/ManageUsers.vue'
import AdminNotifications from '@/views/AdminNotifications.vue'
import ClientLayout from '@/layouts/ClientLayout.vue'
import AdminInvoice from '@/views/AdminInvoice.vue'
import AdminShopStatus from '@/views/AdminShopStatus.vue' // ✅ thêm mới
import AdminComments from '@/views/AdminComments.vue'
import Review from '@/views/AllComments.vue' // đường dẫn tới file vừa gộp
import AdminBranchManager from '@/views/AdminBranchManager.vue'
import ExchangeCurrency from '@/views/ExchangeCurrency.vue'
const routes = [
  {path:'/about',component:()=>import('@/views/AboutView.vue')},
  { path: '/', component: ProductList },
  {
    path: '/product/:id',
    component: () => import('@/views/ProductDetail.vue')
  },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/orders', component: Orders },
  { path: '/admin', component: Admin },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/category/:cat',
    component: () => import('@/views/CategoryFilter.vue')
  },
  {
    path: '/my-orders',
    component: () => import('@/components/MyOrders.vue')
  },
  {
    path: '/manage-orders',
    component: () => import('@/views/AdminOrderManager.vue')
  },
  {
    path: '/admin-stats',
    component: () => import('@/views/AdminStatsDebt.vue')
  },
  { path: '/profile', component: UpdateProfile },
  { path: '/admin-users', component: ManageUsers },

  {
  path: '/notifications',
  name: 'ClientNotifications',
  component: () => import('@/views/ClientNotifications.vue')
},
{
  path: '/admin-notifications',
  name: 'AdminNotifications',
  component: () => import('@/views/AdminNotifications.vue')
},
{
  path: '/admin-invoice',
  name: 'AdminInvoice',
  component: () => import('@/views/AdminInvoice.vue'),
  meta: { requiresAuth: true, role: 'admin' }
}
, { path: '/admin-shop-status', name: 'AdminShopStatus', component: AdminShopStatus },
 {
    path: '/admin/comments',
    name: 'AdminComments',
    component: AdminComments,
    meta: { requiresAuth: true, requiresAdmin: true } // nếu cần phân quyền
  }
,
 {
  path: '/comments',
  name: 'AllComments',
  component: () => import('@/views/AllComments.vue'),
}
,{
    path: '/admin/branches',
    name: 'AdminBranchManager',
    component: AdminBranchManager,
    meta: { requiresAuth: true, role: 'admin' }
  },
  { path: '/exchange', name: 'ExchangeCurrency', component: ExchangeCurrency },
{
  path: '/payment-info',
  name: 'PaymentInfo',
  component: () => import('@/views/BankInfo.vue')
}

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
