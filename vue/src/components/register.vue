<template>
  <main class="login-page">
    <section class="login-form-panel register-form-panel">
      <div class="login-title">
        <el-icon :size="34"><UserFilled /></el-icon>
        <h1>这个是注册界面</h1>
        <p>请输入用户名、手机号、邮箱和密码</p>
      </div>

      <el-form
        ref="registerForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" prefix-icon="User" placeholder="2 至 16 个字符" clearable />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model.trim="form.phone" prefix-icon="Phone" placeholder="请输入 11 位手机号" clearable />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="form.email" prefix-icon="Message" placeholder="请输入邮箱" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            prefix-icon="Lock"
            placeholder="6 至 16 个字符"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            prefix-icon="Lock"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-button type="primary" class="login-button" :loading="loading" @click="handleRegister">
          注册
        </el-button>
      </el-form>

      <div class="login-links">
        <router-link to="/login">返回登录</router-link>
      </div>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'RegisterPage',
  data() {
    return {
      loading: false,
      form: {
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
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
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度应为 6 至 16 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }

      callback()
    },
    handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (!valid || this.loading) return

        this.loading = true

        try {
          const response = await http.post('/register', {
            username: this.form.username,
            phone: this.form.phone,
            email: this.form.email,
            password: this.form.password
          })

          this.$message.success(response.data.message || '注册成功')
          this.$router.push('/login')
        } catch (error) {
          const data = error.response && error.response.data
          this.$message.error((data && data.message) || '注册失败')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f5f7fa;
}

.login-form-panel {
  width: min(420px, 100%);
  padding: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(31, 45, 61, 0.08);
}

.register-form-panel {
  width: min(440px, 100%);
}

.login-title {
  margin-bottom: 28px;
  color: #303133;
  text-align: center;
}

.login-title .el-icon {
  color: #409eff;
}

.login-title h1 {
  margin: 12px 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.login-title p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-page a {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.login-page a:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
}

.login-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 22px;
}

@media (max-width: 480px) {
  .login-page {
    place-items: start center;
    padding: 48px 16px 24px;
  }

  .login-form-panel {
    padding: 24px;
  }
}
</style>
