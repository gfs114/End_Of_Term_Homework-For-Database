<template>
  <main class="login-page">
    <section class="login-form-panel">
      <div class="login-title">
        <el-icon :size="34"><Avatar /></el-icon>
        <h1>这个是管理员登录界面</h1>
        <p>请输入管理员账号和密码</p>
      </div>

      <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="管理员账号" prop="account">
          <el-input
            v-model.trim="form.account"
            prefix-icon="Avatar"
            placeholder="请输入管理员账号"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            prefix-icon="Lock"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="form.remember">记住登录</el-checkbox>
          <router-link to="/login">普通用户登录</router-link>
        </div>

        <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
          管理员登录
        </el-button>
      </el-form>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'
import { saveAuthSession } from '@/utils/auth'

export default {
  name: 'AdminLoginPage',
  data() {
    return {
      loading: false,
      form: {
        account: '',
        password: '',
        remember: false
      },
      rules: {
        account: [
          { required: true, message: '请输入管理员账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid || this.loading) return

        this.loading = true

        try {
          const response = await http.post('/admin/login', {
            account: this.form.account,
            password: this.form.password
          })
          const result = response.data

          saveAuthSession(result.data.token, result.data.user, this.form.remember)
          this.$message.success(result.message || '管理员登录成功')
          this.$router.push('/admin/users')
        } catch (error) {
          const data = error.response && error.response.data
          this.$message.error((data && data.message) || '管理员登录失败')
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
  width: min(400px, 100%);
  padding: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(31, 45, 61, 0.08);
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

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 20px;
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
