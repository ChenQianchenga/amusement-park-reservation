<template>
  <div class="admin-dashboard">
    <div class="header">
      <h2>管理员后台</h2>
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

    <div class="content">
      <!-- 公告管理 -->
      <div v-show="currentTab === 'announcement'" class="module-container">
        <h3>公告管理</h3>
        <div class="action-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchTitle" 
              placeholder="请输入公告标题搜索"
              @keyup.enter="handleSearch"
            >
            <button class="search-btn" @click="handleSearch">
              <i class="search-icon">🔍</i>
            </button>
          </div>
          <button class="add-btn" @click="showPublishDialog">
            <i class="add-icon">+</i>
            发布公告
          </button>
        </div>
        <div class="list-container">
          <el-table :data="announcements" style="width: 100%">
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                  {{ scope.row.status === 1 ? '生效中' : '已失效' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="publishTime" label="发布时间"></el-table-column>
            <el-table-column label="操作" width="280">
              <template slot-scope="scope">
                <el-button 
                  size="mini" 
                  type="primary" 
                  @click="handleEditAnnouncement(scope.row)"
                >编辑</el-button>
                <el-button 
                  size="mini" 
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  @click="handleToggleStatus(scope.row)"
                >
                  {{ scope.row.status === 1 ? '设为失效' : '设为生效' }}
                </el-button>
                <el-button 
                  size="mini" 
                  type="danger" 
                  @click="handleDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 分页器 -->
        <div class="pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :current-page.sync="currentPage"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          >
          </el-pagination>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-show="currentTab === 'user'" class="module-container">
        <h3>用户管理</h3>
        <div class="action-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchUsername" 
              placeholder="请输入用户名搜索"
              @keyup.enter="handleUserSearch"
            >
            <button class="search-btn" @click="handleUserSearch">
              <i class="search-icon">🔍</i>
            </button>
          </div>
          <el-button 
            type="primary"
            icon="el-icon-download"
            @click="handleExportUsers"
            :loading="exporting"
          >
            导出用户
          </el-button>
        </div>
        <div class="list-container">
          <el-table 
            :data="users" 
            style="width: 100%"
            border
            stripe
            highlight-current-row
          >
            <el-table-column 
              prop="username" 
              label="用户名"
              align="center"
              min-width="180"
            ></el-table-column>
            <el-table-column 
              prop="phone" 
              label="手机号"
              align="center"
              min-width="150"
            ></el-table-column>
            <el-table-column 
              prop="createTime" 
              label="创建时间"
              align="center"
              min-width="180"
            ></el-table-column>
            <el-table-column 
              prop="updateTime" 
              label="更新时间"
              align="center"
              min-width="180"
            ></el-table-column>
          </el-table>
          
          <!-- 用户列表分页器 -->
          <div class="pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="userTotal"
              :page-size="userPageSize"
              :page-sizes="[10, 20, 30, 50]"
              :current-page.sync="userCurrentPage"
              @current-change="handleUserPageChange"
              @size-change="handleUserSizeChange"
            >
            </el-pagination>
          </div>
        </div>
      </div>

      <!-- 预约管理 -->
      <div v-show="currentTab === 'reservation'" class="module-container">
        <h3>预约管理</h3>
        <div class="list-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>预约日期</th>
                <th>票种</th>
                <th>数量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>{{ order.username }}</td>
                <td>{{ order.date }}</td>
                <td>{{ order.ticketType }}</td>
                <td>{{ order.quantity }}</td>
                <td>{{ order.status }}</td>
                <td>
                  <button class="approve-btn" @click="handleApproveOrder(order.id)">审核</button>
                  <button class="delete-btn" @click="handleDeleteOrder(order.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 门票管理 -->
      <div v-show="currentTab === 'ticket'" class="module-container">
        <h3>门票管理</h3>
        <div class="action-bar">
          <button class="add-btn" @click="handleAddTicket">添加票种</button>
        </div>
        <div class="list-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>票种名称</th>
                <th>价格（元）</th>
                <th>描述</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.id">
                <td>{{ ticket.name }}</td>
                <td>{{ ticket.price }}</td>
                <td>{{ ticket.description }}</td>
                <td>{{ ticket.status ? '在售' : '停售' }}</td>
                <td>
                  <button class="edit-btn" @click="handleEditTicket(ticket)">编辑</button>
                  <button 
                    :class="['status-btn', ticket.status ? 'stop-btn' : 'start-btn']"
                    @click="handleToggleTicketStatus(ticket.id, !ticket.status)"
                  >
                    {{ ticket.status ? '停售' : '开售' }}
                  </button>
                  <button class="delete-btn" @click="handleDeleteTicket(ticket.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 预约设置 -->
      <div v-show="currentTab === 'settings'" class="module-container">
        <h3>预约设置</h3>
        <div class="settings-form">
          <div class="settings-grid">
            <!-- 开放时间设置 -->
            <div class="settings-card">
              <div class="card-header">
                <i class="time-icon">🕒</i>
                <h4>开放时间设置</h4>
              </div>
              <div class="card-content">
                <div class="time-range">
                  <div class="form-item">
                    <label>开始时间</label>
                    <select v-model="settings.openTime">
                      <option v-for="time in timeOptions" :key="time" :value="time">
                        {{ time }}
                      </option>
                    </select>
                  </div>
                  <div class="divider">至</div>
                  <div class="form-item">
                    <label>结束时间</label>
                    <select v-model="settings.closeTime">
                      <option v-for="time in timeOptions" :key="time" :value="time">
                        {{ time }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 每日预约人数限制 -->
            <div class="settings-card">
              <div class="card-header">
                <i class="visitor-icon">👥</i>
                <h4>每日预约人数限制</h4>
              </div>
              <div class="card-content">
                <div class="form-item">
                  <label>最大预约人数</label>
                  <div class="number-input">
                    <button @click="decreaseMaxVisitors" class="ctrl-btn">-</button>
                    <input 
                      type="number" 
                      v-model.number="settings.maxVisitors"
                      min="1"
                      max="10000"
                    >
                    <button @click="increaseMaxVisitors" class="ctrl-btn">+</button>
                    <span class="unit">人/天</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提前预约天数 -->
            <div class="settings-card">
              <div class="card-header">
                <i class="calendar-icon">📅</i>
                <h4>提前预约天数</h4>
              </div>
              <div class="card-content">
                <div class="form-item">
                  <label>最多提前预约</label>
                  <div class="number-input">
                    <button @click="decreaseAdvanceDays" class="ctrl-btn">-</button>
                    <input 
                      type="number" 
                      v-model.number="settings.advanceDays"
                      min="1"
                      max="30"
                    >
                    <button @click="increaseAdvanceDays" class="ctrl-btn">+</button>
                    <span class="unit">天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间段设置 -->
          <div class="timeslot-section">
            <div class="section-header">
              <i class="clock-icon">⏰</i>
              <h4>预约时间段设置</h4>
            </div>
            <div class="timeslot-container">
              <div class="timeslot-list">
                <div 
                  v-for="(slot, index) in settings.timeSlots" 
                  :key="index" 
                  class="timeslot-item"
                >
                  <div class="slot-time">
                    <select v-model="slot.start">
                      <option v-for="time in timeOptions" :key="time" :value="time">
                        {{ time }}
                      </option>
                    </select>
                    <span class="divider">至</span>
                    <select v-model="slot.end">
                      <option v-for="time in timeOptions" :key="time" :value="time">
                        {{ time }}
                      </option>
                    </select>
                  </div>
                  <button class="delete-slot" @click="removeTimeSlot(index)" title="删除时间段">
                    <i class="delete-icon">🗑️</i>
                  </button>
                </div>
              </div>
              <button class="add-slot" @click="addTimeSlot">
                <i class="add-icon">+</i>
                添加时间段
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="saveSettings">
              <i class="save-icon">💾</i>
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 门票编辑弹窗 -->
    <el-dialog
      :title="ticketForm.id ? '编辑票种' : '添加票种'"
      :visible.sync="ticketDialogVisible"
      width="40%"
    >
      <div class="ticket-form">
        <div class="form-item">
          <label>票种名称：</label>
          <input type="text" v-model="ticketForm.name" placeholder="请输入票种名称">
        </div>
        <div class="form-item">
          <label>价格：</label>
          <input type="number" v-model="ticketForm.price" placeholder="请输入价格">
        </div>
        <div class="form-item">
          <label>描述：</label>
          <textarea v-model="ticketForm.description" placeholder="请输入票种描述"></textarea>
        </div>
        <div class="form-item">
          <label>状态：</label>
          <select v-model="ticketForm.status">
            <option :value="true">在售</option>
            <option :value="false">停售</option>
          </select>
        </div>
      </div>
      <div slot="footer">
        <button class="cancel-btn" @click="ticketDialogVisible = false">取消</button>
        <button class="confirm-btn" @click="handleSaveTicket">确定</button>
      </div>
    </el-dialog>

    <!-- 特殊日期弹窗 -->
    <el-dialog
      title="添加特殊日期"
      :visible.sync="specialDateDialogVisible"
      width="40%"
    >
      <div class="special-date-form">
        <div class="form-item">
          <label>日期：</label>
          <input type="date" v-model="specialDateForm.date">
        </div>
        <div class="form-item">
          <label>限制人数：</label>
          <input type="number" v-model="specialDateForm.maxVisitors" min="0">
        </div>
      </div>
      <div slot="footer">
        <button class="cancel-btn" @click="specialDateDialogVisible = false">取消</button>
        <button class="confirm-btn" @click="addSpecialDate">确定</button>
      </div>
    </el-dialog>

    <!-- 发布公告弹窗 -->
    <el-dialog
      title="发布公告"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <el-form :model="announcementForm" :rules="rules" ref="announcementForm" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="announcementForm.content"
            :rows="6"
            placeholder="请输入公告内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">发 布</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      currentTab: 'announcement',
      menuItems: [
        { key: 'announcement', label: '公告管理' },
        { key: 'user', label: '用户管理' },
        { key: 'reservation', label: '预约管理' },
        { key: 'ticket', label: '门票管理' },
        { key: 'settings', label: '预约设置' }
      ],
      announcements: [],
      users: [],
      orders: [],
      tickets: [],
      ticketDialogVisible: false,
      ticketForm: {
        id: null,
        name: '',
        price: '',
        description: '',
        status: true
      },
      settings: {
        openTime: '09:00',
        closeTime: '17:00',
        maxVisitors: 1000,
        advanceDays: 7,
        timeSlots: [
          { start: '09:00', end: '11:00' },
          { start: '13:00', end: '15:00' },
          { start: '15:00', end: '17:00' }
        ]
      },
      timeOptions: [
        '08:00', '08:30', '09:00', '09:30', '10:00',
        '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00',
        '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00'
      ],
      specialDateDialogVisible: false,
      specialDateForm: {
        date: '',
        maxVisitors: 0
      },
      total: 0,
      pageSize: 10,
      currentPage: 1,
      searchTitle: '',  // 搜索关键词
      dialogVisible: false,
      publishing: false,
      announcementForm: {
        id: null,
        title: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入公告内容', trigger: 'blur' },
          { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
        ]
      },
      userTotal: 0,
      userPageSize: 10,
      userCurrentPage: 1,
      searchUsername: '',
      exporting: false
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  methods: {
    // 退出登录
    async handleLogout() {
      try {
        const response = await request.post('/admin/logout')
        if (response.code === 1) {
          this.$store.dispatch('logout')
          this.$router.push('/admin/login')
          alert('退出成功')
        } else {
          alert(response.msg || '退出失败，请重试')
        }
      } catch (error) {
        console.error('退出失败：', error)
        alert('退出失败，请重试')
      }
    },

    // 公告管理方法
    async handleAddAnnouncement() {
      // TODO: 实现添加公告的具体逻辑
      console.log('添加公告')
    },

    async handleEditAnnouncement(row) {
      this.announcementForm = {
        id: row.id,
        title: row.title,
        content: row.content
      }
      this.dialogVisible = true
    },

    async handleDeleteAnnouncement(itemId) {
      // TODO: 实现删除公告的具体逻辑
      console.log('删除公告', itemId)
    },

    // 用户管理方法
    async handleDeleteUser(user) {
      // TODO: 实现删除用户的具体逻辑
      console.log('删除用户', user)
    },

    // 预约管理方法
    async handleApproveOrder(orderId) {
      // TODO: 实现审核预约的具体逻辑
      console.log('审核预约', orderId)
    },

    async handleDeleteOrder(orderId) {
      // TODO: 实现删除预约的具体逻辑
      console.log('删除预约', orderId)
    },

    // 门票管理方法
    async handleAddTicket() {
      this.ticketForm = {
        id: null,
        name: '',
        price: '',
        description: '',
        status: true
      }
      this.ticketDialogVisible = true
    },

    async handleEditTicket(ticket) {
      this.ticketForm = { ...ticket }
      this.ticketDialogVisible = true
    },

    async handleSaveTicket() {
      try {
        const url = this.ticketForm.id ? `/admin/ticket/${this.ticketForm.id}` : '/admin/ticket'
        const method = this.ticketForm.id ? 'put' : 'post'
        
        const response = await request[method](url, this.ticketForm)
        if (response.code === 1) {
          alert('保存成功')
          this.ticketDialogVisible = false
          this.fetchTickets()
        } else {
          alert(response.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存失败：', error)
        alert('保存失败，请重试')
      }
    },

    async handleToggleTicketStatus(id, status) {
      try {
        const response = await request.put(`/admin/ticket/${id}/status`, { status })
        if (response.code === 1) {
          alert(status ? '开售成功' : '停售成功')
          this.fetchTickets()
        } else {
          alert(response.msg || '操作失败')
        }
      } catch (error) {
        console.error('操作失败：', error)
        alert('操作失败，请重试')
      }
    },

    async handleDeleteTicket(id) {
      if (!confirm('确定要删除这个票种吗？')) return
      
      try {
        const response = await request.delete(`/admin/ticket/${id}`)
        if (response.code === 1) {
          alert('删除成功')
          this.fetchTickets()
        } else {
          alert(response.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除失败：', error)
        alert('删除失败，请重试')
      }
    },

    // 获取数据
    async getAnnouncements() {
      try {
        const response = await request.get('/admin/announcement/page', {
          params: {
            pageNum: this.currentPage,
            pageSize: this.pageSize,
            title: this.searchTitle || undefined  // 如果有搜索关键词则传递
          }
        })
        
        if (response.code === 1) {
          this.announcements = response.data.records
          this.total = response.data.total
        } else {
          this.$message.error(response.msg || '获取公告列表失败')
        }
      } catch (error) {
        console.error('获取公告列表失败：', error)
        this.$message.error('获取公告列表失败')
      }
    },

    // 获取用户列表
    async fetchUsers() {
      try {
        const response = await request.get('/admin/page', {
          params: {
            pageNum: this.userCurrentPage,
            pageSize: this.userPageSize,
            username: this.searchUsername || undefined  // 如果有搜索关键词则传递
          }
        })
        
        if (response.code === 1) {
          this.users = response.data.records
          this.userTotal = response.data.total
        } else {
          this.$message.error(response.msg || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败：', error)
        this.$message.error('获取用户列表失败')
      }
    },

    async fetchOrders() {
      // TODO: 获取预约列表
      console.log('获取预约列表')
    },

    async fetchTickets() {
      try {
        const response = await request.get('/admin/ticket/list')
        if (response.code === 1) {
          this.tickets = response.data
        }
      } catch (error) {
        console.error('获取门票列表失败：', error)
      }
    },

    // 预约设置方法
    decreaseMaxVisitors() {
      if (this.settings.maxVisitors > 1) {
        this.settings.maxVisitors -= 100
      }
    },
    increaseMaxVisitors() {
      if (this.settings.maxVisitors < 10000) {
        this.settings.maxVisitors += 100
      }
    },
    decreaseAdvanceDays() {
      if (this.settings.advanceDays > 1) {
        this.settings.advanceDays--
      }
    },
    increaseAdvanceDays() {
      if (this.settings.advanceDays < 30) {
        this.settings.advanceDays++
      }
    },
    showAddSpecialDate() {
      this.specialDateForm = {
        date: '',
        maxVisitors: 0
      }
      this.specialDateDialogVisible = true
    },
    addSpecialDate() {
      if (!this.specialDateForm.date) {
        alert('请选择日期')
        return
      }
      this.settings.specialDates.push({
        date: this.specialDateForm.date,
        maxVisitors: this.specialDateForm.maxVisitors
      })
      this.specialDateDialogVisible = false
    },
    removeSpecialDate(index) {
      this.settings.specialDates.splice(index, 1)
    },
    async fetchSettings() {
      try {
        const response = await request.get('/admin/settings')
        if (response.code === 1) {
          this.settings = response.data
        } else {
          this.$message.error(response.msg || '获取设置失败')
        }
      } catch (error) {
        console.error('获取设置失败：', error)
        this.$message.error('获取设置失败，请重试')
      }
    },
    async saveSettings() {
      try {
        const response = await request.post('/admin/settings', this.settings)
        if (response.code === 1) {
          this.$message.success('保存成功')
          this.fetchSettings()
        } else {
          this.$message.error(response.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存失败：', error)
        this.$message.error('保存失败，请重试')
      }
    },
    addTimeSlot() {
      const newSlot = {
        start: '09:00',
        end: '11:00'
      }
      
      if (this.checkTimeSlotOverlap(newSlot)) {
        this.$message.warning('时间段不能重叠')
        return
      }

      this.settings.timeSlots.push(newSlot)
    },
    checkTimeSlotOverlap(newSlot) {
      return this.settings.timeSlots.some(slot => {
        const newStart = this.timeToMinutes(newSlot.start)
        const newEnd = this.timeToMinutes(newSlot.end)
        const slotStart = this.timeToMinutes(slot.start)
        const slotEnd = this.timeToMinutes(slot.end)

        return (newStart < slotEnd && newEnd > slotStart)
      })
    },
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    },
    removeTimeSlot(index) {
      this.settings.timeSlots.splice(index, 1)
    },
    handlePageChange(page) {
      this.currentPage = page
      this.getAnnouncements()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getAnnouncements()
    },
    // 处理搜索
    handleSearch() {
      this.currentPage = 1  // 搜索时重置到第一页
      this.getAnnouncements()
    },
    // 重置搜索
    resetSearch() {
      this.searchTitle = ''
      this.currentPage = 1
      this.getAnnouncements()
    },
    // 显示发布弹窗
    showPublishDialog() {
      this.dialogVisible = true
    },
    
    // 关闭弹窗
    handleClose() {
      this.announcementForm = {
        id: null,
        title: '',
        content: ''
      }
      this.$refs.announcementForm.resetFields()
      this.dialogVisible = false
    },
    
    // 发布公告
    async handlePublish() {
      try {
        await this.$refs.announcementForm.validate()
        
        this.publishing = true
        // 根据是否有 id 判断是新增还是编辑
        const url = this.announcementForm.id ? 
          '/admin/announcement' :  // 修改为正确的编辑接口
          '/admin/announcement'    // 新增接口
        
        const method = this.announcementForm.id ? 'put' : 'post'
        const response = await request[method](url, this.announcementForm)
        
        if (response.code === 1) {
          this.$message.success(this.announcementForm.id ? '编辑成功' : '发布成功')
          this.dialogVisible = false
          this.getAnnouncements() // 刷新列表
          this.$refs.announcementForm.resetFields()
        } else {
          this.$message.error(response.msg || (this.announcementForm.id ? '编辑失败' : '发布失败'))
        }
      } catch (error) {
        console.error(this.announcementForm.id ? '编辑失败：' : '发布失败：', error)
        this.$message.error(this.announcementForm.id ? '编辑失败，请重试' : '发布失败，请重试')
      } finally {
        this.publishing = false
      }
    },
    
    // 删除公告
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条公告吗？', '提示', {
          type: 'warning'
        })
        
        const response = await request.delete('/admin/announcement', {
          params: {
            id: row.id
          }
        })
        
        if (response.code === 1) {
          this.$message.success('删除成功')
          this.getAnnouncements()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败：', error)
          this.$message.error('删除失败，请重试')
        }
      }
    },

    // 切换公告状态
    async handleToggleStatus(row) {
      try {
        const newStatus = row.status === 1 ? 0 : 1
        const tipText = newStatus === 1 ? '生效' : '失效'
        
        await this.$confirm(`确定要将该公告设为${tipText}吗？`, '提示', {
          type: 'warning'
        })
        
        const response = await request.post(`/admin/announcement/status/${newStatus}`, null, {
          params: {
            id: row.id
          }
        })
        
        if (response.code === 1) {
          this.$message.success(`设置${tipText}成功`)
          this.getAnnouncements() // 刷新列表
        } else {
          this.$message.error(response.msg || `设置${tipText}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('设置状态失败：', error)
          this.$message.error('设置状态失败，请重试')
        }
      }
    },

    handleUserPageChange(page) {
      this.userCurrentPage = page
      this.fetchUsers()
    },
    handleUserSizeChange(size) {
      this.userPageSize = size
      this.userCurrentPage = 1
      this.fetchUsers()
    },
    handleUserSearch() {
      this.userCurrentPage = 1
      this.fetchUsers()
    },
    async handleExportUsers() {
      try {
        this.exporting = true
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = encodeURIComponent(`用户数据_${timestamp}.csv`)  // URL 编码中文文件名

        // 直接通过 window.location.href 下载
        window.location.href = `/api/admin/export?fileName=${fileName}`
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败：', error)
        this.$message.error('导出失败，请重试')
      } finally {
        this.exporting = false
      }
    }
  },
  mounted() {
    this.getAnnouncements()
    this.fetchUsers()
    this.fetchOrders()
    this.fetchTickets()
    this.fetchSettings()
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 400px;
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
  color: #1890ff;
}

.menu-item.active {
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
}

.module-container {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-box input {
  width: 300px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-btn {
  height: 36px;
  padding: 0 15px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.search-btn:hover {
  background: #40a9ff;
}

.add-btn {
  height: 36px;
  padding: 0 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.add-btn:hover {
  background: #40a9ff;
}

.add-btn i {
  font-size: 18px;
  font-weight: bold;
}

.search-icon {
  font-size: 18px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background: #fafafa;
  font-weight: 500;
  color: #333;
}

.data-table tr:hover {
  background: #fafafa;
}

.add-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn,
.approve-btn {
  padding: 4px 8px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.delete-btn {
  padding: 4px 8px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}

/* 门票表单样式 */
.ticket-form {
  padding: 20px;
}

.ticket-form .form-item {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.ticket-form label {
  width: 100px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
}

.ticket-form input,
.ticket-form select {
  flex: 1;
  height: 32px;
  padding: 4px 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.ticket-form textarea {
  flex: 1;
  height: 80px;
  padding: 4px 11px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.status-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.stop-btn {
  background-color: #ff4d4f;
  color: white;
}

.start-btn {
  background-color: #52c41a;
  color: white;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #1890ff;
  color: white;
}

/* 预约设置样式 */
.settings-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.card-header i {
  font-size: 24px;
  margin-right: 12px;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.card-content {
  padding: 20px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.divider {
  color: #999;
  margin: 0 10px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  color: #666;
  font-size: 14px;
}

.form-item select,
.form-item input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-item select:hover,
.form-item input:hover {
  border-color: #40a9ff;
}

.form-item select:focus,
.form-item input:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.number-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.ctrl-btn:hover {
  background: #f5f5f5;
  border-color: #40a9ff;
}

.unit {
  color: #666;
  margin-left: 8px;
}

.form-actions {
  text-align: center;
  margin-top: 40px;
}

.save-btn {
  padding: 12px 40px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s;
}

.save-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
}

.save-btn i {
  font-size: 20px;
}

/* 时间段设置样式优化 */
.timeslot-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 30px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.section-header i {
  font-size: 24px;
  margin-right: 12px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.timeslot-container {
  padding: 20px;
}

.timeslot-list {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.timeslot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.timeslot-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.slot-time select {
  width: 120px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.delete-slot {
  width: 36px;
  height: 36px;
  margin-left: 12px;
  padding: 0;
  border: none;
  background: #fff1f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff4d4f;
  transition: all 0.3s;
}

.delete-slot:hover {
  background: #ffccc7;
  transform: rotate(15deg);
}

.add-slot {
  width: 100%;
  padding: 16px;
  background: #f0f7ff;
  border: 2px dashed #91caff;
  border-radius: 8px;
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.add-slot:hover {
  background: #e6f4ff;
  border-color: #69b1ff;
}

.add-icon {
  font-size: 20px;
  font-weight: bold;
}

/* 保存按钮优化 */
.form-actions {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.save-btn {
  padding: 14px 50px;
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.save-btn i {
  font-size: 20px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-tag.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-tag.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}

.edit-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #40a9ff;
}

.delete-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: #ff7875;
}

.pagination {
  margin-top: 20px;
  padding: 15px 0;
  display: flex;
  justify-content: flex-end;
}

/* Element UI 分页器样式优化 */
:deep(.el-pagination) {
  font-weight: normal;
}

:deep(.el-pagination__sizes) {
  margin-right: 15px;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background-color: #1890ff;
  color: white;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled):hover) {
  color: #1890ff;
}

:deep(.el-select-dropdown__item.selected) {
  color: #1890ff;
}

.no-data-row {
  background: #fafafa;
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

.no-data span {
  font-size: 14px;
}

/* Element UI 样式覆盖 */
:deep(.el-dialog__body) {
  padding: 20px 20px 0;
}

:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style> 