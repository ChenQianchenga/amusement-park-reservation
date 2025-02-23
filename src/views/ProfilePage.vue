<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-info">
          <h3>{{ userInfo.username }}</h3>
          <p>{{ userInfo.phone }}</p>
        </div>
      </div>

      <!-- 我的预约 -->
      <div class="my-reservations">
        <h3>我的预约</h3>
        <el-table :data="reservations" style="width: 100%">
          <el-table-column prop="visitDate" label="预约日期"></el-table-column>
          <el-table-column prop="visitTime" label="时间段"></el-table-column>
          <el-table-column prop="ticketType" label="门票类型"></el-table-column>
          <el-table-column prop="paymentAmount" label="金额">
            <template slot-scope="scope">
              <span class="amount">¥{{ scope.row.paymentAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="danger" 
                @click="handleCancel(scope.row)"
                :disabled="scope.row.status !== 1"
              >取消预约</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加分页器 -->
        <div class="pagination-container">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ProfilePage',
  data() {
    return {
      reservations: [],
      pageNum: 1,      // 当前页码
      pageSize: 10,    // 每页显示条数
      total: 0         // 总记录数
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  created() {
    this.fetchReservations()
  },
  methods: {
    async fetchReservations() {
      try {
        const response = await request.get('/user/reservation/page', {
          params: {
            pageNum: this.pageNum,
            pageSize: this.pageSize
          }
        })
        
        if (response.code === 1) {
          this.reservations = response.data.records
          this.total = response.data.total
        }
      } catch (error) {
        console.error('获取预约列表失败：', error)
        this.$message.error('获取预约列表失败')
      }
    },
    getStatusType(status) {
      const statusMap = {
        1: 'primary',  // 待使用 - 蓝色
        2: 'success',  // 已使用 - 绿色
        3: 'info'      // 已过期 - 灰色
      }
      return statusMap[status] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        1: '待使用',
        2: '已使用',
        3: '已过期'
      }
      return statusMap[status] || '未知状态'
    },
    // 处理每页显示条数变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchReservations()
    },
    // 处理页码变化
    handleCurrentChange(val) {
      this.pageNum = val
      this.fetchReservations()
    },
    // 取消预约
    async handleCancel(reservation) {
      try {
        await this.$confirm('确定要取消这个预约吗？取消后将无法恢复', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await request.delete('/user/reservation', {
          data: {
            reservationId: reservation.reservationId,
            ticketType: reservation.ticketType
          }
        })

        if (response.code === 1) {
          this.$message.success('取消预约成功')
          this.fetchReservations()  // 刷新列表
        } else {
          this.$message.error(response.msg || '取消预约失败')
        }
      } catch (error) {
        if (error !== 'cancel') {  // 用户点击取消按钮时不显示错误提示
          console.error('取消预约失败：', error)
          this.$message.error('取消预约失败，请重试')
        }
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.user-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-info p {
  margin: 0;
  color: #666;
}

.my-reservations {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}

/* 添加金额样式 */
.amount {
  color: #f56c6c;
  font-weight: bold;
}

/* 添加分页器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 