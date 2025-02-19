<template>
  <div class="register">
    <div class="register-container">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-item">
          <label>用户名：</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="formData.username" 
              placeholder="请输入用户名"
              required
            >
          </div>
        </div>
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
          <label>验证码：</label>
          <div class="input-wrapper verification-code">
            <input 
              type="text" 
              v-model="formData.verificationCode" 
              placeholder="请输入验证码"
              required
              maxlength="6"
            >
            <button 
              type="button" 
              class="code-btn" 
              :disabled="cooldown > 0"
              @click="getVerificationCode"
            >
              {{ cooldown > 0 ? `${cooldown}秒后重试` : '获取验证码' }}
            </button>
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
        <div class="form-item">
          <label>确认密码：</label>
          <div class="input-wrapper">
            <input 
              type="password" 
              v-model="formData.confirmPassword" 
              placeholder="请再次输入密码"
              required
            >
          </div>
        </div>
        <button type="submit">注册</button>
        <div class="back-to-login">
          <router-link to="/login">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        username: '',
        phone: '',
        verificationCode: '',
        password: '',
        confirmPassword: ''
      },
      cooldown: 0,
      fakeCode: ''
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
    validateUsername() {
      if (this.formData.username.length < 2) {
        alert('用户名至少需要2个字符')
        return false
      }
      return true
    },
    async getVerificationCode() {
      if (!this.validatePhone()) return
      
      try {
        // 调用发送验证码接口
        const response = await request.post('/user/sendMsg', {
          phone: this.formData.phone
        })
        
        if (response.code === 1) {
          // 开始倒计时
          this.cooldown = 60
          const timer = setInterval(() => {
            this.cooldown--
            if (this.cooldown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
          
          alert('验证码发送成功！')
        } else {
          alert(response.msg || '验证码发送失败，请重试')
        }
      } catch (error) {
        console.error('发送验证码失败：', error)
        alert('验证码发送失败，请重试')
      }
    },
    async handleRegister() {
      // 表单验证
      if (!this.validateUsername()) return
      if (!this.validatePhone()) return
      
      if (this.formData.password !== this.formData.confirmPassword) {
        alert('两次输入的密码不一致！')
        return
      }
      
      try {
        // 调用注册接口
        const response = await request.post('/user', {
          username: this.formData.username,
          phone: this.formData.phone,
          password: this.formData.password,
          code: this.formData.verificationCode  // 验证码
        })
        
        if (response.code === 1) {
          alert('注册成功！')
          // 注册成功后跳转到登录页面
          this.$router.push('/login')
        } else {
          alert(response.msg || '注册失败，请重试')
        }
      } catch (error) {
        console.error('注册失败：', error)
        alert('注册失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-container {
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

.verification-code {
  gap: 10px;
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

.code-btn {
  width: 120px;
  height: 32px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}

.code-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  margin-top: 20px;
}

button:hover:not(:disabled) {
  background-color: #3aa876;
}

.back-to-login {
  margin-top: 15px;
  text-align: center;
}

.back-to-login a {
  color: #42b983;
  text-decoration: none;
  font-size: 14px;
}

.back-to-login a:hover {
  color: #3aa876;
}
</style> 