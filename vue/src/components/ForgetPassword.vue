<template>
  <main class="auth-page">
    <section class="auth-visual" aria-label="系统介绍">
      <div class="auth-brand">
        <span class="auth-brand-mark">DC</span>
        <span>数码产品配置对比系统</span>
      </div>
      <div class="auth-visual-copy">
        <p>PASSWORD RESET</p>
        <h1>重新设置你的登录密码</h1>
        <span>课程演示环境中，可通过用户名或邮箱定位账号并重置密码。</span>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap">
        <header class="auth-heading">
          <p>找回账号</p>
          <h2>重置密码</h2>
          <span>请输入注册时使用的用户名或邮箱。</span>
        </header>

        <el-form
          ref="forgetForm"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form"
          @keyup.enter="handleResetPassword"
        >
          <el-form-item label="用户名或邮箱" prop="account">
            <el-input v-model.trim="form.account" prefix-icon="User" placeholder="请输入用户名或邮箱" clearable />
          </el-form-item>

          <el-form-item label="新密码" prop="password">
            <el-input v-model="form.password" type="password" prefix-icon="Lock" placeholder="6 至 16 个字符" show-password />
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" prefix-icon="Lock" placeholder="请再次输入新密码" show-password />
          </el-form-item>

          <el-button type="primary" class="auth-submit" :loading="loading" @click="handleResetPassword">
            重置密码
          </el-button>
        </el-form>

        <div class="auth-footer">
          想起密码了？
          <router-link class="auth-link" to="/login">返回登录</router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'ForgetPasswordPage',
  data() {
    return {
      loading: false,
      form: {
        account: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        account: [
          { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度应为 6 至 16 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error('两次输入的新密码不一致'))
        return
      }

      callback()
    },
    handleResetPassword() {
      this.$refs.forgetForm.validate(async (valid) => {
        if (!valid || this.loading) return

        this.loading = true

        try {
          const response = await http.post('/reset-password', {
            account: this.form.account,
            password: this.form.password
          })

          this.$message.success(response.data.message || '密码重置成功')
          this.$router.push('/login')
        } catch (error) {
          const data = error.response && error.response.data
          this.$message.error((data && data.message) || '密码重置失败')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>
