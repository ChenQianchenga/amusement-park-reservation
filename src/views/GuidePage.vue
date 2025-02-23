<template>
  <div class="guide-page">
    <div class="guide-container">
      <h2>参观指南</h2>
      
      <!-- 开放时间 -->
      <div class="guide-section">
        <h3>开放时间</h3>
        <div class="time-info">
          <p>开园时间：{{ parkInfo.openTime }}</p>
          <p>闭园时间：{{ parkInfo.closeTime }}</p>
          <p class="note">* 具体开放时间可能会根据季节调整，请以当天公告为准</p>
        </div>
      </div>

      <!-- 交通指南 -->
      <div class="guide-section">
        <h3>交通指南</h3>
        <div class="transport-info">
          <div class="transport-item" v-for="(item, index) in transportGuide" :key="index">
            <h4>{{ item.type }}</h4>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 游玩须知 -->
      <div class="guide-section">
        <h3>游玩须知</h3>
        <div class="notice-list">
          <div class="notice-item" v-for="(notice, index) in notices" :key="index">
            <i class="el-icon-info"></i>
            <span>{{ notice }}</span>
          </div>
        </div>
      </div>

      <!-- 园区地图 -->
      <div class="guide-section">
        <h3>园区地图</h3>
        <div class="map-container">
          <img :src="parkMap" alt="园区地图">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'GuidePage',
  data() {
    return {
      parkInfo: {
        openTime: '09:00',
        closeTime: '21:00'
      },
      transportGuide: [
        {
          type: '地铁',
          description: '乘坐地铁1号线至欢乐谷站下车，从A出口出站即可到达。'
        },
        {
          type: '公交',
          description: '可乘坐以下公交线路：101路、102路、103路等在欢乐谷站下车。'
        },
        {
          type: '自驾',
          description: '导航到"欢乐谷停车场"，园区内设有大型停车场。'
        }
      ],
      notices: [
        '请携带有效身份证件入园',
        '园内禁止携带宠物',
        '部分项目有身高限制，请遵守工作人员指引',
        '请保管好随身物品',
        '遇到特殊天气可能会关闭部分项目'
      ],
      parkMap: require('@/assets/guide/park-map.jpg')
    }
  },
  async created() {
    await this.fetchParkInfo()
  },
  methods: {
    async fetchParkInfo() {
      try {
        const response = await request.get('/user/park/info')
        if (response.code === 1) {
          this.parkInfo = response.data
        }
      } catch (error) {
        console.error('获取园区信息失败：', error)
      }
    }
  }
}
</script>

<style scoped>
.guide-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.guide-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.guide-section {
  margin-bottom: 40px;
}

h3 {
  color: #42b983;
  border-left: 4px solid #42b983;
  padding-left: 10px;
  margin-bottom: 20px;
}

.time-info {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
}

.time-info p {
  margin: 10px 0;
  color: #666;
}

.note {
  color: #999;
  font-size: 14px;
  margin-top: 15px;
}

.transport-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.transport-item {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
}

.transport-item h4 {
  color: #333;
  margin-bottom: 10px;
}

.transport-item p {
  color: #666;
  line-height: 1.6;
}

.notice-list {
  display: grid;
  gap: 15px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}

.notice-item i {
  color: #42b983;
}

.map-container {
  text-align: center;
}

.map-container img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
</style> 