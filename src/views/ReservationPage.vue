<template>
  <div class="reservation-page">
    <h2>门票预约</h2>
    
    <!-- 预约步骤 -->
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="选择日期"></el-step>
      <el-step title="选择门票"></el-step>
      <el-step title="填写信息"></el-step>
      <el-step title="支付"></el-step>
    </el-steps>

    <!-- 第一步：选择参观日期 -->
    <div v-show="currentStep === 0" class="step-content">
      <h3>选择参观日期</h3>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择参观日期"
        :picker-options="datePickerOptions"
        value-format="yyyy-MM-dd"
        @change="handleDateChange"
      >
      </el-date-picker>
    </div>

    <!-- 第二步：选择门票 -->
    <div v-show="currentStep === 1" class="step-content">
      <h3>选择门票类型</h3>
      <div class="ticket-selection">
        <el-form :model="ticketForm" label-width="100px">
          <el-form-item label="门票类型">
            <el-select 
              v-model="ticketForm.ticketId" 
              placeholder="请选择门票类型"
              @change="handleTicketChange"
            >
              <el-option
                v-for="ticket in tickets"
                :key="ticket.id"
                :label="ticket.ticketType"
                :value="ticket.id"
                :disabled="ticket.status === 0 || ticket.availableStock <= 0"
              >
                <span>{{ ticket.ticketType }}</span>
                <span style="float: right; color: #f56c6c;">¥{{ ticket.price }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="票价">
            <span class="price">¥{{ selectedTicketPrice }}</span>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 第三步：选择时间段和填写信息 -->
    <div v-show="currentStep === 2" class="step-content">
      <h3>选择参观时间段</h3>
      <el-radio-group v-model="selectedTimeSlot" class="time-slots">
        <el-radio 
          v-for="period in parkConfig.openingPeriods" 
          :key="period.id" 
          :label="period.id"
        >
          {{ period.startTime.substring(0, 5) }} - {{ period.endTime.substring(0, 5) }}
        </el-radio>
      </el-radio-group>

      <h3>游客信息</h3>
      <div class="visitor-info">
        <el-form 
          ref="visitorForm" 
          :model="visitorInfo"
          :rules="visitorRules"
          label-width="100px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="visitorInfo.name" placeholder="请输入真实姓名"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="visitorInfo.idCard" placeholder="请输入身份证号"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="visitorInfo.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 第四步：支付 -->
    <div v-show="currentStep === 3" class="step-content">
      <h3>确认支付信息</h3>
      <el-descriptions border>
        <el-descriptions-item label="参观日期">{{ selectedDate }}</el-descriptions-item>
        <el-descriptions-item label="参观时间段">
          {{ getTimeSlotText(selectedTimeSlot) }}
        </el-descriptions-item>
        <el-descriptions-item label="门票类型">{{ selectedTicketType }}</el-descriptions-item>
        <el-descriptions-item label="票价">¥{{ selectedTicketPrice }}</el-descriptions-item>
        <el-descriptions-item label="游客姓名">{{ visitorInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ visitorInfo.idCard }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ visitorInfo.phone }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 底部按钮 -->
    <div class="step-actions">
      <el-button 
        v-if="currentStep > 0" 
        @click="currentStep--"
      >上一步</el-button>
      <el-button 
        type="primary" 
        :disabled="!canProceed"
        @click="handleNext"
      >{{ currentStep === 3 ? '立即支付' : '下一步' }}</el-button>
    </div>

    <!-- 支付弹窗 -->
    <el-dialog
      title="微信支付"
      :visible.sync="paymentDialogVisible"
      :close-on-click-modal="false"
      width="320px"
      center
      custom-class="wechat-pay-dialog"
    >
      <div class="wechat-payment">
        <div class="payment-header">
          <img src="https://via.placeholder.com/30x30/42b983/ffffff?text=门" class="merchant-logo">
          <span class="merchant-name">欢乐谷</span>
        </div>
        
        <div class="payment-amount">
          <small>¥</small>
          <span>{{ selectedTicketPrice }}</span>
        </div>
        
        <div class="payment-qrcode">
          <img src="https://via.placeholder.com/200x200/42b983/ffffff?text=微信支付" alt="微信支付">
          <p>请使用微信扫一扫</p>
          <p>扫描二维码完成支付</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ReservationPage',
  data() {
    // 身份证号验证规则
    const validateIdCard = (rule, value, callback) => {
      const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      if (!reg.test(value)) {
        callback(new Error('请输入正确的身份证号'))
      } else {
        callback()
      }
    }
    
    return {
      currentStep: 0,
      parkConfig: {
        openTime: '',
        closeTime: '',
        dailyLimit: 0,
        maxAdvanceDays: 7,
        openingPeriods: []
      },
      tickets: [],
      selectedDate: '',
      selectedTimeSlot: '',
      ticketForm: {
        ticketId: ''
      },
      visitorInfo: {
        name: '',
        idCard: '',
        phone: ''
      },
      visitorRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { validator: validateIdCard, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      },
      submitting: false,
      datePickerOptions: {
        disabledDate(time) {
          // 今天之前的日期不能选
          const today = new Date(new Date().setHours(0, 0, 0, 0))
          // 最大可预约天数限制
          const maxDate = new Date(today)
          maxDate.setDate(today.getDate() + (this.parkConfig.maxAdvanceDays || 7))
          
          return time.getTime() < today.getTime() || time.getTime() > maxDate.getTime()
        }
      },
      paymentDialogVisible: false,  // 支付弹窗显示状态
      paymentQRCode: '',           // 支付二维码
      orderId: ''                  // 订单ID
    }
  },
  computed: {
    selectedTicketType() {
      const ticket = this.tickets.find(t => t.id === this.ticketForm.ticketId)
      return ticket ? ticket.ticketType : ''
    },
    selectedTicketPrice() {
      const ticket = this.tickets.find(t => t.id === this.ticketForm.ticketId)
      return ticket ? ticket.price : 0
    },
    canProceed() {
      switch (this.currentStep) {
        case 0:
          return !!this.selectedDate
        case 1:
          return !!this.ticketForm.ticketId
        case 2:
          return !!this.selectedTimeSlot
        case 3:
          return true
        default:
          return false
      }
    }
  },
  methods: {
    // 获取预约配置
    async fetchParkConfig() {
      try {
        const response = await request.get('/user/park/config/1')
        if (response.code === 1) {
          this.parkConfig = response.data
          // 更新日期选择器的配置
          this.datePickerOptions.disabledDate = (time) => {
            const today = new Date(new Date().setHours(0, 0, 0, 0))
            const maxDate = new Date(today)
            maxDate.setDate(today.getDate() + (this.parkConfig.maxAdvanceDays || 7))
            
            return time.getTime() < today.getTime() || time.getTime() > maxDate.getTime()
          }
        }
      } catch (error) {
        console.error('获取园区配置失败：', error)
        this.$message.error('获取园区配置失败')
      }
    },

    // 获取门票列表
    async fetchTickets() {
      try {
        const response = await request.get('/user/ticket/all')
        if (response.code === 1) {
          this.tickets = response.data
        }
      } catch (error) {
        this.$message.error('获取门票列表失败')
      }
    },

    handleDateChange() {
      // 重置后续选择
      this.selectedTimeSlot = ''
      this.ticketForm.ticketId = ''
    },

    handleTicketChange() {
      // 可以在这里添加一些额外的处理逻辑
    },

    getTimeSlotText(slotId) {
      const period = this.parkConfig.openingPeriods.find(p => p.id === slotId)
      if (period) {
        return `${period.startTime.substring(0, 5)} - ${period.endTime.substring(0, 5)}`
      }
      return ''
    },

    async handleNext() {
      if (this.currentStep === 2) {
        // 验证表单
        try {
          await this.$refs.visitorForm.validate()
          this.currentStep++
        } catch (error) {
          return
        }
      } else if (this.currentStep === 3) {
        // 显示确认信息弹窗
        this.$confirm(`
          <div class="confirm-info">
            <h3>请确认预约信息</h3>
            <p><label>参观日期：</label>${this.selectedDate}</p>
            <p><label>参观时间：</label>${this.getTimeSlotText(this.selectedTimeSlot)}</p>
            <p><label>门票类型：</label>${this.selectedTicketType}</p>
            <p><label>游客姓名：</label>${this.visitorInfo.name}</p>
            <p><label>身份证号：</label>${this.visitorInfo.idCard}</p>
            <p><label>手机号码：</label>${this.visitorInfo.phone}</p>
            <p class="price"><label>支付金额：</label><span>¥${this.selectedTicketPrice}</span></p>
          </div>
        `, '确认支付', {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          customClass: 'payment-confirm-dialog'
        }).then(async () => {
          try {
            this.submitting = true
            const response = await request.post('/user/reservation/create', {
              visitDate: this.selectedDate,
              visitTime: this.getTimeSlotText(this.selectedTimeSlot),
              ticketType: this.selectedTicketType,
              visitorName: this.visitorInfo.name,
              identityCardNumber: this.visitorInfo.idCard,
              phoneNumber: this.visitorInfo.phone,
              paymentAmount: Number(this.selectedTicketPrice),
              status: 1
            })

            if (response.code === 1) {
              this.$message.success('预约成功')
              this.$router.push('/profile')  // 直接跳转到个人中心
            } else {
              this.$message.error(response.msg || '创建预约失败')
            }
          } catch (error) {
            console.error('预约失败：', error)
            this.$message.error('预约失败，请重试')
          } finally {
            this.submitting = false
          }
        }).catch(() => {
          this.$message.info('已取消支付')
        })
      } else {
        this.currentStep++
      }
    },

    // 确认支付
    async confirmPayment() {
      try {
        const payResponse = await request.post(`/user/reservation/pay/${this.orderId}`)
        if (payResponse.code === 1) {
          this.$message.success('支付成功')
          this.paymentDialogVisible = false
          this.$router.push('/profile')  // 跳转到个人中心
        } else {
          this.$message.error(payResponse.msg || '支付失败')
        }
      } catch (error) {
        console.error('支付失败：', error)
        this.$message.error('支付失败，请重试')
      }
    },

    // 取消支付
    cancelPayment() {
      this.paymentDialogVisible = false
      this.$message.warning('您已取消支付')
    }
  },
  mounted() {
    this.fetchParkConfig()
    this.fetchTickets()
  }
}
</script>

