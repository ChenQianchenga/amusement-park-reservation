<template>
  <div class="reservation">
    <div class="header">
      <h2>游乐园预约</h2>
      <div class="user-info">
        <span>欢迎，{{ userInfo.userName }}</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="nav-menu">
      <div 
        v-for="(item, index) in menuItems" 
        :key="index"
        :class="['menu-item', { active: currentTab === item.key }]"
        @click="currentTab = item.key"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 轮播图 -->
      <div class="banner" v-show="currentTab === 'home'">
        <swiper class="swiper" :options="swiperOption">
          <swiper-slide v-for="(slide, index) in bannerList" :key="index">
            <img :src="slide.image" :alt="slide.title">
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
          <div class="swiper-button-prev" slot="button-prev"></div>
          <div class="swiper-button-next" slot="button-next"></div>
        </swiper>
      </div>

      <!-- 公告栏 -->
      <div class="announcement" v-show="currentTab === 'home'">
        <div class="announcement-header">
          <h3>园区公告</h3>
          <span class="more" @click="showAllAnnouncements">查看更多</span>
        </div>
        <div class="announcement-list">
          <div v-if="announcements.length === 0" class="no-data">暂无公告</div>
          <div v-else v-for="item in announcements" :key="item.id" class="announcement-item">
            <div class="announcement-title" @click="showAnnouncementDetail(item)">
              <i class="notice-icon">📢</i>
              <span class="title">{{ item.title }}</span>
              <span class="date">{{ item.createTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 门票预约 -->
      <div class="ticket-booking" v-show="currentTab === 'booking'">
        <h3>门票预约</h3>
        <div class="booking-form">
          <div class="form-item">
            <label>参观日期：</label>
            <input type="date" v-model="bookingForm.date" min="2024-02-20">
          </div>
          <div class="form-item">
            <label>票种选择：</label>
            <select v-model="bookingForm.ticketType">
              <option value="">请选择票种</option>
              <option value="adult">成人票</option>
              <option value="child">儿童票</option>
              <option value="senior">老年票</option>
            </select>
          </div>
          <div class="form-item">
            <label>购票数量：</label>
            <div class="number-input">
              <button @click="decreaseTickets">-</button>
              <input type="number" v-model.number="bookingForm.quantity" min="1" max="10">
              <button @click="increaseTickets">+</button>
            </div>
          </div>
          <button class="submit-btn" @click="handleBooking">立即预约</button>
        </div>
      </div>

      <!-- 参观指南 -->
      <div class="guide" v-show="currentTab === 'guide'">
        <h3>参观指南</h3>
        <div class="guide-content">
          <div class="guide-item">
            <h4>开放时间</h4>
            <p>周一至周日 09:00-18:00（17:30停止入园）</p>
          </div>
          <div class="guide-item">
            <h4>交通指南</h4>
            <p>地铁：乘坐1号线至欢乐谷站下车</p>
            <p>公交：乘坐101路、102路至欢乐谷站下车</p>
          </div>
          <div class="guide-item">
            <h4>注意事项</h4>
            <p>1. 请保管好随身物品</p>
            <p>2. 遵守园区规章制度</p>
            <p>3. 注意安全，照顾好老人和儿童</p>
          </div>
        </div>
      </div>

      <!-- 个人中心 -->
      <div class="profile" v-show="currentTab === 'profile'">
        <h3>个人中心</h3>
        <div class="profile-content">
          <div class="user-profile">
            <div class="profile-item">
              <label>用户名：</label>
              <span>{{ userInfo.userName }}</span>
            </div>
            <div class="profile-item">
              <label>手机号：</label>
              <span>{{ userInfo.phone }}</span>
            </div>
          </div>
          <div class="order-history">
            <h4>预约记录</h4>
            <div class="order-list">
              <!-- 这里后续接入实际的预约记录数据 -->
              <div class="no-data" v-if="!orders.length">暂无预约记录</div>
              <div v-else class="order-item" v-for="order in orders" :key="order.id">
                <p>预约日期：{{ order.date }}</p>
                <p>票种：{{ order.ticketType }}</p>
                <p>数量：{{ order.quantity }}</p>
                <p>状态：{{ order.status }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import request from '@/utils/request'

export default {
  name: 'ReservationPage',
  components: {
    Swiper,
    SwiperSlide
  },
  data() {
    return {
      currentTab: 'home',
      menuItems: [
        { key: 'home', label: '首页' },
        { key: 'booking', label: '门票预约' },
        { key: 'guide', label: '参观指南' },
        { key: 'profile', label: '个人中心' }
      ],
      swiperOption: {
        pagination: {
          el: '.swiper-pagination'
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        autoplay: {
          delay: 3000
        }
      },
      bannerList: [
        { 
          image: require('@/assets/banner/banner1.jpg'), 
          title: '游乐园全景'
        },
        { 
          image: require('@/assets/banner/banner2.jpg'), 
          title: '过山车'
        },
        { 
          image: require('@/assets/banner/banner3.jpg'), 
          title: '旋转木马'
        }
      ],
      bookingForm: {
        date: '',
        ticketType: '',
        quantity: 1
      },
      orders: [], // 预约记录
      announcements: [], // 公告列表
      loading: false
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  methods: {
    async handleLogout() {
      try {
        // 调用退出接口
        const response = await request.post('/user/logout')
        
        if (response.code === 1) {
          // 清除本地状态
          this.$store.dispatch('logout')
          this.$router.push('/login')
          alert('退出成功')
        } else {
          alert(response.msg || '退出失败，请重试')
        }
      } catch (error) {
        console.error('退出失败：', error)
        alert('退出失败，请重试')
      }
    },
    decreaseTickets() {
      if (this.bookingForm.quantity > 1) {
        this.bookingForm.quantity--
      }
    },
    increaseTickets() {
      if (this.bookingForm.quantity < 10) {
        this.bookingForm.quantity++
      }
    },
    async handleBooking() {
      if (!this.bookingForm.date) {
        alert('请选择参观日期')
        return
      }
      if (!this.bookingForm.ticketType) {
        alert('请选择票种')
        return
      }
      
      try {
        // TODO: 调用预约接口
        console.log('预约信息：', this.bookingForm)
        alert('预约成功！')
      } catch (error) {
        console.error('预约失败：', error)
        alert('预约失败，请重试')
      }
    },
    // 获取公告列表
    async getAnnouncements() {
      this.loading = true
      try {
        const response = await request.get('/announcement/list')
        if (response.code === 1) {
          this.announcements = response.data
        }
      } catch (error) {
        console.error('获取公告失败：', error)
      } finally {
        this.loading = false
      }
    },
    // 显示公告详情
    showAnnouncementDetail(announcement) {
      alert(announcement.content) // 这里可以改为弹窗或者跳转到详情页
    },
    // 查看更多公告
    showAllAnnouncements() {
      // TODO: 可以跳转到公告列表页或显示弹窗
      console.log('查看更多公告')
    }
  },
  mounted() {
    this.getAnnouncements()
  }
}
</script>

<style scoped>
.reservation {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #ff7875;
}

.reservation-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 400px;
}

.coming-soon {
  text-align: center;
  color: #999;
  font-size: 16px;
  margin-top: 100px;
}

.nav-menu {
  display: flex;
  background: white;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.menu-item {
  padding: 15px 30px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  color: #42b983;
}

.menu-item.active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

.content-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* 轮播图样式 */
.banner {
  height: 400px;
  margin-bottom: 20px;
}

.swiper {
  height: 100%;
}

.swiper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 预约表单样式 */
.booking-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.form-item label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
}

.form-item input,
.form-item select {
  flex: 1;
  height: 32px;
  padding: 4px 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.number-input {
  display: flex;
  align-items: center;
}

.number-input button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
}

.number-input input {
  width: 60px;
  text-align: center;
  margin: 0 10px;
}

.submit-btn {
  width: 100%;
  height: 40px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

/* 参观指南样式 */
.guide-content {
  padding: 20px;
}

.guide-item {
  margin-bottom: 30px;
}

.guide-item h4 {
  color: #333;
  margin-bottom: 10px;
}

/* 个人中心样式 */
.profile-content {
  padding: 20px;
}

.profile-item {
  margin-bottom: 15px;
}

.profile-item label {
  color: #666;
  margin-right: 10px;
}

.order-history {
  margin-top: 30px;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 公告栏样式 */
.announcement {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.announcement-header h3 {
  margin: 0;
  color: #333;
}

.more {
  color: #42b983;
  font-size: 14px;
  cursor: pointer;
}

.more:hover {
  color: #3aa876;
}

.announcement-list {
  max-height: 300px;
  overflow-y: auto;
}

.announcement-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.notice-icon {
  margin-right: 10px;
}

.title {
  flex: 1;
  color: #333;
}

.date {
  color: #999;
  font-size: 14px;
  margin-left: 15px;
}

/* 添加滚动条样式 */
.announcement-list::-webkit-scrollbar {
  width: 6px;
}

.announcement-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.announcement-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style> 