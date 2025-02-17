<template>
  <div class="login">
    <div class="login-container">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>手机号：</label>
          <div class="input-wrapper">
            <input 
              type="tel" 
              v-model="formData.phone" 
              placeholder="请输入手机号"
              required
              pattern="^1[3-9]\d{9}$"
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
            >
          </div>
        </div>
        <div class="form-links">
          <router-link to="/forgot-password" class="forgot-password">忘记密码？</router-link>
        </div>
        <button type="submit">登录</button>
        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      formData: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    validatePhone() {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.formData.phone)) {
        alert('请输入正确的手机号码')
        return false
      }
      return true
    },
    handleLogin() {
      if (!this.validatePhone()) return
      
      // TODO: 调用登录接口
      console.log('登录信息：', this.formData)
      alert('登录成功！')
    }
  }
}
</script>

<style scoped>
.login {
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

.form-links {
  text-align: right;
  margin-bottom: 15px;
}

.forgot-password {
  color: #666;
  font-size: 14px;
  text-decoration: none;
}

.forgot-password:hover {
  color: #42b983;
}

button[type="submit"] {
  width: 100%;
  height: 40px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #3aa876;
}

.register-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  color: #3aa876;
}
</style> 