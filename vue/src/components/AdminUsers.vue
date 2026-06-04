<template>
  <main class="account-page admin-page">
    <header class="account-topbar">
      <div>
        <p>ADMIN CONSOLE</p>
        <h1>数码产品配置对比系统 · 管理端</h1>
      </div>
      <div class="account-actions">
        <div class="identity">
          <span>管理员</span>
          <strong>{{ currentUser.account }}</strong>
        </div>
        <el-button icon="SwitchButton" @click="handleLogout">退出管理端</el-button>
      </div>
    </header>

    <section class="workspace">
      <div class="workspace-heading">
        <div>
          <p>用户管理</p>
          <h2>维护用户账号与状态</h2>
          <span>管理员可以新增、编辑、启用、禁用和删除普通用户。</span>
        </div>
        <div class="workspace-commands">
          <el-button icon="Refresh" :loading="loading" @click="fetchUsers">刷新</el-button>
          <el-button type="primary" icon="Plus" @click="openUserDialog('create')">新增用户</el-button>
        </div>
      </div>

      <div class="summary-strip">
        <div>
          <span>用户总数</span>
          <strong>{{ users.length }}</strong>
        </div>
        <div>
          <span>启用账号</span>
          <strong>{{ enabledUserCount }}</strong>
        </div>
        <div>
          <span>禁用账号</span>
          <strong>{{ disabledUserCount }}</strong>
        </div>
      </div>

      <div class="table-tool">
        <el-table v-loading="loading" :data="users" stripe>
          <el-table-column prop="id" label="编号" width="80" />
          <el-table-column prop="username" label="用户名" min-width="130" />
          <el-table-column prop="phone" label="手机号" min-width="140" />
          <el-table-column prop="email" label="邮箱" min-width="190" show-overflow-tooltip />
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="{ row }">
              {{ row.gender || '未设置' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link icon="Edit" @click="openUserDialog('edit', row)">编辑</el-button>
              <el-button type="danger" link icon="Delete" @click="handleDeleteUser(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog
      v-model="userDialogVisible"
      :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
      width="min(560px, 92vw)"
      :close-on-click-modal="false"
      @closed="resetUserDialog"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-position="top"
        class="dialog-form"
      >
        <div class="form-grid">
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="userForm.username" />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model.trim="userForm.phone" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="userForm.email" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="userForm.gender" placeholder="请选择性别" clearable>
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item :label="dialogMode === 'create' ? '密码' : '新密码'" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="dialogMode === 'create' ? '请输入密码' : '留空则不修改密码'"
            show-password
          />
        </el-form-item>

        <el-form-item label="账号状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script>
import http from '@/utils/http'
import { clearAuthSession, getAuthUser } from '@/utils/auth'

function emptyUserForm() {
  return {
    id: null,
    username: '',
    phone: '',
    email: '',
    gender: '',
    password: '',
    status: 1
  }
}

export default {
  name: 'AdminUsersPage',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (this.dialogMode === 'create' && !value) {
        callback(new Error('请输入密码'))
        return
      }

      if (value && (value.length < 6 || value.length > 16)) {
        callback(new Error('密码长度应为 6 至 16 个字符'))
        return
      }

      callback()
    }

    return {
      currentUser: getAuthUser() || {},
      users: [],
      loading: false,
      saving: false,
      userDialogVisible: false,
      dialogMode: 'create',
      userForm: emptyUserForm(),
      userRules: {
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
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    enabledUserCount() {
      return this.users.filter((user) => Number(user.status) === 1).length
    },
    disabledUserCount() {
      return this.users.filter((user) => Number(user.status) === 0).length
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async fetchUsers() {
      this.loading = true

      try {
        const response = await http.get('/users')
        this.users = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '用户列表加载失败'))
      } finally {
        this.loading = false
      }
    },
    openUserDialog(mode, user) {
      this.dialogMode = mode
      this.userForm = mode === 'edit'
        ? { ...emptyUserForm(), ...user, password: '' }
        : emptyUserForm()
      this.userDialogVisible = true
    },
    resetUserDialog() {
      this.userForm = emptyUserForm()

      this.$nextTick(() => {
        if (this.$refs.userForm) {
          this.$refs.userForm.clearValidate()
        }
      })
    },
    handleSaveUser() {
      this.$refs.userForm.validate(async (valid) => {
        if (!valid || this.saving) return

        this.saving = true

        try {
          const payload = {
            username: this.userForm.username,
            phone: this.userForm.phone,
            email: this.userForm.email,
            gender: this.userForm.gender,
            status: this.userForm.status
          }

          if (this.userForm.password) {
            payload.password = this.userForm.password
          }

          const response = this.dialogMode === 'create'
            ? await http.post('/users', payload)
            : await http.put(`/users/${this.userForm.id}`, payload)

          this.$message.success(response.data.message || '用户信息保存成功')
          this.userDialogVisible = false
          this.fetchUsers()
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '用户信息保存失败'))
        } finally {
          this.saving = false
        }
      })
    },
    async handleStatusChange(user) {
      try {
        const response = await http.patch(`/users/${user.id}/status`, {
          status: user.status
        })
        this.$message.success(response.data.message || '用户状态修改成功')
      } catch (error) {
        user.status = user.status === 1 ? 0 : 1
        this.$message.error(this.getErrorMessage(error, '用户状态修改失败'))
      }
    },
    handleDeleteUser(user) {
      this.$confirm(`确认删除用户“${user.username}”吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const response = await http.delete(`/users/${user.id}`)
          this.$message.success(response.data.message || '用户删除成功')
          this.fetchUsers()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '用户删除失败'))
          }
        })
    },
    handleLogout() {
      clearAuthSession()
      this.$router.push('/admin-login')
    }
  }
}
</script>
