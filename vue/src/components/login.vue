<template>
  <main class="login-page">
    <section class="login-form-panel">
      <div class="login-title">
        <el-icon :size="34"><UserFilled /></el-icon>
        <h1>这个是登录界面</h1>
        <p>请输入用户名或邮箱和密码</p>
      </div>

      <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名或邮箱" prop="account">
          <el-input
            v-model.trim="form.account"
            prefix-icon="User"
            placeholder="请输入用户名或邮箱"
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
          <router-link to="/forget">忘记密码</router-link>
        </div>

        <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>

      <div class="login-links">
        <router-link to="/register">注册账号</router-link>
        <span></span>
        <router-link to="/admin-login">管理员登录</router-link>
      </div>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'
import { saveAuthSession } from '@/utils/auth'

export default {
  name: 'LoginPage',
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
          { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度应为 6 至 16 个字符', trigger: 'blur' }
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
          const response = await http.post('/login', {
            username: this.form.account,
            password: this.form.password
          })
          const result = response.data

          saveAuthSession(result.data.token, result.data.user, this.form.remember)
          this.$message.success(result.message || '登录成功')
          this.$router.push(this.$route.query.redirect || '/user')
        } catch (error) {
          const data = error.response && error.response.data
          this.$message.error((data && data.message) || '登录失败，请检查账号和密码')
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

.login-options,
.login-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-options {
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

.login-links {
  justify-content: center;
  gap: 14px;
  margin-top: 22px;
}

.login-links span {
  width: 1px;
  height: 14px;
  background: #dcdfe6;
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
