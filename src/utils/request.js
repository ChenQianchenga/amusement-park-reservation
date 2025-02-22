/*
 * @Author: O_qiancheng.chen
 * @Date: 2025-02-19 00:03:46
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-22 19:21:39
 * @Description: 请填写简介
 */
import axios from 'axios'
import store from '@/store'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',  // 这里使用我们配置的代理前缀
  timeout: 5000     // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('请求URL：', config.url)
    
    // 判断请求路径是否包含 'admin'
    if (config.url.includes('/admin/')) {
      // 管理员接口，添加 token
      const token = store.state.token
      if (token) {
        config.headers['token'] = token
      }
    } else {
      // 用户接口，添加 authentication
      const authentication = store.state.authentication
      console.log('用户authentication：', authentication)
      if (authentication) {
        config.headers['authentication'] = authentication
      }
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 如果响应码是 401，说明 token 已失效，需要重新登录
    if (response.data.code === 401) {
      store.dispatch('logout')
      // 判断当前路由，避免重复跳转
      const currentPath = router.currentRoute.path
      if (currentPath !== '/login' && currentPath !== '/admin/login') {
        router.push({
          path: currentPath.includes('admin') ? '/admin/login' : '/login'
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err
          }
        })
      }
    }
    return response.data
  },
  error => {
    // 如果响应码是 401，说明 token 已失效，需要重新登录
    if (error.response && error.response.status === 401) {
      store.dispatch('logout')
      // 判断当前路由，避免重复跳转
      const currentPath = router.currentRoute.path
      if (currentPath !== '/login' && currentPath !== '/admin/login') {
        router.push({
          path: currentPath.includes('admin') ? '/admin/login' : '/login'
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err
          }
        })
      }
    }
    return Promise.reject(error)
  }
)

export default request 