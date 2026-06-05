<template>
  <el-dialog
    v-model="dialogVisible"
    :title="product ? product.name : '产品详情'"
    width="min(980px, 96vw)"
    top="4vh"
    class="product-detail-dialog"
    @closed="resetDialog"
  >
    <div v-loading="loading" class="detail-content">
      <template v-if="product">
        <section class="detail-hero">
          <div class="detail-gallery">
            <div class="detail-main-image">
              <el-icon :size="72"><Monitor /></el-icon>
              <img
                v-if="activeImage"
                :src="assetUrl(activeImage.url)"
                :alt="product.name"
                @error="handleImageError"
              >
            </div>
            <div v-if="product.images.length > 1" class="detail-thumbnails">
              <button
                v-for="image in product.images"
                :key="image.id"
                type="button"
                :class="{ active: activeImage && activeImage.id === image.id }"
                @click="activeImage = image"
              >
                <img :src="assetUrl(image.url)" :alt="image.name || product.name" @error="handleImageError">
              </button>
            </div>
          </div>

          <div class="detail-summary">
            <div class="detail-tags">
              <el-tag>{{ product.categoryName }}</el-tag>
              <el-tag type="success">{{ product.brandName }}</el-tag>
            </div>
            <h2>{{ product.name }}</h2>
            <strong class="detail-price">{{ priceText(product.price) }}</strong>
            <div class="rating-line">
              <el-rate :model-value="product.rating" disabled allow-half />
              <span>{{ product.rating ? product.rating.toFixed(1) : '暂无评分' }} · {{ product.commentCount }} 条评论</span>
            </div>
            <p>{{ product.description || '暂无产品简介' }}</p>
            <div class="detail-actions">
              <el-button
                :type="product.isFavorite ? 'warning' : 'default'"
                :icon="product.isFavorite ? 'StarFilled' : 'Star'"
                :loading="favoriteSaving"
                @click="toggleFavorite"
              >
                {{ product.isFavorite ? '取消收藏' : '收藏产品' }}
              </el-button>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <div class="section-heading">
            <h3>配置参数</h3>
            <span>{{ product.categoryName }}配置</span>
          </div>
          <div class="spec-grid">
            <div v-for="spec in product.specs" :key="spec.id">
              <span>{{ spec.name }}</span>
              <strong>{{ spec.value }}</strong>
            </div>
          </div>
          <el-empty v-if="!product.specs.length" description="暂无配置参数" :image-size="70" />
        </section>

        <section class="detail-section">
          <div class="section-heading">
            <h3>用户评分与评论</h3>
            <span>分享真实使用感受</span>
          </div>

          <el-form class="comment-form" label-position="top">
            <el-form-item label="产品评分">
              <el-rate v-model="commentForm.rating" />
            </el-form-item>
            <el-form-item label="评论内容">
              <el-input
                v-model.trim="commentForm.content"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="说说你对这款产品的看法"
              />
            </el-form-item>
            <el-button type="primary" :loading="commentSaving" @click="submitComment">发表评论</el-button>
          </el-form>

          <div class="comment-list">
            <article v-for="comment in comments" :key="comment.id" class="comment-item">
              <div>
                <strong>{{ comment.username }}</strong>
                <el-rate :model-value="comment.rating" disabled />
              </div>
              <p>{{ comment.content }}</p>
              <footer>
                <span>{{ dateText(comment.commentTime) }}</span>
                <el-button
                  v-if="Number(comment.userId) === Number(currentUser.id)"
                  type="danger"
                  link
                  icon="Delete"
                  @click="deleteComment(comment)"
                >
                  删除
                </el-button>
              </footer>
            </article>
            <el-empty v-if="!comments.length" description="还没有用户评论" :image-size="70" />
          </div>
        </section>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import http from '@/utils/http'
import { getAuthUser } from '@/utils/auth'

