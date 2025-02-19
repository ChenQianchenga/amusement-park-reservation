import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    token: null
  },
  getters: {
    isLoggedIn: state => !!state.token
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setToken(state, token) {
      state.token = token
      // 同时存储到 localStorage，用于页面刷新后恢复状态
      localStorage.setItem('token', token)
    },
    clearUserInfo(state) {
      state.userInfo = null
      state.token = null
      localStorage.removeItem('token')
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