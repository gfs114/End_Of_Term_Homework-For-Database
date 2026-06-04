const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const path = require('path')

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
    description: category.description || ''
  }
}

function publicBrand(brand) {
  return {
    id: brand.brand_id,
    name: brand.brand_name,
    logo: brand.logo || '',
    country: brand.country || ''
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
    imageUrl: product.image_url || ''
  }
}

function createApp(db, options = {}) {
  const app = express()
  const jwtSecret = options.jwtSecret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET

  app.use(cors())
  app.use(express.json())
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

  // 课程演示接口：仅通过用户名或邮箱重置密码，不适合生产环境。
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
      `SELECT category_id, category_name, description
       FROM categories
       WHERE status = 1
       ORDER BY sort_order ASC, category_id ASC`
    )

    sendSuccess(res, 200, '获取产品分类成功', categories.map((category) => publicCategory(category)))
  }))

  app.get('/product-brands', authenticate, asyncRoute(async (req, res) => {
    const brands = await query(
      db,
      `SELECT brand_id, brand_name, logo, country
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

    if (Number.isInteger(brandId) && brandId > 0) {
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
         SELECT product_id, MIN(image_url) AS image_url
         FROM product_images
         WHERE is_main = 1 AND status = 1
         GROUP BY product_id
       ) pi ON pi.product_id = p.product_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}`,
      params
    )

    sendSuccess(res, 200, '获取产品列表成功', products.map((product) => publicProduct(product)))
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

  app.post('/users', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const user = validateUserInput(req.body)
    const conflict = await findUserConflict(user)
    throwConflict(conflict, user)

    const createdUser = await createUser(user)
    sendSuccess(res, 201, '新增用户成功', publicUser(createdUser))
  }))

  app.put('/users/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
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

  app.patch('/users/:id/status', authenticate, requireAdmin, asyncRoute(async (req, res) => {
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

  app.delete('/users/:id', authenticate, requireAdmin, asyncRoute(async (req, res) => {
    const userId = Number(req.params.id)
    const result = await query(
      db,
      'DELETE FROM users WHERE user_id = ?',
      [userId]
    )

    if (!result.affectedRows) {
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
        message: '该用户存在关联的收藏或评论，无法直接删除'
      })
      return
    }

    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        code: 409,
        message: '用户名已存在'
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

  db.connect((err) => {
    if (err) {
      console.error('数据库连接失败:', err)
      return
    }

    console.log('成功连接到数据库')
  })

  const app = createApp(db)
  return app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
  })
}

if (require.main === module) {
  startServer()
}

module.exports = {
  createApp,
  createDatabase,
  startServer
}
