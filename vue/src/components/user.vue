<template>
  <main class="mine-shell">
    <header class="mine-topbar">
      <div>
        <p>DEVICE COMPARE</p>
        <h1>数码产品配置对比系统</h1>
      </div>
      <div class="mine-topbar-actions">
        <el-button type="primary" icon="ShoppingCart" @click="$router.push('/products')">产品挑选</el-button>
        <el-button icon="SwitchButton" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <section class="mine-page">
      <section v-loading="loading" class="profile-card">
        <div class="profile-header">
          <div>
            <p>个人中心</p>
            <h2>我的账号</h2>
          </div>
          <div class="profile-avatar">{{ avatarText }}</div>
        </div>

        <div class="profile-info">
          <div v-for="field in profileFields" :key="field.label" class="profile-info-row">
            <span>{{ field.label }}</span>
            <strong>{{ field.value }}</strong>
          </div>
        </div>

        <div class="profile-actions">
          <el-button icon="Edit" @click="openProfileDialog">编辑资料</el-button>
          <el-button type="primary" icon="Lock" @click="openPasswordDialog">修改密码</el-button>
        </div>
      </section>

      <section class="feature-card">
        <div class="feature-head">
          <div>
            <p>我的设备</p>
            <h2>挑选和对比数码产品</h2>
          </div>
          <el-button type="primary" plain icon="ArrowRight" @click="$router.push('/products')">
            进入产品挑选
          </el-button>
        </div>

        <div class="feature-list">
          <article class="feature-row">
            <div class="feature-icon"><Search /></div>
            <div>
              <h3>筛选产品</h3>
              <p>按照分类、品牌、价格和关键词快速查找设备。</p>
            </div>
          </article>
          <article class="feature-row">
            <div class="feature-icon"><DataAnalysis /></div>
            <div>
              <h3>参数对比</h3>
              <p>最多同时选择 5 款产品，集中比较价格和核心参数。</p>
            </div>
          </article>
        </div>
      </section>

      <transition name="mine-modal">
        <div v-if="profileDialogVisible" class="mine-overlay" @click.self="closeProfileDialog">
          <div class="mine-dialog">
            <div class="dialog-head">
              <div>
                <p>ACCOUNT PROFILE</p>
                <h2>编辑个人资料</h2>
              </div>
              <el-button circle text icon="Close" title="关闭" @click="closeProfileDialog" />
            </div>

            <el-form
              ref="profileForm"
              :model="profileForm"
              :rules="profileRules"
              label-position="top"
              class="mine-form"
            >
              <div class="form-grid">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model.trim="profileForm.username" prefix-icon="User" />
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                  <el-input v-model.trim="profileForm.phone" prefix-icon="Phone" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model.trim="profileForm.email" prefix-icon="Message" />
                </el-form-item>

                <el-form-item label="性别" prop="gender">
                  <el-select v-model="profileForm.gender" placeholder="请选择性别" clearable>
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
              </div>

              <el-button type="primary" class="submit-button" :loading="saving" @click="handleSaveProfile">
                保存个人资料
              </el-button>
            </el-form>
          </div>
        </div>
      </transition>

      <transition name="mine-modal">
        <div v-if="passwordDialogVisible" class="mine-overlay" @click.self="closePasswordDialog">
          <div class="mine-dialog password-dialog">
            <div class="dialog-head">
              <div>
                <p>ACCOUNT SECURITY</p>
                <h2>修改密码</h2>
              </div>
              <el-button circle text icon="Close" title="关闭" @click="closePasswordDialog" />
            </div>

            <el-form
              ref="passwordForm"
              :model="passwordForm"
              :rules="passwordRules"
              label-position="top"
              class="mine-form"
            >
              <el-form-item label="新密码" prop="password">
                <el-input
                  v-model="passwordForm.password"
                  type="password"
                  prefix-icon="Lock"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  prefix-icon="Lock"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>

              <el-button type="primary" class="submit-button" :loading="saving" @click="handleSavePassword">
                保存新密码
              </el-button>
            </el-form>
          </div>
        </div>
      </transition>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'
import { clearAuthSession, getAuthUser, updateAuthUser } from '@/utils/auth'

function emptyProfileForm() {
  return {
    username: '',
    phone: '',
    email: '',
    gender: ''
  }
}

function emptyPasswordForm() {
  return {
    password: '',
    confirmPassword: ''
  }
}

