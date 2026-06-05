const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

const PORT = Number(process.env.PORT) || 3000
const DEFAULT_JWT_SECRET = 'choose-device-local-secret'

function createDatabase() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'choose_device'
  })
}

function query(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err)
        return
      }

      resolve(results)
    })
  })
}

function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function sendSuccess(res, status, message, data) {
  res.status(status).json({
    code: status,
    message,
    data
  })
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStatus(value, fallback = 1) {
  const status = value === undefined ? fallback : Number(value)

  if (![0, 1].includes(status)) {
    throw createHttpError(400, '状态只能为 0 或 1')
  }

  return status
}

function validateId(value, label = '数据') {
  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, `${label}编号无效`)
  }

  return id
}

function validateUserInput(input, options = {}) {
  const username = normalizeText(input.username)
  const phone = normalizeText(input.phone)
  const email = normalizeText(input.email).toLowerCase()
  const password = typeof input.password === 'string' ? input.password : ''
  const gender = normalizeText(input.gender)
  const status = input.status === undefined ? 1 : Number(input.status)

  if (username.length < 2 || username.length > 16 || /\s/.test(username)) {
    throw createHttpError(400, '用户名长度应为 2 至 16 个字符，且不能包含空格')
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw createHttpError(400, '请输入正确的手机号')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, '请输入正确的邮箱')
  }

  if (!options.allowEmptyPassword && (password.length < 6 || password.length > 16)) {
    throw createHttpError(400, '密码长度应为 6 至 16 个字符')
  }

  if (options.allowEmptyPassword && password && (password.length < 6 || password.length > 16)) {
    throw createHttpError(400, '密码长度应为 6 至 16 个字符')
  }

  if (![0, 1].includes(status)) {
    throw createHttpError(400, '用户状态只能为 0 或 1')
  }

  return {
    username,
    phone,
    email,
    password,
    gender,
    status
  }
}

function validateProductInput(input) {
  const name = normalizeText(input.name || input.productName)
  const categoryId = Number(input.categoryId)
  const brandId = Number(input.brandId)
  const price = Number(input.price)
  const description = normalizeText(input.description)
  const status = input.status === undefined ? 1 : Number(input.status)

  if (!name || name.length > 100) {
    throw createHttpError(400, '设备名称不能为空且不能超过 100 个字符')
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw createHttpError(400, '请选择设备分类')
  }

  if (!Number.isInteger(brandId) || brandId <= 0) {
    throw createHttpError(400, '请选择设备品牌')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw createHttpError(400, '设备价格不能小于 0')
  }

  if (![0, 1].includes(status)) {
    throw createHttpError(400, '设备状态只能为 0 或 1')
  }

  return {
    name,
    categoryId,
    brandId,
    price,
    description,
    status
  }
}

function validateCategoryInput(input) {
  const name = normalizeText(input.name || input.categoryName)
  const parentId = input.parentId === null || input.parentId === '' || input.parentId === undefined
    ? null
    : validateId(input.parentId, '父级分类')
  const description = normalizeText(input.description)
  const sortOrder = Number(input.sortOrder || 0)
  const icon = normalizeText(input.icon)
  const status = normalizeStatus(input.status)

  if (!name || name.length > 50) {
    throw createHttpError(400, '分类名称不能为空且不能超过 50 个字符')
  }

  if (!Number.isInteger(sortOrder)) {
    throw createHttpError(400, '分类排序必须为整数')
  }

  return { name, parentId, description, sortOrder, icon, status }
}

function validateBrandInput(input) {
  const name = normalizeText(input.name || input.brandName)
  const logo = normalizeText(input.logo)
  const country = normalizeText(input.country)
  const website = normalizeText(input.website)
  const description = normalizeText(input.description)
  const status = normalizeStatus(input.status)

  if (!name || name.length > 50) {
    throw createHttpError(400, '品牌名称不能为空且不能超过 50 个字符')
  }

  return { name, logo, country, website, description, status }
}

function validateManagerInput(input, options = {}) {
  const account = normalizeText(input.account || input.adminAccount)
  const email = normalizeText(input.email).toLowerCase()
  const password = typeof input.password === 'string' ? input.password : ''
  const status = normalizeStatus(input.status)

  if (account.length < 3 || account.length > 30 || /\s/.test(account)) {
    throw createHttpError(400, '管理员账号长度应为 3 至 30 个字符，且不能包含空格')
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, '请输入正确的邮箱')
  }

  if (!options.allowEmptyPassword && (password.length < 6 || password.length > 16)) {
    throw createHttpError(400, '密码长度应为 6 至 16 个字符')
  }

  if (options.allowEmptyPassword && password && (password.length < 6 || password.length > 16)) {
    throw createHttpError(400, '密码长度应为 6 至 16 个字符')
  }

  return { account, email, password, status, role: '普通管理员' }
}

function validateSpecInput(input) {
  const name = normalizeText(input.name || input.specName)
  const value = normalizeText(input.value || input.specValue)
  const sortOrder = Number(input.sortOrder || 0)
  const status = normalizeStatus(input.status)

  if (!name || name.length > 50) {
    throw createHttpError(400, '配置名称不能为空且不能超过 50 个字符')
  }

  if (!value || value.length > 255) {
    throw createHttpError(400, '配置内容不能为空且不能超过 255 个字符')
  }

  if (!Number.isInteger(sortOrder)) {
    throw createHttpError(400, '配置排序必须为整数')
  }

  return { name, value, sortOrder, status }
}

function validateCommentInput(input) {
  const content = normalizeText(input.content)
  const rating = Number(input.rating)

  if (!content || content.length > 500) {
    throw createHttpError(400, '评论内容不能为空且不能超过 500 个字符')
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createHttpError(400, '评分必须为 1 至 5 分')
  }

  return { content, rating }
}

function publicUser(user, accountType) {
  const result = {
    id: user.user_id,
    userId: user.user_id,
    username: user.username,
    phone: user.phone || '',
    email: user.email || '',
    gender: user.gender || '',
    status: Number(user.status),
    registerTime: user.register_time || null
  }

  if (accountType) {
    result.accountType = accountType
  }

  return result
}

function publicAdmin(admin) {
  return {
    id: admin.admin_id,
    adminId: admin.admin_id,
    account: admin.admin_account,
    email: admin.email || '',
    role: admin.role || '',
    status: Number(admin.status),
    accountType: 'ADMIN'
  }
}

function publicCategory(category) {
  return {
    id: category.category_id,
    name: category.category_name,
    parentId: category.parent_id || null,
    description: category.description || '',
    sortOrder: Number(category.sort_order || 0),
    icon: category.icon || '',
    status: Number(category.status)
  }
}

function publicBrand(brand) {
  return {
    id: brand.brand_id,
    name: brand.brand_name,
    logo: brand.logo || '',
    country: brand.country || '',
    website: brand.website || '',
    description: brand.description || '',
    status: Number(brand.status)
  }
}

function publicProduct(product) {
  return {
    id: product.product_id,
    name: product.product_name,
    price: Number(product.price),
    description: product.description || '',
    viewCount: Number(product.view_count || 0),
    categoryId: product.category_id,
    categoryName: product.category_name,
    brandId: product.brand_id,
    brandName: product.brand_name,
    brandLogo: product.brand_logo || '',
    imageUrl: product.image_url || '',
    status: Number(product.status),
    releaseTime: product.release_time || null,
    rating: Number(product.rating || 0),
    commentCount: Number(product.comment_count || 0),
    isFavorite: Boolean(Number(product.is_favorite || 0))
  }
}

function publicSpec(spec) {
  return {
    id: spec.spec_id,
    productId: spec.product_id,
    name: spec.spec_name,
    value: spec.spec_value,
    sortOrder: Number(spec.sort_order || 0),
    status: Number(spec.status)
  }
}

function publicImage(image) {
  return {
    id: image.image_id,
    productId: image.product_id,
    url: image.image_url,
    name: image.image_name || '',
    type: image.image_type || '',
    description: image.description || '',
    isMain: Number(image.is_main),
    uploadTime: image.upload_time || null,
    status: Number(image.status)
  }
}

