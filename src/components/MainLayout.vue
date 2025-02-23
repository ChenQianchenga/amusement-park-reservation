<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="logo">欢乐谷</div>
      <div class="nav-tabs">
        <router-link 
          v-for="tab in tabs" 
          :key="tab.path"
          :to="tab.path"
          class="nav-tab"
          active-class="active"
        >
          {{ tab.name }}
        </router-link>
      </div>
      <div class="user-info" v-if="userInfo">
        <span>{{ userInfo.username }}</span>
        <el-button type="text" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      tabs: [
        { name: '首页', path: '/home' },
        { name: '门票预约', path: '/reservation' },
        { name: '参观指南', path: '/guide' },
        { name: '个人中心', path: '/profile' }
      ]
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  methods: {
    async handleLogout() {
      try {
        await this.$store.dispatch('logout')
        this.$message.success('退出成功')
        this.$router.push('/login')
      } catch (error) {
        console.error('退出失败：', error)
        this.$message.error('退出失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #42b983;
  margin-right: 40px;
}

.nav-tabs {
  display: flex;
  gap: 30px;
}

.nav-tab {
  font-size: 16px;
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-tab:hover {
  color: #42b983;
}

.nav-tab.active {
  color: #42b983;
  background-color: #f0f9eb;
}

.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  margin-top: 60px;
  padding: 20px;
  flex: 1;
}
</style> 