export default {
  name: 'UserPage',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }

      callback()
    }

    return {
      currentUser: getAuthUser() || {},
      loading: false,
      saving: false,
      profileDialogVisible: false,
      passwordDialogVisible: false,
      profileForm: emptyProfileForm(),
      passwordForm: emptyPasswordForm(),
      profileRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 16, message: '用户名长度应为 2 至 16 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ]
      },
      passwordRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度应为 6 至 16 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    avatarText() {
      return String(this.currentUser.username || 'U').slice(0, 1).toUpperCase()
    },
    profileFields() {
      return [
        { label: '用户名', value: this.currentUser.username || '未设置' },
        { label: '手机号', value: this.currentUser.phone || '未设置' },
        { label: '邮箱', value: this.currentUser.email || '未设置' },
        { label: '性别', value: this.currentUser.gender || '未设置' }
      ]
    }
  },
  mounted() {
    this.fetchProfile()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async fetchProfile() {
      this.loading = true

      try {
        const response = await http.get('/users/me')
        this.currentUser = response.data.data
        updateAuthUser(this.currentUser)
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '个人信息加载失败'))
      } finally {
        this.loading = false
      }
    },
    openProfileDialog() {
      this.profileForm = {
        ...emptyProfileForm(),
        ...this.currentUser
      }
      this.profileDialogVisible = true
    },
    closeProfileDialog() {
      if (this.saving) return

      this.profileDialogVisible = false
      this.profileForm = emptyProfileForm()
      this.clearFormValidate('profileForm')
    },
    openPasswordDialog() {
      this.passwordForm = emptyPasswordForm()
      this.passwordDialogVisible = true
    },
    closePasswordDialog() {
      if (this.saving) return

      this.passwordDialogVisible = false
      this.passwordForm = emptyPasswordForm()
      this.clearFormValidate('passwordForm')
    },
    clearFormValidate(refName) {
      this.$nextTick(() => {
        if (this.$refs[refName]) {
          this.$refs[refName].clearValidate()
        }
      })
    },
    handleSaveProfile() {
      this.$refs.profileForm.validate(async (valid) => {
        if (!valid || this.saving) return

        const saved = await this.saveProfile({
          username: this.profileForm.username,
          phone: this.profileForm.phone,
          email: this.profileForm.email,
          gender: this.profileForm.gender
        }, '个人资料修改成功')

        if (saved) {
          this.profileDialogVisible = false
        }
      })
    },
    handleSavePassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid || this.saving) return

        const saved = await this.saveProfile({
          username: this.currentUser.username,
          phone: this.currentUser.phone,
          email: this.currentUser.email,
          gender: this.currentUser.gender,
          password: this.passwordForm.password
        }, '密码修改成功')

        if (saved) {
          this.passwordDialogVisible = false
          this.passwordForm = emptyPasswordForm()
        }
      })
    },
    async saveProfile(payload, successMessage) {
      this.saving = true

      try {
        const response = await http.put('/users/me', payload)
        this.currentUser = response.data.data
        updateAuthUser(this.currentUser)
        this.$message.success(response.data.message || successMessage)
        return true
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '个人信息修改失败'))
        return false
      } finally {
        this.saving = false
      }
    },
    handleLogout() {
      clearAuthSession()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.mine-shell {
  min-height: 100vh;
  padding: 28px;
  background: #edf3f7;
  color: #152033;
}

.mine-topbar,
.mine-page {
  width: min(1120px, 100%);
  margin-right: auto;
  margin-left: auto;
}

.mine-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #cad8e3;
}

.mine-topbar p,
.profile-header p,
.feature-head p,
.dialog-head p {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.mine-topbar h1 {
  margin: 0;
  font-family: Georgia, "Microsoft YaHei", serif;
  font-size: 26px;
  font-weight: 500;
}

.mine-topbar-actions,
.profile-actions,
.feature-head {
  display: flex;
  align-items: center;
}

.mine-topbar-actions {
  gap: 10px;
}

.mine-page {
  display: grid;
  gap: 22px;
}

.profile-card,
.feature-card {
  padding: 24px;
  border: 1px solid #dbe7f3;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 50px rgba(45, 73, 112, 0.08);
}

.profile-header,
.feature-head {
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.profile-header {
  display: flex;
  align-items: center;
}

.profile-header h2,
.feature-head h2 {
  margin: 0;
  color: #101827;
  font-size: 28px;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profile-info-row {
  padding: 16px;
  border: 1px solid #eef3f8;
  border-radius: 8px;
  background: #fff;
}

.profile-info-row span {
  display: block;
  margin-bottom: 8px;
  color: #8090a6;
  font-size: 13px;
}

.profile-info-row strong {
  color: #253247;
  font-size: 16px;
  word-break: break-all;
}

.profile-actions {
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #eef3f8;
  border-radius: 8px;
  background: #fff;
}

.feature-icon {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
}

.feature-icon :deep(svg) {
  width: 21px;
  height: 21px;
}

.feature-row h3 {
  margin: 0 0 6px;
  color: #172033;
  font-size: 16px;
}

.feature-row p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.mine-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.52);
}

.mine-dialog {
  width: min(620px, 100%);
  padding: 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.24);
}

.password-dialog {
  width: min(460px, 100%);
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.dialog-head h2 {
  margin: 0;
  color: #101827;
  font-size: 24px;
}

.mine-form,
.submit-button {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.mine-form .el-select {
  width: 100%;
}

.submit-button {
  height: 40px;
}

.mine-modal-enter-active,
.mine-modal-leave-active {
  transition: opacity 0.2s ease;
}

.mine-modal-enter-active .mine-dialog {
  animation: mine-dialog-in 0.25s ease both;
}

.mine-modal-enter-from,
.mine-modal-leave-to {
  opacity: 0;
}

@keyframes mine-dialog-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 720px) {
  .mine-shell {
    padding: 18px;
  }

  .mine-topbar,
  .feature-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .mine-topbar-actions,
  .profile-actions {
    width: 100%;
  }

  .mine-topbar-actions .el-button,
  .profile-actions .el-button {
    flex: 1;
  }

  .profile-info,
  .feature-list,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .profile-card,
  .feature-card,
  .mine-dialog {
    padding: 20px;
  }

  .mine-overlay {
    align-items: flex-end;
    padding: 14px;
  }
}
</style>
