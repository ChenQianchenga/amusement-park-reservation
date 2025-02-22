<template>
  <div class="admin-login">
    <div class="login-container">
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名：</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="formData.username" 
              placeholder="请输入管理员用户名"
              required
              :disabled="loading"
            >
          </div>
        </div>
        <div class="form-item">
          <label>密码：</label>
          <div class="input-wrapper">
            <input 
              type="password" 
              v-model="formData.password" 
              placeholder="请输入密码"
              required
              :disabled="loading"
            >
          </div>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'AdminLoginPage',
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      if (!this.formData.username || !this.formData.password) {
        alert('请输入用户名和密码')
        return
      }

      this.loading = true
      try {
        const response = await request.post('/admin/login', {
          username: this.formData.username,
          password: this.formData.password
        })
        
        if (response.code === 1) {
          // 保存管理员信息和 token
          this.$store.commit('setUserInfo', response.data)
          this.$store.commit('setToken', response.data.token)
          this.$store.commit('setIsAdmin', true)
          
          alert('登录成功！')
          this.$router.push('/admin/dashboard')
        } else {
          alert(response.msg || '登录失败，请检查用户名和密码')
        }
      } catch (error) {
        console.error('登录失败：', error)
        alert('登录失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

label {
  width: 80px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
  color: #666;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  display: flex;
}

input {
  width: 100%;
  height: 32px;
  padding: 4px 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

button[type="submit"] {
  width: 100%;
  height: 40px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

button:hover:not(:disabled) {
  background-color: #40a9ff;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style> 