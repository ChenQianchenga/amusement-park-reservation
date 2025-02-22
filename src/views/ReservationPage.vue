        ...announcement,
        createTime: announcement.publishTime // 使用 publishTime 作为显示时间
      }
<template>
  <div class="reservation">
    <div class="header">
      <h2>游乐园预约</h2>
      <div class="user-info">
        <span>欢迎，{{ userInfo.username }}</span>
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
        <el-carousel height="400px" :interval="3000" arrow="always">
          <el-carousel-item v-for="(slide, index) in bannerList" :key="index">
            <div class="banner-item">
              <img :src="slide.image" :alt="slide.title">
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 公告栏 -->
      <div class="announcement" v-show="currentTab === 'home'">
        <div class="announcement-header">
          <h3>园区公告</h3>
          <span class="more" @click="showAllAnnouncements">查看更多</span>
        </div>
        <div class="announcement-list">
          <template v-if="announcements.length === 0">
            <div class="no-data">暂无公告</div>
          </template>
          <template v-else>
            <div v-for="item in announcements" :key="item.id" class="announcement-item">
              <div class="announcement-title" @click="showAnnouncementDetail(item)">
                <i class="notice-icon">📢</i>
                <span class="title">{{ item.title }}</span>
                <span class="date">{{ item.publishTime }}</span>
              </div>
            </div>
          </template>
        </div>
        <!-- 分页器 -->
        <div class="pagination" v-show="announcements.length > 0">
          <el-pagination
            background
            layout="sizes, prev, pager, next, total"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :current-page.sync="currentPage"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          >
          </el-pagination>
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
          <!-- 用户信息卡片 -->
          <div class="user-card">
            <div class="user-info-list">
              <div class="info-item">
                <label>用户名</label>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <label>手机号</label>
                <span>{{ userInfo.phone || '未设置' }}</span>
              </div>
            </div>
          </div>

          <!-- 预约记录 -->
          <div class="order-history">
            <div class="section-header">
              <h4>预约记录</h4>
            </div>
            <div class="order-list">
              <template v-if="!orders.length">
                <div class="no-data">
                  <i class="empty-icon">📋</i>
                  <span>暂无预约记录</span>
                </div>
              </template>
              <template v-else>
                <div class="order-item" v-for="order in orders" :key="order.id">
                  <div class="order-header">
                    <span class="order-date">预约日期：{{ order.date }}</span>
                    <span :class="['order-status', getStatusClass(order.status)]">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="order-info">
                    <div class="info-row">
                      <label>票种：</label>
                      <span>{{ order.ticketType }}</span>
                    </div>
                    <div class="info-row">
                      <label>数量：</label>
                      <span>{{ order.quantity }} 张</span>
                    </div>
                    <div class="info-row">
                      <label>总价：</label>
                      <span class="price">¥ {{ order.totalPrice }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog
      title="公告详情"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <div class="announcement-detail">
        <h3 class="detail-title">{{ currentAnnouncement.title }}</h3>
        <div class="detail-info">
          <span class="detail-time">发布时间：{{ currentAnnouncement.createTime }}</span>
        </div>
        <div class="detail-content">{{ currentAnnouncement.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ReservationPage',
  data() {
    return {
      currentTab: 'home',
      menuItems: [
        { key: 'home', label: '首页' },
        { key: 'booking', label: '门票预约' },
        { key: 'guide', label: '参观指南' },
        { key: 'profile', label: '个人中心' }
      ],
      bannerList: [
        { 
          image: 'https://picsum.photos/1200/400?random=1', // 使用随机图片作为示例
          title: '游乐园全景'
        },
        { 
          image: 'https://picsum.photos/1200/400?random=2',
          title: '过山车'
        },
        { 
          image: 'https://picsum.photos/1200/400?random=3',
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
      loading: false,
      dialogVisible: false,
      currentAnnouncement: {},
      currentPage: 1,
      pageSize: 5,
      total: 0  // 总条数
    }
  },
  computed: {
    userInfo() {
      // 打印一下用户信息，方便调试
      console.log('用户信息：', this.$store.state.userInfo)
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
        const response = await request.get('/user/announcement/page', {
          params: {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            status: 1  // 只获取生效中的公告
          }
        })
        if (response.code === 1) {
          this.announcements = response.data.records
          this.total = response.data.total
        }
      } catch (error) {
        console.error('获取公告失败：', error)
      } finally {
        this.loading = false
      }
    },
    // 显示公告详情
    showAnnouncementDetail(announcement) {
      this.currentAnnouncement = announcement
      this.dialogVisible = true
    },
    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.currentAnnouncement = {}
    },
    // 查看更多公告
    showAllAnnouncements() {
      // TODO: 可以跳转到公告列表页或显示弹窗
      console.log('查看更多公告')
    },
    // 处理页码变化
    handlePageChange(page) {
      this.currentPage = page
      this.getAnnouncements()
    },
    // 处理每页条数变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1  // 重置到第一页
      this.getAnnouncements()
    },
    // 获取订单状态样式类
    getStatusClass(status) {
      const statusMap = {
        '待审核': 'pending',
        '已完成': 'completed',
        '已取消': 'cancelled'
      }
      return statusMap[status] || 'pending'
    }
  },
  mounted() {
    // 获取公告列表
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
  margin-bottom: 20px;
}

.banner-item {
  height: 100%;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 自定义轮播图箭头样式 */
.el-carousel__arrow {
  background-color: rgba(0, 0, 0, 0.5);
}

.el-carousel__arrow:hover {
  background-color: rgba(0, 0, 0, 0.7);
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

/* 个人中心样式优化 */
.profile-content {
  padding: 20px;
  display: grid;
  gap: 24px;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.user-info-list {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  width: 80px;
  color: #666;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 15px;
}

.order-history {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.order-list {
  padding: 20px;
}

.order-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.order-status.pending {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.order-status.completed {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.order-status.cancelled {
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}

.order-info {
  display: grid;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-row label {
  width: 60px;
  color: #666;
  font-size: 14px;
}

.info-row span {
  color: #333;
  font-size: 14px;
}

.price {
  color: #ff4d4f !important;
  font-weight: 500;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

/* 公告栏样式 */
.announcement {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
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
  min-height: 200px;
  margin-bottom: 20px;
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
  padding: 0 10px;
}

.notice-icon {
  margin-right: 10px;
  flex-shrink: 0;
}

.title {
  flex: 1;
  color: #333;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  color: #999;
  font-size: 14px;
  margin-left: 15px;
  flex-shrink: 0;
}

/* 添加悬停效果 */
.announcement-item:hover {
  background-color: #f5f5f5;
}

.announcement-item:hover .title {
  color: #42b983;
}

/* 分页器样式优化 */
.pagination {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  font-weight: normal;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #42b983;
  color: white;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #42b983;
}

:deep(.el-select-dropdown__item.selected) {
  color: #42b983;
}

:deep(.el-pagination__sizes .el-input .el-input__inner:hover) {
  border-color: #42b983;
}

/* 公告详情弹窗样式 */
.announcement-detail {
  padding: 20px;
}

.detail-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 500;
}

.detail-info {
  text-align: right;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-content {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap;
  text-align: left;
  padding: 0 10px;
}

/* 自定义 Element UI Dialog 样式 */
:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__headerbtn) {
  font-size: 20px;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #42b983;
}
</style> 