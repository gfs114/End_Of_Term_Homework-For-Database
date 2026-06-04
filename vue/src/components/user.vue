<template>
  <main class="account-page">
    <header class="account-topbar">
      <div>
        <p>DEVICE COMPARE</p>
        <h1>数码产品配置对比系统 · 用户端</h1>
      </div>
      <div class="account-actions">
        <el-button type="primary" icon="ShoppingCart" @click="$router.push('/products')">产品挑选</el-button>
        <div class="identity">
          <span>普通用户</span>
          <strong>{{ currentUser.username }}</strong>
        </div>
        <el-button icon="SwitchButton" @click="handleLogout">退出用户端</el-button>
      </div>
    </header>

    <section class="workspace profile-workspace">
      <div class="workspace-heading">
        <div>
          <p>个人资料</p>
          <h2>查看并修改自己的账号信息</h2>
          <span>普通用户只能访问当前登录账号，无法读取或管理其他用户。</span>
        </div>
      </div>

      <el-form
        ref="profileForm"
        v-loading="loading"
        :model="profileForm"
        :rules="profileRules"
        label-position="top"
        class="profile-form"
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

        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="profileForm.password"
            type="password"
            prefix-icon="Lock"
            placeholder="留空则不修改密码"
            show-password
          />
        </el-form-item>

        <el-button type="primary" icon="Check" :loading="saving" @click="handleSaveProfile">
          保存个人资料
        </el-button>
      </el-form>
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
    gender: '',
    password: ''
  }
}

export default {
  name: 'UserPage',
  data() {
    const validateOptionalPassword = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (value.length < 6 || value.length > 16) {
        callback(new Error('密码长度应为 6 至 16 个字符'))
        return
      }

      callback()
    }

    return {
      currentUser: getAuthUser() || {},
      loading: false,
      saving: false,
      profileForm: emptyProfileForm(),
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
        ],
        password: [
          { validator: validateOptionalPassword, trigger: 'blur' }
        ]
      }
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
        const user = response.data.data

        this.currentUser = user
        updateAuthUser(user)
        this.profileForm = {
          ...emptyProfileForm(),
          ...user,
          password: ''
        }
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '个人信息加载失败'))
      } finally {
        this.loading = false
      }
    },
    handleSaveProfile() {
      this.$refs.profileForm.validate(async (valid) => {
        if (!valid || this.saving) return

        this.saving = true

        try {
          const payload = {
            username: this.profileForm.username,
            phone: this.profileForm.phone,
            email: this.profileForm.email,
            gender: this.profileForm.gender
          }

          if (this.profileForm.password) {
            payload.password = this.profileForm.password
          }

          const response = await http.put('/users/me', payload)
          const user = response.data.data

          this.currentUser = user
          updateAuthUser(user)
          this.profileForm.password = ''
          this.$message.success(response.data.message || '个人信息修改成功')
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '个人信息修改失败'))
        } finally {
          this.saving = false
        }
      })
    },
    handleLogout() {
      clearAuthSession()
      this.$router.push('/login')
    }
  }
}
</script>