function publicComment(comment) {
  return {
    id: comment.comment_id,
    userId: comment.user_id,
    username: comment.username || '',
    productId: comment.product_id,
    productName: comment.product_name || '',
    content: comment.content,
    rating: Number(comment.rating || 0),
    commentTime: comment.comment_time,
    likeCount: Number(comment.like_count || 0),
    replyCount: Number(comment.reply_count || 0),
    status: Number(comment.status)
  }
}

function descriptionSpecs(description, productId) {
  return normalizeText(description)
    .split(/[；;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const separator = item.search(/[：:]/)
      return {
        spec_id: `description-${productId}-${index}`,
        product_id: productId,
        spec_name: separator < 0 ? '产品说明' : item.slice(0, separator).trim(),
        spec_value: separator < 0 ? item : item.slice(separator + 1).trim(),
        sort_order: index,
        status: 1
      }
    })
}

function saveUploadedAsset(dataUrl, originalName, folderName, fallbackName) {
  const match = normalizeText(dataUrl).match(/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,(.+)$/i)

  if (!match) {
    throw createHttpError(400, '请上传 PNG、JPG、GIF、WEBP 或 SVG 图片')
  }

  const extension = match[1].toLowerCase().replace('jpeg', 'jpg').replace('svg+xml', 'svg')
  const safeBaseName = path.basename(normalizeText(originalName) || fallbackName)
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .slice(0, 60) || fallbackName
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}-${safeBaseName}.${extension}`
  const uploadDirectory = path.join(__dirname, '..', 'src', 'assets', folderName)

  fs.mkdirSync(uploadDirectory, { recursive: true })
  fs.writeFileSync(path.join(uploadDirectory, fileName), Buffer.from(match[2], 'base64'))

  return {
    url: `${folderName}/${fileName}`,
    name: `${safeBaseName}.${extension}`,
    type: extension
  }
}

function saveUploadedImage(dataUrl, originalName, folderName = 'uploads') {
  return saveUploadedAsset(dataUrl, originalName, folderName, 'product-image')
}

function saveUploadedBrandLogo(dataUrl, originalName) {
  return saveUploadedAsset(dataUrl, originalName, 'brand_icon', 'brand-logo')
}

function isGeneratedAssetPath(assetPath) {
  const normalizedPath = normalizeText(assetPath).replace(/\\/g, '/')

  return /^(uploads|phone_image|computer_image|brand_icon)\/\d{10,}-[a-f0-9]{8}-.+\.(png|jpg|gif|webp|svg)$/i.test(normalizedPath)
}

function deleteGeneratedAsset(assetPath) {
  if (!isGeneratedAssetPath(assetPath)) {
    return
  }

  const assetsRoot = path.resolve(path.join(__dirname, '..', 'src', 'assets'))
  const filePath = path.resolve(path.join(assetsRoot, assetPath))

  if (filePath.startsWith(assetsRoot) && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

async function ensureFeatureSchema(db) {
  await query(
    db,
    `CREATE TABLE IF NOT EXISTS product_specs (
      spec_id INT NOT NULL AUTO_INCREMENT,
      product_id INT NOT NULL,
      spec_name VARCHAR(50) NOT NULL,
      spec_value VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status INT NOT NULL DEFAULT 1,
      PRIMARY KEY (spec_id),
      UNIQUE INDEX uk_product_spec_name (product_id, spec_name),
      INDEX idx_product_specs_product_id (product_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
    ) ENGINE=InnoDB`
  )

  const ratingColumns = await query(db, "SHOW COLUMNS FROM comments LIKE 'rating'")

  if (!ratingColumns.length) {
    await query(
      db,
      'ALTER TABLE comments ADD COLUMN rating TINYINT NOT NULL DEFAULT 5 AFTER content'
    )
  }

  const favoriteIdColumns = await query(db, "SHOW COLUMNS FROM favorites LIKE 'favorite_id'")

  if (favoriteIdColumns[0] && !normalizeText(favoriteIdColumns[0].Extra).includes('auto_increment')) {
    await query(
      db,
      'ALTER TABLE favorites MODIFY favorite_id INT NOT NULL AUTO_INCREMENT'
    )
  }

  const productsWithoutSpecs = await query(
    db,
    `SELECT p.product_id, p.description
     FROM products p
     WHERE p.description IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM product_specs ps WHERE ps.product_id = p.product_id
       )`
  )

  for (const product of productsWithoutSpecs) {
    const specs = descriptionSpecs(product.description, product.product_id)

    for (const spec of specs) {
      await query(
        db,
        `INSERT IGNORE INTO product_specs
          (product_id, spec_name, spec_value, sort_order, status)
         VALUES (?, ?, ?, ?, 1)`,
        [product.product_id, spec.spec_name, spec.spec_value, spec.sort_order]
      )
    }
  }

  await query(
    db,
    `UPDATE product_images pi
     INNER JOIN (
       SELECT product_id, MIN(image_id) AS image_id
       FROM product_images
       WHERE status = 1
       GROUP BY product_id
       HAVING SUM(CASE WHEN is_main = 1 THEN 1 ELSE 0 END) = 0
     ) fallback_image ON fallback_image.image_id = pi.image_id
     SET pi.is_main = 1`
  )
}

function createApp(db, options = {}) {
  const app = express()
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET

  app.use(cors())
  app.use(express.json({ limit: '12mb' }))
  app.use('/assets', express.static(path.join(__dirname, '..', 'src', 'assets')))

  function signToken(payload) {
    return jwt.sign(payload, jwtSecret, { expiresIn: '7d' })
  }

  function authenticate(req, res, next) {
    const authorization = req.headers.authorization || ''

    if (!authorization.startsWith('Bearer ')) {
      next(createHttpError(401, '请先登录'))
      return
    }

    try {
      req.auth = jwt.verify(authorization.slice(7), jwtSecret)
      next()
    } catch (error) {
      next(createHttpError(401, '登录状态无效或已过期'))
    }
  }

  function requireAdmin(req, res, next) {
    if (req.auth.accountType !== 'ADMIN') {
      next(createHttpError(403, '仅管理员可以执行此操作'))
      return
    }

    next()
  }

  function requireUser(req, res, next) {
    if (req.auth.accountType !== 'USER') {
      next(createHttpError(403, '仅普通用户可以执行此操作'))
      return
    }

    next()
  }

  function requireSuperAdmin(req, res, next) {
    if (req.auth.accountType !== 'ADMIN' || req.auth.role !== '超级管理员') {
      next(createHttpError(403, '仅超级管理员可以执行此操作'))
      return
    }

    next()
  }

  async function findUserByAccount(account) {
    const users = await query(
      db,
      `SELECT user_id, username, password, phone, email, gender, status, register_time
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [account, account]
    )
    return users[0] || null
  }

  async function findUserById(userId) {
    const users = await query(
      db,
      `SELECT user_id, username, password, phone, email, gender, status, register_time
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    )
    return users[0] || null
  }

  async function findUserConflict(user, ignoredUserId) {
    const users = await query(
      db,
      `SELECT user_id, username, phone, email
       FROM users
       WHERE username = ? OR phone = ? OR email = ?
       LIMIT 1`,
      [user.username, user.phone, user.email]
    )
    const conflict = users[0]

    if (!conflict || Number(conflict.user_id) === Number(ignoredUserId)) {
      return null
    }

    return conflict
  }

  function throwConflict(conflict, user) {
    if (!conflict) {
      return
    }

    if (conflict.username === user.username) {
      throw createHttpError(409, '用户名已存在')
    }

    if (conflict.phone === user.phone) {
      throw createHttpError(409, '手机号已存在')
    }

    throw createHttpError(409, '邮箱已存在')
  }

  async function createUser(user) {
    const result = await query(
      db,
      `INSERT INTO users
        (username, password, phone, email, gender, status, register_time)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [user.username, user.password, user.phone, user.email, user.gender || null, user.status]
    )

    return {
      user_id: result.insertId,
      ...user,
      register_time: new Date()
    }
  }

  async function updateUser(userId, user) {
    const result = await query(
      db,
      `UPDATE users
       SET username = ?, phone = ?, email = ?, gender = ?, password = ?, status = ?
       WHERE user_id = ?`,
      [
        user.username,
        user.phone,
        user.email,
        user.gender || null,
        user.password,
        user.status,
        userId
      ]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '用户不存在')
    }
  }

  async function findProductById(productId) {
    const products = await query(
      db,
      `SELECT product_id, product_name, category_id, brand_id, price, description, view_count, status
       FROM products
       WHERE product_id = ?
       LIMIT 1`,
      [productId]
    )

    return products[0] || null
  }

  async function getProductImageFolder(productId) {
    const products = await query(
      db,
      `SELECT c.category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?
       LIMIT 1`,
      [productId]
    )

    if (!products[0]) {
      throw createHttpError(404, '产品不存在')
    }

    const categoryName = normalizeText(products[0].category_name)

    if (categoryName === '手机') {
      return 'phone_image'
    }

    if (categoryName === '电脑') {
      return 'computer_image'
    }

    return 'uploads'
  }

  async function withTransaction(action) {
    await query(db, 'START TRANSACTION')

    try {
      const result = await action()
      await query(db, 'COMMIT')
      return result
    } catch (error) {
      await query(db, 'ROLLBACK')
      throw error
    }
  }

  function placeholders(values) {
    return values.map(() => '?').join(', ')
  }

  async function deleteByIds(tableName, columnName, ids) {
    if (!ids.length) {
      return
    }

    await query(db, `DELETE FROM ${tableName} WHERE ${columnName} IN (${placeholders(ids)})`, ids)
  }

  async function deleteProductDeep(productId, assetPaths) {
    const products = await query(db, 'SELECT product_id FROM products WHERE product_id = ? LIMIT 1', [productId])

    if (!products[0]) {
      throw createHttpError(404, '设备不存在')
    }

    const imageRows = await query(db, 'SELECT image_url FROM product_images WHERE product_id = ?', [productId])
    imageRows.forEach((image) => {
      if (image.image_url) {
        assetPaths.push(image.image_url)
      }
    })

    const commentRows = await query(db, 'SELECT comment_id FROM comments WHERE product_id = ?', [productId])
    const commentIds = commentRows.map((comment) => comment.comment_id)

    await deleteByIds('admin_comment', 'comment_id', commentIds)
    await deleteByIds('comments', 'comment_id', commentIds)
    await query(db, 'DELETE FROM favorites WHERE product_id = ?', [productId])
    await query(db, 'DELETE FROM admin_product WHERE product_id = ?', [productId])
    await query(db, 'DELETE FROM product_specs WHERE product_id = ?', [productId])
    await query(db, 'DELETE FROM product_images WHERE product_id = ?', [productId])

    const result = await query(db, 'DELETE FROM products WHERE product_id = ?', [productId])
    return result.affectedRows
  }

  async function deleteCategoryDeep(categoryId, assetPaths, visited = new Set()) {
    if (visited.has(categoryId)) {
      return 0
    }

    visited.add(categoryId)

    const categories = await query(db, 'SELECT category_id FROM categories WHERE category_id = ? LIMIT 1', [categoryId])

    if (!categories[0]) {
      throw createHttpError(404, '分类不存在')
    }

    const childRows = await query(db, 'SELECT category_id FROM categories WHERE parent_id = ?', [categoryId])
    let deletedCount = 0

    for (const child of childRows) {
      deletedCount += await deleteCategoryDeep(child.category_id, assetPaths, visited)
    }

    const productRows = await query(db, 'SELECT product_id FROM products WHERE category_id = ?', [categoryId])

    for (const product of productRows) {
      deletedCount += await deleteProductDeep(product.product_id, assetPaths)
    }

    await query(db, 'DELETE FROM admin_category WHERE category_id = ?', [categoryId])
    const result = await query(db, 'DELETE FROM categories WHERE category_id = ?', [categoryId])

    return deletedCount + result.affectedRows
  }

  async function deleteBrandDeep(brandId, assetPaths) {
    const brands = await query(db, 'SELECT brand_id, logo FROM brands WHERE brand_id = ? LIMIT 1', [brandId])

    if (!brands[0]) {
      throw createHttpError(404, '品牌不存在')
    }

    if (brands[0].logo) {
      assetPaths.push(brands[0].logo)
    }

    const productRows = await query(db, 'SELECT product_id FROM products WHERE brand_id = ?', [brandId])
    let deletedCount = 0

    for (const product of productRows) {
      deletedCount += await deleteProductDeep(product.product_id, assetPaths)
    }

    await query(db, 'DELETE FROM admin_brand WHERE brand_id = ?', [brandId])
    const result = await query(db, 'DELETE FROM brands WHERE brand_id = ?', [brandId])

    return deletedCount + result.affectedRows
  }

  async function deleteCommentDeep(commentId) {
    const comments = await query(db, 'SELECT comment_id FROM comments WHERE comment_id = ? LIMIT 1', [commentId])

    if (!comments[0]) {
      throw createHttpError(404, '评论不存在')
    }

    await query(db, 'DELETE FROM admin_comment WHERE comment_id = ?', [commentId])
    const result = await query(db, 'DELETE FROM comments WHERE comment_id = ?', [commentId])

    return result.affectedRows
  }

  async function deleteUserDeep(userId) {
    const users = await query(db, 'SELECT user_id FROM users WHERE user_id = ? LIMIT 1', [userId])

    if (!users[0]) {
      throw createHttpError(404, '用户不存在')
    }

    const commentRows = await query(db, 'SELECT comment_id FROM comments WHERE user_id = ?', [userId])
    const commentIds = commentRows.map((comment) => comment.comment_id)

    await deleteByIds('admin_comment', 'comment_id', commentIds)
    await deleteByIds('comments', 'comment_id', commentIds)
    await query(db, 'DELETE FROM favorites WHERE user_id = ?', [userId])

    const result = await query(db, 'DELETE FROM users WHERE user_id = ?', [userId])
    return result.affectedRows
  }

  async function findRegularManagerById(adminId) {
    const admins = await query(
      db,
      `SELECT admin_id, admin_account, email, role, status
       FROM admin
       WHERE admin_id = ? AND role = ?
       LIMIT 1`,
      [adminId, '普通管理员']
    )

    return admins[0] || null
  }

  async function ensureManagerAccountUnique(account, ignoreId = null) {
    const conditions = ['admin_account = ?']
    const params = [account]

    if (ignoreId) {
      conditions.push('admin_id <> ?')
      params.push(ignoreId)
    }

    const rows = await query(
      db,
      `SELECT admin_id
       FROM admin
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      params
    )

    if (rows[0]) {
      throw createHttpError(409, '管理员账号已存在')
    }
  }

  async function createRegularManager(manager) {
    const rows = await query(db, 'SELECT COALESCE(MAX(admin_id), 0) + 1 AS next_id FROM admin')
    const adminId = Number(rows[0].next_id)

    await query(
      db,
      `INSERT INTO admin (admin_id, admin_account, admin_password, email, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, manager.account, manager.password, manager.email || null, manager.role, manager.status]
    )

    return findRegularManagerById(adminId)
  }

  async function updateRegularManager(adminId, manager) {
    const current = await findRegularManagerById(adminId)

    if (!current) {
      throw createHttpError(404, '普通管理员不存在')
    }

    const assignments = [
      'admin_account = ?',
      'email = ?',
      'status = ?'
    ]
    const params = [manager.account, manager.email || null, manager.status]

    if (manager.password) {
      assignments.push('admin_password = ?')
      params.push(manager.password)
    }

    params.push(adminId)

    await query(
      db,
      `UPDATE admin
       SET ${assignments.join(', ')}
       WHERE admin_id = ? AND role = ?`,
      [...params, '普通管理员']
    )

    return findRegularManagerById(adminId)
  }

  async function deleteRegularManagerDeep(adminId) {
    const manager = await findRegularManagerById(adminId)

    if (!manager) {
      throw createHttpError(404, '普通管理员不存在')
    }

    await query(db, 'DELETE FROM admin_category WHERE admin_id = ?', [adminId])
    await query(db, 'DELETE FROM admin_brand WHERE admin_id = ?', [adminId])
    await query(db, 'DELETE FROM admin_product WHERE admin_id = ?', [adminId])
    await query(db, 'DELETE FROM admin_comment WHERE admin_id = ?', [adminId])

    const result = await query(db, 'DELETE FROM admin WHERE admin_id = ? AND role = ?', [adminId, '普通管理员'])
    return result.affectedRows
  }

  async function fetchProductDetail(productId, userId, includeDisabled = false) {
    const conditions = ['p.product_id = ?']
    const params = [productId]

    if (!includeDisabled) {
      conditions.push('p.status = 1', 'c.status = 1', 'b.status = 1')
    }

    const products = await query(
      db,
      `SELECT
         p.product_id,
         p.product_name,
         p.price,
         p.description,
         p.view_count,
         p.release_time,
         p.status,
         c.category_id,
         c.category_name,
         b.brand_id,
         b.brand_name,
         b.logo AS brand_logo,
         AVG(CASE WHEN cm.status = 1 THEN cm.rating END) AS rating,
         COUNT(DISTINCT CASE WHEN cm.status = 1 THEN cm.comment_id END) AS comment_count,
         MAX(CASE WHEN f.user_id = ? AND f.status = 1 THEN 1 ELSE 0 END) AS is_favorite
       FROM products p
       INNER JOIN categories c ON c.category_id = p.category_id
       INNER JOIN brands b ON b.brand_id = p.brand_id
       LEFT JOIN comments cm ON cm.product_id = p.product_id
       LEFT JOIN favorites f ON f.product_id = p.product_id
       WHERE ${conditions.join(' AND ')}
       GROUP BY p.product_id, c.category_id, b.brand_id
       LIMIT 1`,
      [userId || 0, ...params]
    )
    const product = products[0]

    if (!product) {
      return null
    }

    const [images, storedSpecs] = await Promise.all([
      query(
        db,
        `SELECT image_id, product_id, image_url, image_name, image_type, description, is_main, upload_time, status
         FROM product_images
         WHERE product_id = ? ${includeDisabled ? '' : 'AND status = 1'}
         ORDER BY is_main DESC, image_id ASC`,
        [productId]
      ),
      query(
        db,
        `SELECT spec_id, product_id, spec_name, spec_value, sort_order, status
         FROM product_specs
         WHERE product_id = ? ${includeDisabled ? '' : 'AND status = 1'}
         ORDER BY sort_order ASC, spec_id ASC`,
        [productId]
      )
    ])
    const specs = storedSpecs.length ? storedSpecs : descriptionSpecs(product.description, productId)

    return {
      ...publicProduct({
        ...product,
        image_url: images[0] ? images[0].image_url : ''
      }),
      images: images.map((image) => publicImage(image)),
      specs: specs.map((spec) => publicSpec(spec))
    }
  }

  app.get('/health', asyncRoute(async (req, res) => {
    await query(db, 'SELECT 1 AS ok')
    sendSuccess(res, 200, '服务运行正常', { database: 'connected' })
  }))

  app.post('/register', asyncRoute(async (req, res) => {
    const user = validateUserInput(req.body)
    const conflict = await findUserConflict(user)
    throwConflict(conflict, user)

    const createdUser = await createUser(user)
    sendSuccess(res, 201, '注册成功', publicUser(createdUser))
  }))

  app.post('/login', asyncRoute(async (req, res) => {
    const account = normalizeText(req.body.username || req.body.account)
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!account || !password) {
      throw createHttpError(400, '请输入用户名或邮箱和密码')
    }

    const user = await findUserByAccount(account)

    if (!user) {
      throw createHttpError(404, '账号不存在')
    }

    if (Number(user.status) !== 1) {
      throw createHttpError(403, '账号已被禁用')
    }

    if (user.password !== password) {
      throw createHttpError(401, '密码错误')
    }

    const token = signToken({
      id: user.user_id,
      accountType: 'USER',
      username: user.username
    })

    sendSuccess(res, 200, '登录成功', {
      token,
      user: publicUser(user, 'USER')
    })
  }))

  app.post('/admin/login', asyncRoute(async (req, res) => {
    const account = normalizeText(req.body.account || req.body.username)
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!account || !password) {
      throw createHttpError(400, '请输入管理员账号和密码')
    }

    const admins = await query(
      db,
      `SELECT admin_id, admin_account, admin_password, email, role, status
       FROM admin
       WHERE admin_account = ?
       LIMIT 1`,
      [account]
    )
    const admin = admins[0]

    if (!admin) {
      throw createHttpError(404, '管理员账号不存在')
    }

    if (Number(admin.status) !== 1) {
      throw createHttpError(403, '管理员账号已被禁用')
    }

    if (admin.admin_password !== password) {
      throw createHttpError(401, '密码错误')
    }

    const token = signToken({
      id: admin.admin_id,
      accountType: 'ADMIN',
      account: admin.admin_account,
      role: admin.role || ''
    })

    sendSuccess(res, 200, '管理员登录成功', {
      token,
      user: publicAdmin(admin)
    })
  }))

  app.get('/admin/managers', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const managers = await query(
      db,
      `SELECT admin_id, admin_account, email, role, status
       FROM admin
       WHERE role = ?
       ORDER BY admin_id ASC`,
      ['普通管理员']
    )

    sendSuccess(res, 200, '获取普通管理员列表成功', managers.map((manager) => publicAdmin(manager)))
  }))

  app.post('/admin/managers', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const manager = validateManagerInput(req.body)
    await ensureManagerAccountUnique(manager.account)

    const createdManager = await withTransaction(() => createRegularManager(manager))
    sendSuccess(res, 201, '新增普通管理员成功', publicAdmin(createdManager))
  }))

  app.put('/admin/managers/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const adminId = validateId(req.params.id, '普通管理员')
    const current = await findRegularManagerById(adminId)

    if (!current) {
      throw createHttpError(404, '普通管理员不存在')
    }

    const manager = validateManagerInput({
      account: req.body.account === undefined ? current.admin_account : req.body.account,
      email: req.body.email === undefined ? current.email : req.body.email,
      password: req.body.password,
      status: req.body.status === undefined ? current.status : req.body.status
    }, { allowEmptyPassword: true })
    await ensureManagerAccountUnique(manager.account, adminId)

    const updatedManager = await updateRegularManager(adminId, manager)
    sendSuccess(res, 200, '普通管理员修改成功', publicAdmin(updatedManager))
  }))

  app.patch('/admin/managers/:id/status', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const adminId = validateId(req.params.id, '普通管理员')
    const status = normalizeStatus(req.body.status)
    const result = await query(
      db,
      'UPDATE admin SET status = ? WHERE admin_id = ? AND role = ?',
      [status, adminId, '普通管理员']
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '普通管理员不存在')
    }

    sendSuccess(res, 200, status === 1 ? '普通管理员已启用' : '普通管理员已禁用', { id: adminId, status })
  }))

  app.delete('/admin/managers/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const adminId = validateId(req.params.id, '普通管理员')
    const deletedCount = await withTransaction(() => deleteRegularManagerDeep(adminId))

    if (!deletedCount) {
      throw createHttpError(404, '普通管理员不存在')
    }

    sendSuccess(res, 200, '普通管理员删除成功', { id: adminId })
  }))

  app.post('/reset-password', asyncRoute(async (req, res) => {
    const account = normalizeText(req.body.account)
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!account) {
      throw createHttpError(400, '请输入用户名或邮箱')
    }

    if (password.length < 6 || password.length > 16) {
      throw createHttpError(400, '密码长度应为 6 至 16 个字符')
    }

    const user = await findUserByAccount(account)

    if (!user) {
      throw createHttpError(404, '账号不存在')
    }

    await query(
      db,
      'UPDATE users SET password = ? WHERE user_id = ?',
      [password, user.user_id]
    )

    sendSuccess(res, 200, '密码重置成功', null)
  }))

  app.get('/users/me', authenticate, asyncRoute(async (req, res) => {
    if (req.auth.accountType !== 'USER') {
      throw createHttpError(403, '管理员请使用用户管理接口')
    }

    const user = await findUserById(req.auth.id)

    if (!user) {
      throw createHttpError(404, '用户不存在')
    }

    sendSuccess(res, 200, '获取个人信息成功', publicUser(user, 'USER'))
  }))

  app.put('/users/me', authenticate, asyncRoute(async (req, res) => {
    if (req.auth.accountType !== 'USER') {
      throw createHttpError(403, '管理员请使用用户管理接口')
    }

    const currentUser = await findUserById(req.auth.id)

    if (!currentUser) {
      throw createHttpError(404, '用户不存在')
    }

    const mergedUser = validateUserInput({
      username: req.body.username === undefined ? currentUser.username : req.body.username,
      phone: req.body.phone === undefined ? currentUser.phone : req.body.phone,
      email: req.body.email === undefined ? currentUser.email : req.body.email,
      gender: req.body.gender === undefined ? currentUser.gender : req.body.gender,
      password: req.body.password === undefined ? currentUser.password : req.body.password,
      status: currentUser.status
    })
    const conflict = await findUserConflict(mergedUser, currentUser.user_id)
    throwConflict(conflict, mergedUser)

    await updateUser(currentUser.user_id, mergedUser)
    sendSuccess(res, 200, '个人信息修改成功', publicUser({
      ...currentUser,
      ...mergedUser
    }, 'USER'))
  }))

  app.get('/product-categories', authenticate, asyncRoute(async (req, res) => {
    const categories = await query(
      db,
      `SELECT category_id, category_name, parent_id, description, sort_order, icon, status
       FROM categories
       WHERE status = 1
       ORDER BY sort_order ASC, category_id ASC`
    )

    sendSuccess(res, 200, '获取产品分类成功', categories.map((category) => publicCategory(category)))
  }))

  app.get('/product-brands', authenticate, asyncRoute(async (req, res) => {
    const brands = await query(
      db,
      `SELECT brand_id, brand_name, logo, country, website, description, status
       FROM brands
       WHERE status = 1
       ORDER BY brand_name ASC`
    )

    sendSuccess(res, 200, '获取产品品牌成功', brands.map((brand) => publicBrand(brand)))
  }))

  app.get('/products', authenticate, asyncRoute(async (req, res) => {
    const conditions = ['p.status = 1', 'c.status = 1', 'b.status = 1']
    const params = []
    const keyword = normalizeText(req.query.keyword)
    const categoryId = Number(req.query.categoryId)
    const brandId = Number(req.query.brandId)
    const brandIds = normalizeText(req.query.brandIds)
      .split(',')
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0)
    const minPrice = Number(req.query.minPrice)
    const maxPrice = Number(req.query.maxPrice)

    if (keyword) {
      conditions.push('(p.product_name LIKE ? OR p.description LIKE ? OR b.brand_name LIKE ?)')
      const pattern = `%${keyword}%`
      params.push(pattern, pattern, pattern)
    }

    if (Number.isInteger(categoryId) && categoryId > 0) {
      conditions.push('p.category_id = ?')
      params.push(categoryId)
    }

    if (brandIds.length) {
      conditions.push(`p.brand_id IN (${brandIds.map(() => '?').join(', ')})`)
      params.push(...brandIds)
    } else if (Number.isInteger(brandId) && brandId > 0) {
      conditions.push('p.brand_id = ?')
      params.push(brandId)
    }

    if (Number.isFinite(minPrice) && minPrice >= 0 && req.query.minPrice !== undefined) {
      conditions.push('p.price >= ?')
      params.push(minPrice)
    }

    if (Number.isFinite(maxPrice) && maxPrice >= 0 && req.query.maxPrice !== undefined) {
      conditions.push('p.price <= ?')
      params.push(maxPrice)
    }

    const orderBy = {
      priceAsc: 'p.price ASC, p.product_id ASC',
      priceDesc: 'p.price DESC, p.product_id ASC',
      name: 'p.product_name ASC'
    }[req.query.sort] || 'p.view_count DESC, p.product_id ASC'

    const products = await query(
      db,
      `SELECT
         p.product_id,
         p.product_name,
         p.price,
         p.description,
         p.view_count,
         p.status,
         c.category_id,
         c.category_name,
         b.brand_id,
         b.brand_name,
         b.logo AS brand_logo,
         pi.image_url,
         (SELECT AVG(cm.rating) FROM comments cm WHERE cm.product_id = p.product_id AND cm.status = 1) AS rating,
         (SELECT COUNT(*) FROM comments cm WHERE cm.product_id = p.product_id AND cm.status = 1) AS comment_count,
         EXISTS(
           SELECT 1 FROM favorites f
           WHERE f.product_id = p.product_id AND f.user_id = ? AND f.status = 1
         ) AS is_favorite
       FROM products p
       INNER JOIN categories c ON c.category_id = p.category_id
       INNER JOIN brands b ON b.brand_id = p.brand_id
      LEFT JOIN (
         SELECT
           product_id,
           COALESCE(
             MIN(CASE WHEN is_main = 1 THEN image_url END),
             MIN(image_url)
           ) AS image_url
         FROM product_images
         WHERE status = 1
         GROUP BY product_id
       ) pi ON pi.product_id = p.product_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}`,
      [req.auth.accountType === 'USER' ? req.auth.id : 0, ...params]
    )

    sendSuccess(res, 200, '获取产品列表成功', products.map((product) => publicProduct(product)))
  }))

  app.get('/products/compare', authenticate, asyncRoute(async (req, res) => {
    const productIds = normalizeText(req.query.ids)
      .split(',')
      .map((id) => Number(id))
      .filter((id, index, values) => Number.isInteger(id) && id > 0 && values.indexOf(id) === index)

    if (productIds.length < 2 || productIds.length > 5) {
      throw createHttpError(400, '请选择 2 至 5 款产品进行对比')
    }

    const userId = req.auth.accountType === 'USER' ? req.auth.id : 0
    const details = await Promise.all(productIds.map((productId) => {
      return fetchProductDetail(productId, userId)
    }))

    if (details.some((product) => !product)) {
      throw createHttpError(404, '部分对比产品不存在或已下架')
    }

    sendSuccess(res, 200, '获取产品对比信息成功', details)
  }))

  app.get('/products/:id', authenticate, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const userId = req.auth.accountType === 'USER' ? req.auth.id : 0
    const product = await fetchProductDetail(productId, userId)

    if (!product) {
      throw createHttpError(404, '产品不存在或已下架')
    }

    await query(db, 'UPDATE products SET view_count = view_count + 1 WHERE product_id = ?', [productId])
    product.viewCount += 1
    sendSuccess(res, 200, '获取产品详情成功', product)
  }))

  app.get('/products/:id/comments', authenticate, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const comments = await query(
      db,
      `SELECT c.comment_id, c.user_id, u.username, c.product_id, p.product_name, c.content,
              c.rating, c.comment_time, c.like_count, c.reply_count, c.status
       FROM comments c
       INNER JOIN users u ON u.user_id = c.user_id
       INNER JOIN products p ON p.product_id = c.product_id
       WHERE c.product_id = ? AND c.status = 1
       ORDER BY c.comment_time DESC, c.comment_id DESC`,
      [productId]
    )

    sendSuccess(res, 200, '获取产品评论成功', comments.map((comment) => publicComment(comment)))
  }))

  app.post('/products/:id/comments', authenticate, requireUser, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const product = await findProductById(productId)

    if (!product || Number(product.status) !== 1) {
      throw createHttpError(404, '产品不存在或已下架')
    }

    const comment = validateCommentInput(req.body)
    const result = await query(
      db,
      `INSERT INTO comments
        (user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
       VALUES (?, ?, ?, ?, NOW(), 0, 0, 1)`,
      [req.auth.id, productId, comment.content, comment.rating]
    )

    sendSuccess(res, 201, '评论发表成功', {
      id: result.insertId,
      productId,
      userId: req.auth.id,
      ...comment
    })
  }))

  app.put('/comments/:id', authenticate, requireUser, asyncRoute(async (req, res) => {
    const commentId = validateId(req.params.id, '评论')
    const comment = validateCommentInput(req.body)
    const result = await query(
      db,
      `UPDATE comments
       SET content = ?, rating = ?, comment_time = NOW()
       WHERE comment_id = ? AND user_id = ?`,
      [comment.content, comment.rating, commentId, req.auth.id]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '评论不存在或无权修改')
    }

    sendSuccess(res, 200, '评论修改成功', { id: commentId, ...comment })
  }))

  app.delete('/comments/:id', authenticate, requireUser, asyncRoute(async (req, res) => {
    const commentId = validateId(req.params.id, '评论')
    const result = await query(
      db,
      'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
      [commentId, req.auth.id]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '评论不存在或无权删除')
    }

    sendSuccess(res, 200, '评论删除成功', { id: commentId })
  }))

  app.get('/favorites', authenticate, requireUser, asyncRoute(async (req, res) => {
    const favorites = await query(
      db,
      `SELECT
         p.product_id,
         p.product_name,
         p.price,
         p.description,
         p.view_count,
         p.release_time,
         p.status,
         c.category_id,
         c.category_name,
         b.brand_id,
         b.brand_name,
         b.logo AS brand_logo,
         pi.image_url,
         f.favorite_time,
         1 AS is_favorite
       FROM favorites f
       INNER JOIN products p ON p.product_id = f.product_id
       INNER JOIN categories c ON c.category_id = p.category_id
       INNER JOIN brands b ON b.brand_id = p.brand_id
       LEFT JOIN (
         SELECT
           product_id,
           COALESCE(
             MIN(CASE WHEN is_main = 1 THEN image_url END),
             MIN(image_url)
           ) AS image_url
         FROM product_images
         WHERE status = 1
         GROUP BY product_id
       ) pi ON pi.product_id = p.product_id
       WHERE f.user_id = ? AND f.status = 1
       ORDER BY f.favorite_time DESC`,
      [req.auth.id]
    )

    sendSuccess(res, 200, '获取收藏列表成功', favorites.map((product) => ({
      ...publicProduct(product),
      favoriteTime: product.favorite_time
    })))
  }))

  app.post('/favorites/:productId', authenticate, requireUser, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.productId, '产品')
    const product = await findProductById(productId)

    if (!product || Number(product.status) !== 1) {
      throw createHttpError(404, '产品不存在或已下架')
    }

    await query(
      db,
      `INSERT INTO favorites (user_id, product_id, favorite_time, status)
       VALUES (?, ?, NOW(), 1)
       ON DUPLICATE KEY UPDATE favorite_time = NOW(), status = 1`,
      [req.auth.id, productId]
    )

    sendSuccess(res, 201, '收藏成功', { productId, isFavorite: true })
  }))

  app.delete('/favorites/:productId', authenticate, requireUser, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.productId, '产品')
    const result = await query(
      db,
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.auth.id, productId]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '收藏记录不存在')
    }

    sendSuccess(res, 200, '已取消收藏', { productId, isFavorite: false })
  }))

  app.get('/admin/products', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const conditions = []
    const params = []
    const categoryId = Number(req.query.categoryId)

    if (Number.isInteger(categoryId) && categoryId > 0) {
      conditions.push('p.category_id = ?')
      params.push(categoryId)
    }

    const products = await query(
      db,
      `SELECT
         p.product_id,
         p.product_name,
         p.price,
         p.description,
         p.view_count,
         p.status,
         c.category_id,
         c.category_name,
         b.brand_id,
         b.brand_name,
         b.logo AS brand_logo,
         pi.image_url
       FROM products p
       INNER JOIN categories c ON c.category_id = p.category_id
       INNER JOIN brands b ON b.brand_id = p.brand_id
       LEFT JOIN (
         SELECT
           product_id,
           COALESCE(
             MIN(CASE WHEN is_main = 1 THEN image_url END),
             MIN(image_url)
           ) AS image_url
         FROM product_images
         WHERE status = 1
         GROUP BY product_id
       ) pi ON pi.product_id = p.product_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY p.product_id ASC`
      ,
      params
    )

    sendSuccess(res, 200, '获取设备列表成功', products.map((product) => publicProduct(product)))
  }))

  app.post('/admin/products', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const product = validateProductInput(req.body)
    const result = await query(
      db,
      `INSERT INTO products
        (product_name, category_id, brand_id, price, description, view_count, release_time, status)
       VALUES (?, ?, ?, ?, ?, 0, NOW(), ?)`,
      [
        product.name,
        product.categoryId,
        product.brandId,
        product.price,
        product.description || null,
        product.status
      ]
    )

    sendSuccess(res, 201, '新增设备成功', {
      id: result.insertId,
      ...product
    })
  }))

  app.put('/admin/products/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = Number(req.params.id)
    const currentProduct = await findProductById(productId)

    if (!currentProduct) {
      throw createHttpError(404, '设备不存在')
    }

    const product = validateProductInput({
      name: req.body.name === undefined ? currentProduct.product_name : req.body.name,
      categoryId: req.body.categoryId === undefined ? currentProduct.category_id : req.body.categoryId,
      brandId: req.body.brandId === undefined ? currentProduct.brand_id : req.body.brandId,
      price: req.body.price === undefined ? currentProduct.price : req.body.price,
      description: req.body.description === undefined ? currentProduct.description : req.body.description,
      status: req.body.status === undefined ? currentProduct.status : req.body.status
    })
    const result = await query(
      db,
      `UPDATE products
       SET product_name = ?, category_id = ?, brand_id = ?, price = ?, description = ?, status = ?
       WHERE product_id = ?`,
      [
        product.name,
        product.categoryId,
        product.brandId,
        product.price,
        product.description || null,
        product.status,
        productId
      ]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '设备不存在')
    }

    sendSuccess(res, 200, '设备信息修改成功', {
      id: productId,
      ...product
    })
  }))

  app.patch('/admin/products/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = Number(req.params.id)
    const status = Number(req.body.status)

    if (![0, 1].includes(status)) {
      throw createHttpError(400, '设备状态只能为 0 或 1')
    }

    const result = await query(
      db,
      'UPDATE products SET status = ? WHERE product_id = ?',
      [status, productId]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '设备不存在')
    }

    sendSuccess(res, 200, status === 1 ? '设备已启用' : '设备已禁用', {
      id: productId,
      status
    })
  }))

  app.delete('/admin/products/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const productId = Number(req.params.id)
    const assetPaths = []
    const deletedCount = await withTransaction(() => deleteProductDeep(productId, assetPaths))
    assetPaths.forEach(deleteGeneratedAsset)

    if (!deletedCount) {
      throw createHttpError(404, '设备不存在')
    }

    sendSuccess(res, 200, '设备删除成功', { id: productId })
  }))

  app.get('/admin/categories', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const categories = await query(
      db,
      `SELECT category_id, category_name, parent_id, description, sort_order, icon, status
       FROM categories
       ORDER BY sort_order ASC, category_id ASC`
    )

    sendSuccess(res, 200, '获取分类列表成功', categories.map((category) => publicCategory(category)))
  }))

  app.post('/admin/categories', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const category = validateCategoryInput(req.body)
    const result = await query(
      db,
      `INSERT INTO categories
        (category_name, parent_id, description, sort_order, icon, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category.name,
        category.parentId,
        category.description || null,
        category.sortOrder,
        category.icon || null,
        category.status
      ]
    )

    sendSuccess(res, 201, '分类新增成功', { id: result.insertId, ...category })
  }))

  app.put('/admin/categories/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const categoryId = validateId(req.params.id, '分类')
    const rows = await query(db, 'SELECT * FROM categories WHERE category_id = ? LIMIT 1', [categoryId])

    if (!rows[0]) {
      throw createHttpError(404, '分类不存在')
    }

    const current = rows[0]
    const category = validateCategoryInput({
      name: req.body.name === undefined ? current.category_name : req.body.name,
      parentId: req.body.parentId === undefined ? current.parent_id : req.body.parentId,
      description: req.body.description === undefined ? current.description : req.body.description,
      sortOrder: req.body.sortOrder === undefined ? current.sort_order : req.body.sortOrder,
      icon: req.body.icon === undefined ? current.icon : req.body.icon,
      status: req.body.status === undefined ? current.status : req.body.status
    })

    if (category.parentId === categoryId) {
      throw createHttpError(400, '分类不能将自己设为父级')
    }

    await query(
      db,
      `UPDATE categories
       SET category_name = ?, parent_id = ?, description = ?, sort_order = ?, icon = ?, status = ?
       WHERE category_id = ?`,
      [
        category.name,
        category.parentId,
        category.description || null,
        category.sortOrder,
        category.icon || null,
        category.status,
        categoryId
      ]
    )

    sendSuccess(res, 200, '分类修改成功', { id: categoryId, ...category })
  }))

  app.patch('/admin/categories/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const categoryId = validateId(req.params.id, '分类')
    const status = normalizeStatus(req.body.status)
    const result = await query(db, 'UPDATE categories SET status = ? WHERE category_id = ?', [status, categoryId])

    if (!result.affectedRows) {
      throw createHttpError(404, '分类不存在')
    }

    sendSuccess(res, 200, status === 1 ? '分类已启用' : '分类已禁用', { id: categoryId, status })
  }))

  app.delete('/admin/categories/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const categoryId = validateId(req.params.id, '分类')
    const assetPaths = []
    const deletedCount = await withTransaction(() => deleteCategoryDeep(categoryId, assetPaths))
    assetPaths.forEach(deleteGeneratedAsset)

    if (!deletedCount) {
      throw createHttpError(404, '分类不存在')
    }

    sendSuccess(res, 200, '分类删除成功', { id: categoryId })
  }))

  app.get('/admin/brands', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const brands = await query(
      db,
      `SELECT brand_id, brand_name, logo, country, website, description, status
       FROM brands
       ORDER BY brand_id ASC`
    )

    sendSuccess(res, 200, '获取品牌列表成功', brands.map((brand) => publicBrand(brand)))
  }))

  app.post('/admin/brands', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const brand = validateBrandInput(req.body)
    const uploadedLogo = req.body.logoDataUrl
      ? saveUploadedBrandLogo(req.body.logoDataUrl, req.body.logoName || brand.name)
      : null
    const logo = uploadedLogo ? uploadedLogo.url : brand.logo
    const result = await query(
      db,
      `INSERT INTO brands (brand_name, logo, country, website, description, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        brand.name,
        logo || null,
        brand.country || null,
        brand.website || null,
        brand.description || null,
        brand.status
      ]
    )

    sendSuccess(res, 201, '品牌新增成功', { id: result.insertId, ...brand, logo })
  }))

  app.put('/admin/brands/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const brandId = validateId(req.params.id, '品牌')
    const rows = await query(db, 'SELECT * FROM brands WHERE brand_id = ? LIMIT 1', [brandId])

    if (!rows[0]) {
      throw createHttpError(404, '品牌不存在')
    }

    const current = rows[0]
    const brand = validateBrandInput({
      name: req.body.name === undefined ? current.brand_name : req.body.name,
      logo: req.body.logo === undefined ? current.logo : req.body.logo,
      country: req.body.country === undefined ? current.country : req.body.country,
      website: req.body.website === undefined ? current.website : req.body.website,
      description: req.body.description === undefined ? current.description : req.body.description,
      status: req.body.status === undefined ? current.status : req.body.status
    })
    const uploadedLogo = req.body.logoDataUrl
      ? saveUploadedBrandLogo(req.body.logoDataUrl, req.body.logoName || brand.name)
      : null
    const logo = uploadedLogo ? uploadedLogo.url : brand.logo

    await query(
      db,
      `UPDATE brands
       SET brand_name = ?, logo = ?, country = ?, website = ?, description = ?, status = ?
       WHERE brand_id = ?`,
      [
        brand.name,
        logo || null,
        brand.country || null,
        brand.website || null,
        brand.description || null,
        brand.status,
        brandId
      ]
    )

    sendSuccess(res, 200, '品牌修改成功', { id: brandId, ...brand, logo })
  }))

  app.patch('/admin/brands/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const brandId = validateId(req.params.id, '品牌')
    const status = normalizeStatus(req.body.status)
    const result = await query(db, 'UPDATE brands SET status = ? WHERE brand_id = ?', [status, brandId])

    if (!result.affectedRows) {
      throw createHttpError(404, '品牌不存在')
    }

    sendSuccess(res, 200, status === 1 ? '品牌已启用' : '品牌已禁用', { id: brandId, status })
  }))

  app.delete('/admin/brands/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const brandId = validateId(req.params.id, '品牌')
    const assetPaths = []
    const deletedCount = await withTransaction(() => deleteBrandDeep(brandId, assetPaths))
    assetPaths.forEach(deleteGeneratedAsset)

    if (!deletedCount) {
      throw createHttpError(404, '品牌不存在')
    }

    sendSuccess(res, 200, '品牌删除成功', { id: brandId })
  }))

  app.get('/admin/products/:id/specs', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const product = await findProductById(productId)

    if (!product) {
      throw createHttpError(404, '产品不存在')
    }

    const specs = await query(
      db,
      `SELECT spec_id, product_id, spec_name, spec_value, sort_order, status
       FROM product_specs
       WHERE product_id = ?
       ORDER BY sort_order ASC, spec_id ASC`,
      [productId]
    )

    sendSuccess(res, 200, '获取产品配置成功', specs.map((spec) => publicSpec(spec)))
  }))

  app.post('/admin/products/:id/specs', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const product = await findProductById(productId)

    if (!product) {
      throw createHttpError(404, '产品不存在')
    }

    const spec = validateSpecInput(req.body)
    const result = await query(
      db,
      `INSERT INTO product_specs (product_id, spec_name, spec_value, sort_order, status)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, spec.name, spec.value, spec.sortOrder, spec.status]
    )

    sendSuccess(res, 201, '产品配置新增成功', { id: result.insertId, productId, ...spec })
  }))

  app.put('/admin/product-specs/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const specId = validateId(req.params.id, '配置')
    const rows = await query(db, 'SELECT * FROM product_specs WHERE spec_id = ? LIMIT 1', [specId])

    if (!rows[0]) {
      throw createHttpError(404, '产品配置不存在')
    }

    const current = rows[0]
    const spec = validateSpecInput({
      name: req.body.name === undefined ? current.spec_name : req.body.name,
      value: req.body.value === undefined ? current.spec_value : req.body.value,
      sortOrder: req.body.sortOrder === undefined ? current.sort_order : req.body.sortOrder,
      status: req.body.status === undefined ? current.status : req.body.status
    })

    await query(
      db,
      `UPDATE product_specs
       SET spec_name = ?, spec_value = ?, sort_order = ?, status = ?
       WHERE spec_id = ?`,
      [spec.name, spec.value, spec.sortOrder, spec.status, specId]
    )

    sendSuccess(res, 200, '产品配置修改成功', {
      id: specId,
      productId: current.product_id,
      ...spec
    })
  }))

  app.delete('/admin/product-specs/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const specId = validateId(req.params.id, '配置')
    const result = await query(db, 'DELETE FROM product_specs WHERE spec_id = ?', [specId])

    if (!result.affectedRows) {
      throw createHttpError(404, '产品配置不存在')
    }

    sendSuccess(res, 200, '产品配置删除成功', { id: specId })
  }))

  app.get('/admin/products/:id/images', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const images = await query(
      db,
      `SELECT image_id, product_id, image_url, image_name, image_type, description, is_main, upload_time, status
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_main DESC, image_id ASC`,
      [productId]
    )

    sendSuccess(res, 200, '获取产品图片成功', images.map((image) => publicImage(image)))
  }))

  app.post('/admin/products/:id/images', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const productId = validateId(req.params.id, '产品')
    const product = await findProductById(productId)

    if (!product) {
      throw createHttpError(404, '产品不存在')
    }

    const imageFolder = await getProductImageFolder(productId)
    const uploaded = req.body.dataUrl
      ? saveUploadedImage(req.body.dataUrl, req.body.name, imageFolder)
      : {
          url: normalizeText(req.body.url || req.body.imageUrl),
          name: normalizeText(req.body.name),
          type: normalizeText(req.body.type)
        }
    const description = normalizeText(req.body.description)
    const isMain = Number(req.body.isMain) === 1 ? 1 : 0
    const status = normalizeStatus(req.body.status)

    if (!uploaded.url) {
      throw createHttpError(400, '请选择图片或填写图片地址')
    }

    if (isMain) {
      await query(db, 'UPDATE product_images SET is_main = 0 WHERE product_id = ?', [productId])
    }

    const result = await query(
      db,
      `INSERT INTO product_images
        (product_id, image_url, image_name, image_type, description, is_main, upload_time, status)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        productId,
        uploaded.url,
        uploaded.name || null,
        uploaded.type || null,
        description || null,
        isMain,
        status
      ]
    )

    sendSuccess(res, 201, '产品图片新增成功', {
      id: result.insertId,
      productId,
      url: uploaded.url,
      isMain,
      status
    })
  }))

  app.put('/admin/product-images/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const imageId = validateId(req.params.id, '图片')
    const rows = await query(db, 'SELECT * FROM product_images WHERE image_id = ? LIMIT 1', [imageId])

    if (!rows[0]) {
      throw createHttpError(404, '产品图片不存在')
    }

    const current = rows[0]
    const imageFolder = await getProductImageFolder(current.product_id)
    const uploaded = req.body.dataUrl
      ? saveUploadedImage(req.body.dataUrl, req.body.name || current.image_name, imageFolder)
      : {
          url: req.body.url === undefined ? current.image_url : normalizeText(req.body.url),
          name: req.body.name === undefined ? current.image_name : normalizeText(req.body.name),
          type: req.body.type === undefined ? current.image_type : normalizeText(req.body.type)
        }
    const description = req.body.description === undefined
      ? current.description
      : normalizeText(req.body.description)
    const isMain = req.body.isMain === undefined
      ? Number(current.is_main)
      : (Number(req.body.isMain) === 1 ? 1 : 0)
    const status = req.body.status === undefined ? Number(current.status) : normalizeStatus(req.body.status)

    if (!uploaded.url) {
      throw createHttpError(400, '图片地址不能为空')
    }

    if (isMain) {
      await query(db, 'UPDATE product_images SET is_main = 0 WHERE product_id = ?', [current.product_id])
    }

    await query(
      db,
      `UPDATE product_images
       SET image_url = ?, image_name = ?, image_type = ?, description = ?, is_main = ?, status = ?
       WHERE image_id = ?`,
      [
        uploaded.url,
        uploaded.name || null,
        uploaded.type || null,
        description || null,
        isMain,
        status,
        imageId
      ]
    )

    if (req.body.dataUrl && current.image_url !== uploaded.url) {
      deleteGeneratedAsset(current.image_url)
    }

    sendSuccess(res, 200, '产品图片修改成功', {
      id: imageId,
      productId: current.product_id,
      url: uploaded.url,
      isMain,
      status
    })
  }))

  app.patch('/admin/product-images/:id/main', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const imageId = validateId(req.params.id, '图片')
    const rows = await query(db, 'SELECT * FROM product_images WHERE image_id = ? LIMIT 1', [imageId])

    if (!rows[0]) {
      throw createHttpError(404, '产品图片不存在')
    }

    const image = rows[0]
    await query(db, 'UPDATE product_images SET is_main = 0 WHERE product_id = ?', [image.product_id])
    await query(db, 'UPDATE product_images SET is_main = 1, status = 1 WHERE image_id = ?', [imageId])
    sendSuccess(res, 200, '产品主图设置成功', { id: imageId, productId: image.product_id, isMain: 1 })
  }))

  app.delete('/admin/product-images/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const imageId = validateId(req.params.id, '图片')
    const rows = await query(db, 'SELECT * FROM product_images WHERE image_id = ? LIMIT 1', [imageId])

    if (!rows[0]) {
      throw createHttpError(404, '产品图片不存在')
    }

    const image = rows[0]
    await query(db, 'DELETE FROM product_images WHERE image_id = ?', [imageId])

    deleteGeneratedAsset(image.image_url)

    sendSuccess(res, 200, '产品图片删除成功', { id: imageId })
  }))

  app.get('/admin/comments', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const conditions = []
    const params = []
    const status = req.query.status === undefined || req.query.status === ''
      ? null
      : normalizeStatus(req.query.status)

    if (status !== null) {
      conditions.push('c.status = ?')
      params.push(status)
    }

    const comments = await query(
      db,
      `SELECT c.comment_id, c.user_id, u.username, c.product_id, p.product_name, c.content,
              c.rating, c.comment_time, c.like_count, c.reply_count, c.status
       FROM comments c
       INNER JOIN users u ON u.user_id = c.user_id
       INNER JOIN products p ON p.product_id = c.product_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY c.comment_time DESC, c.comment_id DESC`,
      params
    )

    sendSuccess(res, 200, '获取评论列表成功', comments.map((comment) => publicComment(comment)))
  }))

  app.patch('/admin/comments/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const commentId = validateId(req.params.id, '评论')
    const status = normalizeStatus(req.body.status)
    const result = await query(db, 'UPDATE comments SET status = ? WHERE comment_id = ?', [status, commentId])

    if (!result.affectedRows) {
      throw createHttpError(404, '评论不存在')
    }

    sendSuccess(res, 200, status === 1 ? '评论已显示' : '评论已隐藏', { id: commentId, status })
  }))

  app.delete('/admin/comments/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const commentId = validateId(req.params.id, '评论')
    const deletedCount = await withTransaction(() => deleteCommentDeep(commentId))

    if (!deletedCount) {
      throw createHttpError(404, '评论不存在')
    }

    sendSuccess(res, 200, '评论删除成功', { id: commentId })
  }))

  app.get('/users', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const users = await query(
      db,
      `SELECT user_id, username, phone, email, gender, status, register_time
       FROM users
       ORDER BY user_id ASC`
    )

    sendSuccess(res, 200, '获取用户列表成功', users.map((user) => publicUser(user)))
  }))

  app.post('/users', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const user = validateUserInput(req.body)
    const conflict = await findUserConflict(user)
    throwConflict(conflict, user)

    const createdUser = await createUser(user)
    sendSuccess(res, 201, '新增用户成功', publicUser(createdUser))
  }))

  app.put('/users/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const userId = Number(req.params.id)
    const currentUser = await findUserById(userId)

    if (!currentUser) {
      throw createHttpError(404, '用户不存在')
    }

    const mergedUser = validateUserInput({
      username: req.body.username === undefined ? currentUser.username : req.body.username,
      phone: req.body.phone === undefined ? currentUser.phone : req.body.phone,
      email: req.body.email === undefined ? currentUser.email : req.body.email,
      gender: req.body.gender === undefined ? currentUser.gender : req.body.gender,
      password: req.body.password === undefined ? currentUser.password : req.body.password,
      status: req.body.status === undefined ? currentUser.status : req.body.status
    })
    const conflict = await findUserConflict(mergedUser, userId)
    throwConflict(conflict, mergedUser)

    await updateUser(userId, mergedUser)
    sendSuccess(res, 200, '用户信息修改成功', publicUser({
      ...currentUser,
      ...mergedUser
    }))
  }))

  app.patch('/users/:id/status', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const userId = Number(req.params.id)
    const status = Number(req.body.status)

    if (![0, 1].includes(status)) {
      throw createHttpError(400, '用户状态只能为 0 或 1')
    }

    const result = await query(
      db,
      'UPDATE users SET status = ? WHERE user_id = ?',
      [status, userId]
    )

    if (!result.affectedRows) {
      throw createHttpError(404, '用户不存在')
    }

    sendSuccess(res, 200, status === 1 ? '用户已启用' : '用户已禁用', {
      id: userId,
      status
    })
  }))

  app.delete('/users/:id', authenticate, requireSuperAdmin, asyncRoute(async (req, res) => {
    const userId = Number(req.params.id)
    const deletedCount = await withTransaction(() => deleteUserDeep(userId))

    if (!deletedCount) {
      throw createHttpError(404, '用户不存在')
    }

    sendSuccess(res, 200, '用户删除成功', { id: userId })
  }))

  app.use((req, res) => {
    res.status(404).json({
      code: 404,
      message: '接口不存在'
    })
  })

  app.use((err, req, res, next) => {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({
        code: 409,
        message: '该数据存在关联记录，无法直接删除'
      })
      return
    }

    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        code: 409,
        message: '该名称或关联记录已存在'
      })
      return
    }

    const status = err.status || 500
    res.status(status).json({
      code: status,
      message: status === 500 ? '服务器内部错误' : err.message
    })

    if (status === 500) {
      console.error(err)
    }
  })

  return app
}

function startServer() {
  const db = createDatabase()

  db.connect(async (err) => {
    if (err) {
      console.error('数据库连接失败:', err)
      return
    }

    try {
      await ensureFeatureSchema(db)
      console.log('成功连接到数据库')

      const app = createApp(db)
      app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`)
      })
    } catch (schemaError) {
      console.error('数据库结构初始化失败:', schemaError)
    }
  })
}

if (require.main === module) {
  startServer()
}

module.exports = {
  createApp,
  createDatabase,
  ensureFeatureSchema,
  startServer
}
