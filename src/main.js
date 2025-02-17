/*
 * @Author: O_qiancheng.chen
 * @Date: 2025-02-17 21:49:28
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-17 22:23:17
 * @Description: 请填写简介
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
