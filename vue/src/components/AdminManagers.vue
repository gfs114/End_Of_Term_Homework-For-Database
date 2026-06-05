<template>
  <main class="admin-managers-page">
    <section class="admin-managers-card">
      <div class="content-heading">
        <div>
          <h1>普通管理员管理</h1>
          <p>维护普通管理员账号、邮箱、状态和登录密码。</p>
        </div>
        <div class="content-commands">
          <el-button icon="Refresh" :loading="loading" @click="fetchManagers">刷新</el-button>
          <el-button type="primary" icon="Plus" @click="openManagerDialog('create')">新增普通管理员</el-button>
        </div>
      </div>

      <div class="summary-strip">
        <div>
          <span>普通管理员总数</span>
          <strong>{{ managers.length }}</strong>
        </div>
        <div>
          <span>启用账号</span>
          <strong>{{ enabledManagerCount }}</strong>
        </div>
        <div>
          <span>禁用账号</span>
          <strong>{{ disabledManagerCount }}</strong>
        </div>
      </div>

      <div class="table-tool">
        <el-table v-loading="loading" :data="managers" stripe>
          <el-table-column prop="id" label="编号" width="90" />
          <el-table-column prop="account" label="管理员账号" min-width="160" />
          <el-table-column prop="email" label="邮箱" min-width="220" show-overflow-tooltip />
          <el-table-column prop="role" label="角色" width="130" />
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
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link icon="Edit" @click="openManagerDialog('edit', row)">编辑</el-button>
              <el-button type="danger" link icon="Delete" @click="handleDeleteManager(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog
      v-model="managerDialogVisible"
      :title="dialogMode === 'create' ? '新增普通管理员' : '编辑普通管理员'"
      width="min(540px, 92vw)"
      :close-on-click-modal="false"
      @closed="resetManagerDialog"
    >
      <el-form
        ref="managerForm"
        :model="managerForm"
        :rules="managerRules"
        label-position="top"
        class="dialog-form"
      >
        <el-form-item label="管理员账号" prop="account">
          <el-input v-model.trim="managerForm.account" placeholder="请输入管理员账号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="managerForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item :label="dialogMode === 'create' ? '登录密码' : '新密码'" prop="password">
          <el-input
            v-model="managerForm.password"
            type="password"
            :placeholder="dialogMode === 'create' ? '请输入登录密码' : '留空则不修改密码'"
            show-password
          />
        </el-form-item>

        <el-form-item label="账号状态" prop="status">
          <el-radio-group v-model="managerForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="managerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveManager">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script>
import http from '@/utils/http'

function emptyManagerForm() {
  return {
    id: null,
    account: '',
    email: '',
    password: '',
    status: 1
  }
}

export default {
  name: 'AdminManagersPage',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (this.dialogMode === 'create' && !value) {
        callback(new Error('请输入登录密码'))
        return
      }

      if (value && (value.length < 6 || value.length > 16)) {
        callback(new Error('密码长度应为 6 至 16 个字符'))
        return
      }

      callback()
    }

    return {
      managers: [],
      loading: false,
      saving: false,
      managerDialogVisible: false,
      dialogMode: 'create',
      managerForm: emptyManagerForm(),
      managerRules: {
        account: [
          { required: true, message: '请输入管理员账号', trigger: 'blur' },
          { min: 3, max: 30, message: '管理员账号长度应为 3 至 30 个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    enabledManagerCount() {
      return this.managers.filter((manager) => Number(manager.status) === 1).length
    },
    disabledManagerCount() {
      return this.managers.filter((manager) => Number(manager.status) === 0).length
    }
  },
  mounted() {
    this.fetchManagers()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async fetchManagers() {
      this.loading = true

      try {
        const response = await http.get('/admin/managers')
        this.managers = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '普通管理员列表加载失败'))
      } finally {
        this.loading = false
      }
    },
    openManagerDialog(mode, manager) {
      this.dialogMode = mode
      this.managerForm = mode === 'edit'
        ? { ...emptyManagerForm(), ...manager, password: '' }
        : emptyManagerForm()
      this.managerDialogVisible = true
    },
    resetManagerDialog() {
      this.managerForm = emptyManagerForm()

      this.$nextTick(() => {
        if (this.$refs.managerForm) {
          this.$refs.managerForm.clearValidate()
        }
      })
    },
    handleSaveManager() {
      this.$refs.managerForm.validate(async (valid) => {
        if (!valid || this.saving) return

        this.saving = true

        try {
          const payload = {
            account: this.managerForm.account,
            email: this.managerForm.email,
            status: this.managerForm.status
          }

          if (this.managerForm.password) {
            payload.password = this.managerForm.password
          }

          const response = this.dialogMode === 'create'
            ? await http.post('/admin/managers', payload)
            : await http.put(`/admin/managers/${this.managerForm.id}`, payload)

          this.$message.success(response.data.message || '普通管理员保存成功')
          this.managerDialogVisible = false
          this.fetchManagers()
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '普通管理员保存失败'))
        } finally {
          this.saving = false
        }
      })
    },
    async handleStatusChange(manager) {
      try {
        const response = await http.patch(`/admin/managers/${manager.id}/status`, {
          status: manager.status
        })
        this.$message.success(response.data.message || '普通管理员状态修改成功')
      } catch (error) {
        manager.status = manager.status === 1 ? 0 : 1
        this.$message.error(this.getErrorMessage(error, '普通管理员状态修改失败'))
      }
    },
    handleDeleteManager(manager) {
      this.$confirm(`确认直接删除普通管理员“${manager.account}”吗？相关管理记录会一起删除。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const response = await http.delete(`/admin/managers/${manager.id}`)
          this.$message.success(response.data.message || '普通管理员删除成功')
          this.fetchManagers()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '普通管理员删除失败'))
          }
        })
    }
  }
}
</script>

<style scoped>
.admin-managers-page {
  min-height: calc(100vh - 96px);
}

.admin-managers-card {
  min-height: calc(100vh - 96px);
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.content-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef0f3;
}

.content-heading h1 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.content-heading p {
  margin: 7px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.content-commands {
  display: flex;
  gap: 10px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.summary-strip div {
  padding: 15px 18px;
  border-right: 1px solid #e5e7eb;
}

.summary-strip div:last-child {
  border-right: 0;
}

.summary-strip span {
  display: block;
  margin-bottom: 7px;
  color: #6b7280;
  font-size: 12px;
}

.summary-strip strong {
  color: #111827;
  font-size: 22px;
}

.table-tool {
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.dialog-form {
  width: 100%;
}

.dialog-form .el-input {
  width: 100%;
}

@media (max-width: 720px) {
  .admin-managers-card {
    padding: 14px;
  }

  .content-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .content-commands {
    width: 100%;
  }

  .content-commands .el-button {
    flex: 1;
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }

  .summary-strip div {
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .summary-strip div:last-child {
    border-bottom: 0;
  }
}
</style>
