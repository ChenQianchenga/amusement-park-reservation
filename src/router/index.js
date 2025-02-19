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
  
  // 这些路由不需要登录就能访问
  const publicPages = ['/login', '/register', '/forgot-password']
  const authRequired = !publicPages.includes(to.path)
  
  if (authRequired && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next('/login')
  } else {
    next()
  }
})

export default router 