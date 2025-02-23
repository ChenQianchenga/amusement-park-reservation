<template>
  <div class="home-page">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="item.imageUrl" :alt="item.title">
      </el-carousel-item>
    </el-carousel>

    <!-- 公告区域 -->
    <div class="announcement-section">
      <h2>园区公告</h2>
      <div class="announcement-list">
        <div v-for="notice in announcements" :key="notice.id" 
          class="announcement-item" 
          @click="showAnnouncementDetail(notice)"
        >
          <span class="title">{{ notice.title }}</span>
          <span class="time">{{ notice.publishTime }}</span>
        </div>
        
        <!-- 添加分页器 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            @current-change="handlePageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog
      title="公告详情"
      :visible.sync="dialogVisible"
      width="600px"
      center
      class="announcement-dialog"
    >
      <div class="announcement-detail">
        <h3>{{ currentAnnouncement.title }}</h3>
        <div class="meta-info">
          <span class="time">发布时间：{{ currentAnnouncement.publishTime }}</span>
        </div>
        <div class="content-wrapper">
          <div class="content" v-html="currentAnnouncement.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'HomePage',
  data() {
    return {
      banners: [
        {
          id: 1,
          title: '欢乐谷盛大开业',
          imageUrl: require('@/assets/banners/banner1.jpg')
        },
        {
          id: 2,
          title: '暑期特惠活动',
          imageUrl: require('@/assets/banners/banner2.jpg')
        },
        {
          id: 3,
          title: '新项目预告',
          imageUrl: require('@/assets/banners/banner3.jpg')
        }
      ],
      announcements: [],
      // 添加分页相关数据
      currentPage: 1,
      pageSize: 5,
      total: 0,
      dialogVisible: false,
      currentAnnouncement: {}
    }
  },
  async created() {
    await Promise.all([
      this.fetchBanners(),
      this.fetchAnnouncements()
    ])
  },
  methods: {
    async fetchBanners() {
      try {
        const response = await request.get('/user/banner/list')
        if (response.code === 1) {
          this.banners = response.data
        }
      } catch (error) {
        console.error('获取轮播图失败：', error)
      }
    },
    async fetchAnnouncements() {
      try {
        const response = await request.get('/user/announcement/page', {
          params: {
            pageNum: this.currentPage,
            pageSize: this.pageSize
          }
        })
        
        if (response.code === 1) {
          this.announcements = response.data.records
          this.total = response.data.total
        }
      } catch (error) {
        console.error('获取公告失败：', error)
        this.$message.error('获取公告失败')
      }
    },
    // 处理页码改变
    handlePageChange(page) {
      this.currentPage = page
      this.fetchAnnouncements()
    },
    // 显示公告详情
    showAnnouncementDetail(notice) {
      this.currentAnnouncement = notice
      this.dialogVisible = true
    }
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.banner {
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.announcement-section {
  margin-bottom: 40px;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #42b983;
}

.announcement-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.announcement-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item .title {
  color: #333;
  flex: 1;
}

.announcement-item .time {
  color: #999;
  font-size: 14px;
}

/* 添加分页器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 当没有公告时的样式 */
.announcement-list:empty::before {
  content: '暂无公告';
  display: block;
  text-align: center;
  color: #999;
  padding: 20px 0;
}

/* 优化公告列表样式 */
.announcement-list {
  min-height: 200px;
  position: relative;
}

.announcement-item {
  cursor: pointer;
  transition: background-color 0.3s;
}

.announcement-item:hover {
  background-color: #f5f7fa;
}

/* 公告详情样式优化 */
.announcement-dialog :deep(.el-dialog) {
  margin-top: 8vh !important;
}

.announcement-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 70vh;  /* 设置最大高度 */
  overflow: hidden;  /* 防止内容溢出 */
}

.announcement-detail {
  height: 100%;
}

.announcement-detail h3 {
  margin: 0;
  padding: 20px;
  text-align: center;
  color: #333;
  font-size: 20px;
}

.meta-info {
  padding: 0 20px 20px;
  text-align: center;
  color: #999;
  border-bottom: 1px solid #eee;
}

.content-wrapper {
  padding: 20px;
  max-height: calc(70vh - 150px);  /* 减去标题和meta信息的高度 */
  overflow-y: auto;  /* 添加垂直滚动条 */
}

.content {
  line-height: 1.8;
  color: #666;
}

/* 自定义滚动条样式 */
.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

/* 弹窗样式优化 */
:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #eee;
  margin-right: 0;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
}
</style> 