<template>
  <main class="admin-products-page">
    <section class="admin-products-card">
      <div class="content-heading">
        <div>
          <h1>{{ categoryName }}设备信息</h1>
          <p>{{ isSuperAdmin ? `可新增、编辑、启禁和直接删除${categoryName}设备。` : `可新增、编辑和启禁${categoryName}设备，直接删除仅超级管理员可用。` }}</p>
        </div>
        <div class="content-commands">
          <el-button icon="Refresh" :loading="loading" @click="loadPage">刷新</el-button>
          <el-button type="primary" icon="Plus" @click="openProductDialog('create')">新增{{ categoryName }}</el-button>
        </div>
      </div>

      <div class="summary-strip">
        <div>
          <span>{{ categoryName }}总数</span>
          <strong>{{ products.length }}</strong>
        </div>
        <div>
          <span>启用{{ categoryName }}</span>
          <strong>{{ enabledProductCount }}</strong>
        </div>
        <div>
          <span>禁用{{ categoryName }}</span>
          <strong>{{ disabledProductCount }}</strong>
        </div>
      </div>

      <div class="filter-row">
        <el-input
          v-model.trim="filters.keyword"
          prefix-icon="Search"
          placeholder="搜索设备名称或品牌"
          clearable
        />
        <el-select
          v-model="filters.brandIds"
          class="brand-select"
          placeholder="全部品牌"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        >
          <el-option
            v-for="brand in availableBrands"
            :key="brand.id"
            :label="brand.name"
            :value="brand.id"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
      </div>

      <div class="table-tool">
        <el-table v-loading="loading" :data="pagedProducts" stripe>
          <el-table-column label="设备" min-width="220">
            <template #default="{ row }">
              <div class="device-cell">
                <div class="device-image">
                  <el-icon><Monitor /></el-icon>
                  <img
                    v-if="row.imageUrl"
                    :src="assetUrl(row.imageUrl)"
                    :alt="row.name"
                    @error="handleImageError"
                  >
                </div>
                <div>
                  <strong>{{ row.name }}</strong>
                  <span>{{ row.brandName }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="120">
            <template #default="{ row }">
              {{ priceText(row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="设备参数" min-width="280" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link icon="Edit" @click="openProductDialog('edit', row)">编辑</el-button>
              <el-button type="success" link icon="SetUp" @click="openSpecDialog(row)">配置</el-button>
              <el-button type="warning" link icon="Picture" @click="openImageDialog(row)">图片</el-button>
              <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="handleDeleteProduct(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        v-if="filteredProducts.length > pageSize"
        v-model:current-page="currentPage"
        class="table-pagination"
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="filteredProducts.length"
      />
    </section>

    <el-dialog
      v-model="productDialogVisible"
      :title="dialogMode === 'create' ? `新增${categoryName}` : `编辑${categoryName}`"
      width="min(820px, 94vw)"
      :close-on-click-modal="false"
      @closed="resetProductDialog"
    >
      <el-form
        ref="productForm"
        :model="productForm"
        :rules="productRules"
        label-position="top"
        class="dialog-form"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="productForm.name" placeholder="请输入设备名称" />
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="设备分类" prop="categoryId">
            <el-input :model-value="categoryName" disabled />
          </el-form-item>

          <el-form-item label="设备品牌" prop="brandId">
            <el-select v-model="productForm.brandId" placeholder="请选择品牌" filterable>
              <el-option
                v-for="brand in brands"
                :key="brand.id"
                :label="brand.name"
                :value="brand.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备价格" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2" :step="100" />
          </el-form-item>

          <el-form-item label="设备状态" prop="status">
            <el-radio-group v-model="productForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-form-item label="设备参数" prop="description">
          <el-input
            v-model.trim="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="例如：处理器：骁龙 8；电池容量：5000mAh"
          />
        </el-form-item>

        <el-form-item label="产品图片">
          <div class="product-image-editor">
            <div class="product-image-toolbar">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                :on-change="handleProductImageFileChange"
              >
                <el-button icon="Upload">加入图片</el-button>
              </el-upload>
              <span class="selected-file">{{ productImageTip }}</span>
            </div>

            <el-radio-group
              v-if="productImages.length"
              v-model="productMainImageKey"
              class="product-image-list"
              @change="syncProductMainImage"
            >
              <div
                v-for="image in productImages"
                :key="image.localId"
                class="product-image-item"
                :class="{ 'is-main': image.localId === productMainImageKey }"
              >
                <div class="product-image-preview">
                  <el-icon><Picture /></el-icon>
                  <img
                    v-if="productImagePreview(image)"
                    :src="productImagePreview(image)"
                    :alt="image.name"
                    @error="handleImageError"
                  >
                </div>
                <div class="product-image-meta">
                  <strong>{{ image.name || '产品图片' }}</strong>
                  <el-radio :value="image.localId">主图</el-radio>
                </div>
                <el-input
                  v-model.trim="image.description"
                  size="small"
                  placeholder="图片说明"
                />
                <div class="product-image-actions">
                  <el-switch
                    v-model="image.status"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="启用"
                    inactive-text="禁用"
                  />
                  <el-button
                    v-if="!image.id || isSuperAdmin"
                    type="danger"
                    link
                    icon="Delete"
                    @click="removeProductImage(image)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </el-radio-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveProduct">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="specDialogVisible"
      :title="`${activeProduct ? activeProduct.name : ''} · 配置管理`"
      width="min(820px, 94vw)"
    >
      <el-form class="asset-form" label-position="top">
        <div class="asset-form-grid">
          <el-form-item label="配置名称">
            <el-input v-model.trim="specForm.name" placeholder="例如：处理器、内存、屏幕" />
          </el-form-item>
          <el-form-item label="配置内容">
            <el-input v-model.trim="specForm.value" placeholder="请输入配置内容" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="specForm.sortOrder" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="specForm.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        <div class="asset-form-actions">
          <el-button v-if="specForm.id" @click="resetSpecForm">取消编辑</el-button>
          <el-button type="primary" :loading="assetSaving" @click="saveSpec">
            {{ specForm.id ? '保存配置' : '新增配置' }}
          </el-button>
        </div>
      </el-form>

      <el-table :data="specs" stripe>
        <el-table-column prop="name" label="配置名称" width="150" />
        <el-table-column prop="value" label="配置内容" min-width="220" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '禁用' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link icon="Edit" @click="editSpec(row)">编辑</el-button>
            <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="deleteSpec(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog
      v-model="imageDialogVisible"
      :title="`${activeProduct ? activeProduct.name : ''} · 图片管理`"
      width="min(900px, 94vw)"
    >
      <el-form class="asset-form" label-position="top">
        <div class="asset-form-grid image-form-grid">
          <el-form-item label="选择图片">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/gif,image/webp"
              :on-change="handleImageFileChange"
            >
              <el-button icon="Upload">选择本地图片</el-button>
            </el-upload>
            <span class="selected-file">{{ imageForm.fileName || imageFolderTip }}</span>
          </el-form-item>
          <el-form-item label="图片地址">
            <el-input v-model.trim="imageForm.url" placeholder="也可以填写图片地址" />
          </el-form-item>
          <el-form-item label="图片说明">
            <el-input v-model.trim="imageForm.description" />
          </el-form-item>
          <el-form-item label="图片设置">
            <el-checkbox v-model="imageForm.isMain" :true-value="1" :false-value="0">设为主图</el-checkbox>
            <el-checkbox v-model="imageForm.status" :true-value="1" :false-value="0">启用</el-checkbox>
          </el-form-item>
        </div>
        <div class="asset-form-actions">
          <el-button v-if="imageForm.id" @click="resetImageForm">取消编辑</el-button>
          <el-button type="primary" :loading="assetSaving" @click="saveImage">
            {{ imageForm.id ? '保存图片' : '上传图片' }}
          </el-button>
        </div>
      </el-form>

      <el-table :data="images" stripe>
        <el-table-column label="预览" width="90">
          <template #default="{ row }">
            <div class="device-image">
              <el-icon><Picture /></el-icon>
              <img :src="assetUrl(row.url)" :alt="row.name" @error="handleImageError">
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="图片名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="图片说明" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.isMain === 1" type="warning">主图</el-tag>
            <el-tag v-else :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button v-if="row.isMain !== 1" type="warning" link icon="Star" @click="setMainImage(row)">设主图</el-button>
            <el-button type="primary" link icon="Edit" @click="editImage(row)">编辑</el-button>
            <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="deleteImage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </main>
</template>

<script>
import http from '@/utils/http'
import { getAuthUser } from '@/utils/auth'

function emptyProductForm(categoryId = null) {
  return {
    id: null,
    name: '',
    categoryId,
    brandId: null,
    price: 0,
    description: '',
    status: 1
  }
}

function emptySpecForm() {
  return {
    id: null,
    name: '',
    value: '',
    sortOrder: 0,
    status: 1
  }
}

function emptyImageForm() {
  return {
    id: null,
    url: '',
    name: '',
    description: '',
    isMain: 0,
    status: 1,
    dataUrl: '',
    fileName: ''
  }
}

export default {
  name: 'AdminProductsPage',
  props: {
    categoryName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      products: [],
      categories: [],
      brands: [],
      loading: false,
      saving: false,
      assetSaving: false,
      currentUser: getAuthUser() || {},
      productDialogVisible: false,
      specDialogVisible: false,
      imageDialogVisible: false,
      dialogMode: 'create',
      activeProduct: null,
      specs: [],
      images: [],
      currentPage: 1,
      pageSize: 15,
      filters: {
        keyword: '',
        brandIds: [],
        status: null
      },
      productForm: emptyProductForm(),
      specForm: emptySpecForm(),
      imageForm: emptyImageForm(),
      productImages: [],
      deletedProductImageIds: [],
      productMainImageKey: '',
      productRules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' },
          { max: 100, message: '设备名称不能超过 100 个字符', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择设备分类', trigger: 'change' }
        ],
        brandId: [
          { required: true, message: '请选择设备品牌', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入设备价格', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isSuperAdmin() {
      return this.currentUser.role === '超级管理员'
    },
    enabledProductCount() {
      return this.products.filter((product) => Number(product.status) === 1).length
    },
    disabledProductCount() {
      return this.products.filter((product) => Number(product.status) === 0).length
    },
    availableBrands() {
      const brandIds = new Set(this.products.map((product) => Number(product.brandId)))
      return this.brands.filter((brand) => brandIds.has(Number(brand.id)))
    },
    imageFolderTip() {
      if (this.categoryName === '手机') {
        return '未选择新图片，上传后自动保存到 phone_image'
      }

      if (this.categoryName === '电脑') {
        return '未选择新图片，上传后自动保存到 computer_image'
      }

      return '未选择新图片'
    },
    productImageTip() {
      if (!this.productImages.length) {
        return `未加入图片，${this.imageFolderTip.replace('未选择新图片，', '')}`
      }

      return `已加入 ${this.productImages.length} 张图片`
    },
    filteredProducts() {
      const keyword = this.filters.keyword.toLowerCase()

      return this.products.filter((product) => {
        const matchesKeyword = !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.brandName.toLowerCase().includes(keyword)
        const matchesBrand = !this.filters.brandIds.length ||
          this.filters.brandIds.includes(Number(product.brandId))
        const matchesStatus = this.filters.status === null || this.filters.status === '' ||
          Number(product.status) === Number(this.filters.status)

        return matchesKeyword && matchesBrand && matchesStatus
      })
    },
    pagedProducts() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredProducts.slice(start, start + this.pageSize)
    }
  },
  watch: {
    categoryName() {
      this.productDialogVisible = false
      this.specDialogVisible = false
      this.imageDialogVisible = false
      this.resetFilters()
      this.loadPage()
    },
    filters: {
      deep: true,
      handler() {
        this.currentPage = 1
      }
    }
  },
  mounted() {
    this.loadPage()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadPage() {
      this.loading = true

      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          http.get('/product-categories'),
          http.get('/product-brands')
        ])

        this.categories = categoryResponse.data.data || []
        this.brands = brandResponse.data.data || []
        const category = this.categories.find((item) => item.name === this.categoryName)

        if (!category) {
          this.products = []
          this.$message.error(`未找到“${this.categoryName}”分类`)
          return
        }

        const productResponse = await http.get('/admin/products', {
          params: { categoryId: category.id }
        })
        this.products = productResponse.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, `${this.categoryName}数据加载失败`))
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        brandIds: [],
        status: null
      }
    },
    async openProductDialog(mode, product) {
      this.dialogMode = mode
      const category = this.categories.find((item) => item.name === this.categoryName)
      this.productImages = []
      this.deletedProductImageIds = []
      this.productMainImageKey = ''
      this.productForm = mode === 'edit'
        ? {
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            brandId: product.brandId,
            price: product.price,
            description: product.description,
            status: product.status
          }
        : emptyProductForm(category ? category.id : null)
      this.productDialogVisible = true

      if (mode === 'edit') {
        await this.loadProductFormImages(product.id)
      }
    },
    resetProductDialog() {
      const category = this.categories.find((item) => item.name === this.categoryName)
      this.productForm = emptyProductForm(category ? category.id : null)
      this.productImages = []
      this.deletedProductImageIds = []
      this.productMainImageKey = ''

      this.$nextTick(() => {
        if (this.$refs.productForm) {
          this.$refs.productForm.clearValidate()
        }
      })
    },
    handleSaveProduct() {
      this.$refs.productForm.validate(async (valid) => {
        if (!valid || this.saving) return

        this.saving = true

        try {
          const payload = {
            name: this.productForm.name,
            categoryId: this.productForm.categoryId,
            brandId: this.productForm.brandId,
            price: this.productForm.price,
            description: this.productForm.description,
            status: this.productForm.status
          }
          const response = this.dialogMode === 'create'
            ? await http.post('/admin/products', payload)
            : await http.put(`/admin/products/${this.productForm.id}`, payload)
          const productId = this.dialogMode === 'create'
            ? response.data.data.id
            : this.productForm.id

          await this.saveProductFormImages(productId)

          this.$message.success(response.data.message || '设备信息保存成功')
          this.productDialogVisible = false
          await this.loadPage()
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '设备信息保存失败'))
        } finally {
          this.saving = false
        }
      })
    },
    createProductImageLocalId() {
      return `local-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
    },
    async loadProductFormImages(productId) {
      try {
        const response = await http.get(`/admin/products/${productId}/images`)
        this.productImages = (response.data.data || []).map((image) => ({
          localId: `remote-${image.id}`,
          id: image.id,
          url: image.url,
          name: image.name,
          description: image.description,
          isMain: Number(image.isMain) === 1 ? 1 : 0,
          status: Number(image.status) === 0 ? 0 : 1,
          dataUrl: '',
          fileName: ''
        }))

        const mainImage = this.productImages.find((image) => Number(image.isMain) === 1)
        this.productMainImageKey = mainImage
          ? mainImage.localId
          : (this.productImages[0] ? this.productImages[0].localId : '')
        this.syncProductMainImage(this.productMainImageKey)
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品图片加载失败'))
      }
    },
    handleProductImageFileChange(uploadFile) {
      const file = uploadFile.raw

      if (!file) return
      if (file.size > 8 * 1024 * 1024) {
        this.$message.warning('图片大小不能超过 8MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const image = {
          localId: this.createProductImageLocalId(),
          id: null,
          url: '',
          name: file.name,
          description: '',
          isMain: 0,
          status: 1,
          dataUrl: reader.result,
          fileName: file.name
        }

        this.productImages.push(image)

        if (!this.productMainImageKey) {
          this.productMainImageKey = image.localId
        }

        this.syncProductMainImage(this.productMainImageKey)
      }
      reader.readAsDataURL(file)
    },
    removeProductImage(image) {
      if (image.id && !this.deletedProductImageIds.includes(image.id)) {
        this.deletedProductImageIds.push(image.id)
      }

      this.productImages = this.productImages.filter((item) => item.localId !== image.localId)

      if (this.productMainImageKey === image.localId) {
        this.productMainImageKey = this.productImages[0] ? this.productImages[0].localId : ''
      }

      this.syncProductMainImage(this.productMainImageKey)
    },
    syncProductMainImage(localId) {
      this.productMainImageKey = localId || ''
      this.productImages.forEach((image) => {
        image.isMain = image.localId === this.productMainImageKey ? 1 : 0
      })
    },
    ensureProductMainImage() {
      const selectedImage = this.productImages.find((image) => image.localId === this.productMainImageKey)

      if (!selectedImage && this.productImages.length) {
        this.productMainImageKey = this.productImages[0].localId
      }

      this.syncProductMainImage(this.productMainImageKey)
    },
    productImagePreview(image) {
      return image.dataUrl || this.assetUrl(image.url)
    },
    async saveProductFormImages(productId) {
      this.ensureProductMainImage()

      if (this.isSuperAdmin) {
        for (const imageId of this.deletedProductImageIds) {
          await http.delete(`/admin/product-images/${imageId}`)
        }
      }

      for (const image of this.productImages.filter((item) => item.id)) {
        await http.put(`/admin/product-images/${image.id}`, {
          url: image.url,
          name: image.name,
          description: image.description,
          isMain: 0,
          status: image.status
        })
      }

      for (const image of this.productImages.filter((item) => !item.id && item.dataUrl)) {
        const response = await http.post(`/admin/products/${productId}/images`, {
          dataUrl: image.dataUrl,
          name: image.name,
          description: image.description,
          isMain: 0,
          status: image.status
        })

        image.id = response.data.data.id
      }

      const mainImage = this.productImages.find((image) => image.localId === this.productMainImageKey)

      if (mainImage && mainImage.id) {
        await http.patch(`/admin/product-images/${mainImage.id}/main`)
      }
    },
    async handleStatusChange(product) {
      try {
        const response = await http.patch(`/admin/products/${product.id}/status`, {
          status: product.status
        })
        this.$message.success(response.data.message || '设备状态修改成功')
      } catch (error) {
        product.status = product.status === 1 ? 0 : 1
        this.$message.error(this.getErrorMessage(error, '设备状态修改失败'))
      }
    },
    async openSpecDialog(product) {
      this.activeProduct = product
      this.specForm = emptySpecForm()
      this.specDialogVisible = true
      await this.loadSpecs()
    },
    async loadSpecs() {
      try {
        const response = await http.get(`/admin/products/${this.activeProduct.id}/specs`)
        this.specs = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品配置加载失败'))
      }
    },
    editSpec(spec) {
      this.specForm = { ...emptySpecForm(), ...spec }
    },
    resetSpecForm() {
      this.specForm = emptySpecForm()
    },
    async saveSpec() {
      if (!this.specForm.name || !this.specForm.value) {
        this.$message.warning('请输入配置名称和配置内容')
        return
      }

      this.assetSaving = true

      try {
        const response = this.specForm.id
          ? await http.put(`/admin/product-specs/${this.specForm.id}`, this.specForm)
          : await http.post(`/admin/products/${this.activeProduct.id}/specs`, this.specForm)
        this.$message.success(response.data.message)
        this.resetSpecForm()
        await this.loadSpecs()
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品配置保存失败'))
      } finally {
        this.assetSaving = false
      }
    },
    deleteSpec(spec) {
      this.$confirm(`确认删除配置“${spec.name}”吗？`, '删除确认', { type: 'warning' })
        .then(async () => {
          const response = await http.delete(`/admin/product-specs/${spec.id}`)
          this.$message.success(response.data.message)
          this.loadSpecs()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '配置删除失败'))
          }
        })
    },
    async openImageDialog(product) {
      this.activeProduct = product
      this.imageForm = emptyImageForm()
      this.imageDialogVisible = true
      await this.loadImages()
    },
    async loadImages() {
      try {
        const response = await http.get(`/admin/products/${this.activeProduct.id}/images`)
        this.images = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品图片加载失败'))
      }
    },
    handleImageFileChange(uploadFile) {
      const file = uploadFile.raw

      if (!file) return
      if (file.size > 8 * 1024 * 1024) {
        this.$message.warning('图片大小不能超过 8MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.imageForm.dataUrl = reader.result
        this.imageForm.fileName = file.name
        this.imageForm.name = file.name
      }
      reader.readAsDataURL(file)
    },
    editImage(image) {
      this.imageForm = {
        ...emptyImageForm(),
        id: image.id,
        url: image.url,
        name: image.name,
        description: image.description,
        isMain: image.isMain,
        status: image.status
      }
    },
    resetImageForm() {
      this.imageForm = emptyImageForm()
    },
    async saveImage() {
      if (!this.imageForm.dataUrl && !this.imageForm.url) {
        this.$message.warning('请选择本地图片或填写图片地址')
        return
      }

      this.assetSaving = true

      try {
        const payload = {
          url: this.imageForm.url,
          name: this.imageForm.name,
          description: this.imageForm.description,
          isMain: this.imageForm.isMain,
          status: this.imageForm.status,
          dataUrl: this.imageForm.dataUrl
        }
        const response = this.imageForm.id
          ? await http.put(`/admin/product-images/${this.imageForm.id}`, payload)
          : await http.post(`/admin/products/${this.activeProduct.id}/images`, payload)
        const imageId = this.imageForm.id || response.data.data.id

        if (this.imageForm.id && this.imageForm.isMain === 1) {
          await http.patch(`/admin/product-images/${imageId}/main`)
        }

        this.$message.success(response.data.message)
        this.resetImageForm()
        await this.loadImages()
        await this.loadPage()
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品图片保存失败'))
      } finally {
        this.assetSaving = false
      }
    },
    async setMainImage(image) {
      try {
        const response = await http.patch(`/admin/product-images/${image.id}/main`)
        this.$message.success(response.data.message)
        await this.loadImages()
        await this.loadPage()
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '主图设置失败'))
      }
    },
    deleteImage(image) {
      this.$confirm(`确认删除图片“${image.name || image.url}”吗？`, '删除确认', { type: 'warning' })
        .then(async () => {
          const response = await http.delete(`/admin/product-images/${image.id}`)
          this.$message.success(response.data.message)
          await this.loadImages()
          await this.loadPage()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '图片删除失败'))
          }
        })
    },
    handleDeleteProduct(product) {
      this.$confirm(`确认直接删除设备“${product.name}”吗？关联图片、配置、评论、收藏会一起删除。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const response = await http.delete(`/admin/products/${product.id}`)
          this.$message.success(response.data.message || '设备删除成功')
          this.loadPage()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '设备删除失败'))
          }
        })
    },
    priceText(price) {
      return Number(price) > 0 ? `¥${Number(price).toLocaleString('zh-CN')}` : '价格待定'
    },
    assetUrl(assetPath) {
      if (!assetPath) return ''
      if (/^https?:\/\//i.test(assetPath)) return assetPath

      return `http://localhost:3000/assets/${assetPath
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')}`
    },
    handleImageError(event) {
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.admin-products-page,
.admin-products-card {
  min-height: calc(100vh - 96px);
}

.admin-products-card {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.content-heading,
.content-commands,
.filter-row,
.device-cell {
  display: flex;
  align-items: center;
}

.content-heading {
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

.content-commands,
.filter-row {
  gap: 10px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 18px;
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

.summary-strip span,
.device-cell span {
  display: block;
  color: #6b7280;
  font-size: 12px;
}

.summary-strip span {
  margin-bottom: 7px;
}

.summary-strip strong {
  color: #111827;
  font-size: 22px;
}

.filter-row {
  margin-bottom: 18px;
}

.filter-row .el-input {
  width: min(320px, 100%);
}

.filter-row .el-select {
  width: 150px;
}

.filter-row .brand-select {
  width: 240px;
}

.table-tool {
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.device-cell {
  gap: 10px;
}

.device-cell > div:last-child {
  min-width: 0;
}

.device-cell strong {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-image {
  position: relative;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #f9fafb;
  color: #9ca3af;
}

.device-image img {
  position: absolute;
  inset: 3px;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  object-fit: contain;
}

.table-pagination {
  justify-content: center;
  margin-top: 20px;
}

.dialog-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.dialog-form .el-select,
.dialog-form .el-input-number {
  width: 100%;
}

.product-image-editor {
  width: 100%;
}

.product-image-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.product-image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.product-image-item {
  min-width: 0;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.product-image-item.is-main {
  border-color: #e6a23c;
  box-shadow: 0 0 0 1px rgba(230, 162, 60, 0.2);
}

.product-image-preview {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid #edf0f5;
  border-radius: 5px;
  background: #f9fafb;
  color: #9ca3af;
}

.product-image-preview img {
  position: absolute;
  inset: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  object-fit: contain;
}

.product-image-meta,
.product-image-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.product-image-meta {
  margin: 8px 0;
}

.product-image-meta strong {
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-image-actions {
  margin-top: 8px;
}

.asset-form {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.asset-form-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 110px 100px;
  gap: 0 14px;
}

.image-form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.asset-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.selected-file {
  display: block;
  margin-top: 7px;
  color: #6b7280;
  font-size: 12px;
}

@media (max-width: 720px) {
  .admin-products-card {
    padding: 14px;
  }

  .content-heading,
  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }

  .content-commands,
  .filter-row .el-input,
  .filter-row .el-select,
  .filter-row .brand-select {
    width: 100%;
  }

  .content-commands .el-button {
    flex: 1;
  }

  .summary-strip,
  .form-grid,
  .asset-form-grid {
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