<style scoped>
.reservation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.step-content {
  margin: 30px 0;
  min-height: 300px;
}

.ticket-selection {
  max-width: 500px;
  margin: 20px auto;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 20px 0;
}

.visitor-info {
  max-width: 500px;
  margin: 20px auto;
}

.step-actions {
  margin-top: 30px;
  text-align: center;
}

.qr-code {
  text-align: center;
  margin-top: 20px;
}

/* 微信支付弹窗样式 */
.wechat-pay-dialog {
  border-radius: 8px;
}

.wechat-pay-dialog .el-dialog__header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.wechat-pay-dialog .el-dialog__title {
  font-size: 16px;
  color: #333;
}

.wechat-pay-dialog .el-dialog__headerbtn {
  top: 16px;
}

.wechat-pay-dialog .el-dialog__body {
  padding: 0;
}

.wechat-payment {
  background: #fff;
}

.payment-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.merchant-logo {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.merchant-name {
  font-size: 14px;
  color: #333;
}

.payment-amount {
  padding: 20px;
  text-align: center;
  font-weight: bold;
  color: #000;
}

.payment-amount small {
  font-size: 20px;
  margin-right: 4px;
}

.payment-amount span {
  font-size: 32px;
}

.payment-qrcode {
  padding: 20px;
  text-align: center;
  background: #f8f8f8;
}

.payment-qrcode img {
  width: 200px;
  height: 200px;
  margin-bottom: 15px;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
}

.payment-qrcode p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

/* 移除底部按钮 */
.wechat-pay-dialog .el-dialog__footer {
  display: none;
}

/* 确认信息弹窗样式 */
.payment-confirm-dialog {
  max-width: 500px;
}

.payment-confirm-dialog .confirm-info {
  padding: 20px;
}

.payment-confirm-dialog .confirm-info h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
  text-align: center;
}

.payment-confirm-dialog .confirm-info p {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
}

.payment-confirm-dialog .confirm-info label {
  color: #666;
  min-width: 80px;
}

.payment-confirm-dialog .confirm-info .price {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.payment-confirm-dialog .confirm-info .price span {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}
</style> 