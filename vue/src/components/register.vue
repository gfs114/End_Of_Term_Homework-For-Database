<template>
  <main class="auth-page">
    <section class="auth-visual" aria-label="系统介绍">
      <div class="auth-brand">
        <span class="auth-brand-mark">DC</span>
        <span>数码产品配置对比系统</span>
      </div>
      <div class="auth-visual-copy">
        <p>CREATE ACCOUNT</p>
        <h1>建立你的数码产品资料库</h1>
        <span>注册后即可保存个人信息，并为后续收藏、评论和设备管理做好准备。</span>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap auth-form-wrap--wide">
        <header class="auth-heading">
          <p>普通用户注册</p>
          <h2>创建账号</h2>
          <span>请填写与数据库用户表一致的基本信息。</span>
        </header>

        <el-form
          ref="registerForm"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form"
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
            <el-input v-model="form.password" type="password" prefix-icon="Lock" placeholder="6 至 16 个字符" show-password />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" prefix-icon="Lock" placeholder="请再次输入密码" show-password />
          </el-form-item>

          <el-button type="primary" class="auth-submit" :loading="loading" @click="handleRegister">
            注册
          </el-button>
        </el-form>

        <div class="auth-footer">
          已有账号？
          <router-link class="auth-link" to="/login">返回登录</router-link>
        </div>
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
