<template>
  <main class="auth-page">
    <section class="auth-visual" aria-label="系统介绍">
      <div class="auth-brand">
        <span class="auth-brand-mark">DC</span>
        <span>数码产品配置对比系统</span>
      </div>
      <div class="auth-visual-copy">
        <p>ADMIN CONSOLE</p>
        <h1>管理用户数据与账号状态</h1>
        <span>管理员登录后可以查看用户列表，并完成新增、编辑、启用、禁用和删除操作。</span>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap">
        <header class="auth-heading">
          <p>管理员入口</p>
          <h2>后台登录</h2>
          <span>请使用管理员账号和密码登录。</span>
        </header>

        <el-form
          ref="loginForm"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="管理员账号" prop="account">
            <el-input v-model.trim="form.account" prefix-icon="Avatar" placeholder="请输入管理员账号" clearable />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" prefix-icon="Lock" placeholder="请输入密码" show-password />
          </el-form-item>

          <div class="auth-options">
            <el-checkbox v-model="form.remember">记住登录</el-checkbox>
            <router-link class="auth-link" to="/login">普通用户登录</router-link>
          </div>

          <el-button type="primary" class="auth-submit" :loading="loading" @click="handleLogin">
            管理员登录
          </el-button>
        </el-form>
      </div>
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
