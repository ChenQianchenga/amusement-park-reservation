/*
 * @Author: O_qiancheng.chen
 * @Date: 2025-02-17 22:32:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-02-22 19:12:09
 * @Description: 请填写简介
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    token: null,        // 管理员平台使用
    authentication: null, // 用户平台使用
    isAdmin: false  // 添加管理员标记
  },
  getters: {
    isLoggedIn: state => state.isAdmin ? !!state.token : !!state.authentication,
    isAdminUser: state => state.isAdmin  // 添加管理员getter
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    // 管理员token
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    // 用户authentication
    setAuthentication(state, authentication) {
      state.authentication = authentication
      localStorage.setItem('authentication', authentication)
    },
    setIsAdmin(state, isAdmin) {
      state.isAdmin = isAdmin
      localStorage.setItem('isAdmin', isAdmin)
    },
    clearUserInfo(state) {
      state.userInfo = null
      state.token = null
      state.authentication = null
      state.isAdmin = false
      localStorage.removeItem('token')
      localStorage.removeItem('authentication')
      localStorage.removeItem('isAdmin')
    }
  },
  actions: {
    // 登出操作
    logout({ commit }) {
      commit('clearUserInfo')
    }
  },
  modules: {
  }
}) 