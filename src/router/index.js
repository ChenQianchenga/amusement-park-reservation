/*
 * @Author: O_qiancheng.chen
 * @Date: 2025-02-17 22:32:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-22 17:17:16
 * @Description: 请填写简介
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/reservation'
  },
  {
    path: '/reservation',
    name: 'ReservationPage',
    component: () => import('../views/ReservationPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: () => import('../views/RegisterPage.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPasswordPage',
    component: () => import('../views/ForgotPasswordPage.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLoginPage',
    component: () => import('../views/AdminLoginPage.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const isAdmin = store.getters.isAdminUser
  
  // 这些路由不需要登录就能访问
  const publicPages = ['/login', '/register', '/forgot-password', '/admin/login']
  const authRequired = !publicPages.includes(to.path)
  
  // 检查是否需要管理员权限
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  if (authRequired && !isLoggedIn) {
    next('/login')
  } else if (requiresAdmin && !isAdmin) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router 