export default {
  name: 'ProductDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    productId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['update:visible', 'favorite-change'],
  data() {
    return {
      currentUser: getAuthUser() || {},
      product: null,
      comments: [],
      activeImage: null,
      loading: false,
      favoriteSaving: false,
      commentSaving: false,
      commentForm: {
        rating: 5,
        content: ''
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  watch: {
    visible(value) {
      if (value && this.productId) {
        this.loadDetail()
      }
    }
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadDetail() {
      this.loading = true

      try {
        const [detailResponse, commentResponse] = await Promise.all([
          http.get(`/products/${this.productId}`),
          http.get(`/products/${this.productId}/comments`)
        ])
        this.product = detailResponse.data.data
        this.comments = commentResponse.data.data || []
        this.activeImage = this.product.images.find((image) => image.isMain === 1) || this.product.images[0] || null
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品详情加载失败'))
      } finally {
        this.loading = false
      }
    },
    async toggleFavorite() {
      if (!this.product || this.favoriteSaving) return

      this.favoriteSaving = true

      try {
        const response = this.product.isFavorite
          ? await http.delete(`/favorites/${this.product.id}`)
          : await http.post(`/favorites/${this.product.id}`)
        this.product.isFavorite = !this.product.isFavorite
        this.$emit('favorite-change', {
          productId: this.product.id,
          isFavorite: this.product.isFavorite
        })
        this.$message.success(response.data.message)
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '收藏操作失败'))
      } finally {
        this.favoriteSaving = false
      }
    },
    async submitComment() {
      if (!this.commentForm.content) {
        this.$message.warning('请输入评论内容')
        return
      }

      this.commentSaving = true

      try {
        const response = await http.post(`/products/${this.product.id}/comments`, this.commentForm)
        this.$message.success(response.data.message)
        this.commentForm = { rating: 5, content: '' }
        await this.loadDetail()
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '评论发表失败'))
      } finally {
        this.commentSaving = false
      }
    },
    deleteComment(comment) {
      this.$confirm('确认删除这条评论吗？', '删除确认', { type: 'warning' })
        .then(async () => {
          const response = await http.delete(`/comments/${comment.id}`)
          this.$message.success(response.data.message)
          await this.loadDetail()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '评论删除失败'))
          }
        })
    },
    resetDialog() {
      this.product = null
      this.comments = []
      this.activeImage = null
      this.commentForm = { rating: 5, content: '' }
    },
    priceText(price) {
      return Number(price) > 0 ? `¥${Number(price).toLocaleString('zh-CN')}` : '价格待定'
    },
    dateText(value) {
      return value ? new Date(value).toLocaleString('zh-CN') : ''
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
.detail-content {
  min-height: 320px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  gap: 28px;
}

.detail-main-image {
  position: relative;
  height: 320px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #b9c4d0;
}

.detail-main-image img {
  position: absolute;
  inset: 18px;
  width: calc(100% - 36px);
  height: calc(100% - 36px);
  object-fit: contain;
}

.detail-thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
}

.detail-thumbnails button {
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  padding: 4px;
  overflow: hidden;
  border: 1px solid #dbe4ec;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.detail-thumbnails button.active {
  border-color: #168d78;
}

.detail-thumbnails img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.detail-summary h2 {
  margin: 16px 0 10px;
  color: #142033;
  font-size: 26px;
}

.detail-tags,
.rating-line,
.detail-actions,
.comment-item > div,
.comment-item footer,
.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-price {
  color: #d85040;
  font-size: 25px;
}

.rating-line {
  margin: 14px 0;
  color: #6b7b90;
  font-size: 13px;
}

.detail-summary p {
  color: #526277;
  line-height: 1.8;
}

.detail-actions {
  margin-top: 20px;
}

.detail-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e5ebf0;
}

.section-heading {
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading h3 {
  margin: 0;
  color: #142033;
  font-size: 18px;
}

.section-heading span {
  color: #7a899b;
  font-size: 12px;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e5ebf0;
  border-left: 1px solid #e5ebf0;
}

.spec-grid div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  border-right: 1px solid #e5ebf0;
  border-bottom: 1px solid #e5ebf0;
}

.spec-grid span,
.spec-grid strong {
  padding: 12px;
  font-size: 13px;
}

.spec-grid span {
  background: #f7fafc;
  color: #64748b;
}

.spec-grid strong {
  color: #253247;
}

.comment-form {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #e5ebf0;
  border-radius: 8px;
  background: #f8fafc;
}

.comment-list {
  display: grid;
  gap: 10px;
}

.comment-item {
  padding: 16px;
  border: 1px solid #e5ebf0;
  border-radius: 8px;
}

.comment-item > div {
  justify-content: space-between;
}

.comment-item p {
  margin: 12px 0;
  color: #435166;
  line-height: 1.7;
}

.comment-item footer {
  justify-content: space-between;
  color: #8a98aa;
  font-size: 12px;
}

@media (max-width: 720px) {
  .detail-hero,
  .spec-grid {
    grid-template-columns: 1fr;
  }

  .detail-main-image {
    height: 240px;
  }
}
</style>
