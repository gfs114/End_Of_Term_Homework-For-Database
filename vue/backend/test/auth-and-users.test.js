const test = require('node:test')
const assert = require('node:assert/strict')

const { createApp } = require('../server')

function createMemoryDatabase() {
  const state = {
    users: [
      {
        user_id: 1,
        username: 'gin',
        password: '123456',
        phone: '15860827759',
        email: 'gin@example.com',
        gender: '男',
        status: 1,
        register_time: new Date('2026-06-03T00:00:00.000Z')
      }
    ],
    admins: [
      {
        admin_id: 1,
        admin_account: 'admin1',
        admin_password: '123456',
        email: 'admin@example.com',
        role: '超级管理员',
        status: 1
      }
    ],
    nextUserId: 2
  }

  function selectPublicUsers() {
    return state.users.map(({ password, ...user }) => user)
  }

  return {
    state,
    query(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params
        params = []
      }

      const statement = sql.replace(/\s+/g, ' ').trim()

      try {
        if (statement.startsWith('SELECT 1')) {
          callback(null, [{ ok: 1 }])
          return
        }

        if (statement.includes('FROM users') && statement.includes('WHERE username = ? OR email = ?')) {
          const [username, email] = params
          const user = state.users.find((item) => item.username === username || item.email === email)
          callback(null, user ? [user] : [])
          return
        }

        if (statement.includes('FROM admin') && statement.includes('WHERE admin_account = ?')) {
          const [account] = params
          const admin = state.admins.find((item) => item.admin_account === account)
          callback(null, admin ? [admin] : [])
          return
        }

        if (statement.startsWith('SELECT') && statement.includes('FROM users') && statement.includes('WHERE user_id = ?')) {
          const [userId] = params
          const user = state.users.find((item) => item.user_id === Number(userId))
          callback(null, user ? [user] : [])
          return
        }

        if (statement.includes('FROM users') && statement.includes('WHERE username = ? OR phone = ? OR email = ?')) {
          const [username, phone, email] = params
          const user = state.users.find((item) => (
            item.username === username ||
            item.phone === phone ||
            item.email === email
          ))
          callback(null, user ? [user] : [])
          return
        }

        if (statement.startsWith('SELECT') && statement.includes('FROM users')) {
          callback(null, selectPublicUsers())
          return
        }

        if (statement.startsWith('INSERT INTO users')) {
          const [username, password, phone, email, gender, status] = params
          const user = {
            user_id: state.nextUserId,
            username,
            password,
            phone,
            email,
            gender,
            status,
            register_time: new Date('2026-06-03T00:00:00.000Z')
          }
          state.nextUserId += 1
          state.users.push(user)
          callback(null, { insertId: user.user_id, affectedRows: 1 })
          return
        }

        if (statement.startsWith('UPDATE users SET password = ?')) {
          const [password, userId] = params
          const user = state.users.find((item) => item.user_id === Number(userId))
          if (user) user.password = password
          callback(null, { affectedRows: user ? 1 : 0 })
          return
        }

        if (statement.startsWith('UPDATE users SET username = ?')) {
          const [username, phone, email, gender, password, status, userId] = params
          const user = state.users.find((item) => item.user_id === Number(userId))
          if (user) {
            Object.assign(user, { username, phone, email, gender, password, status })
          }
          callback(null, { affectedRows: user ? 1 : 0 })
          return
        }

        if (statement.startsWith('UPDATE users SET status = ?')) {
          const [status, userId] = params
          const user = state.users.find((item) => item.user_id === Number(userId))
          if (user) user.status = status
          callback(null, { affectedRows: user ? 1 : 0 })
          return
        }

        if (statement.startsWith('DELETE FROM users')) {
          const [userId] = params
          const index = state.users.findIndex((item) => item.user_id === Number(userId))
          if (index >= 0) state.users.splice(index, 1)
          callback(null, { affectedRows: index >= 0 ? 1 : 0 })
          return
        }

        callback(new Error(`Unexpected SQL in test: ${statement}`))
      } catch (error) {
        callback(error)
      }
    }
  }
}

async function withServer(app, callback) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()

  try {
    await callback(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const body = await response.json()
  return { response, body }
}

test('register creates a normal user', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const { response, body } = await request(baseUrl, '/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'new_user',
        phone: '13900000000',
        email: 'new@example.com',
        password: '123456'
      })
    })

    assert.equal(response.status, 201)
    assert.equal(body.code, 201)
    assert.equal(body.data.username, 'new_user')
    assert.equal(body.data.password, undefined)
  })
})

test('normal user login supports username or email and returns a token', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const usernameLogin = await request(baseUrl, '/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'gin', password: '123456' })
    })
    const emailLogin = await request(baseUrl, '/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'gin@example.com', password: '123456' })
    })

    assert.equal(usernameLogin.response.status, 200)
    assert.equal(usernameLogin.body.data.user.accountType, 'USER')
    assert.ok(usernameLogin.body.data.token)
    assert.equal(emailLogin.response.status, 200)
    assert.ok(emailLogin.body.data.token)
  })
})

test('administrator login returns an administrator token', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const { response, body } = await request(baseUrl, '/admin/login', {
      method: 'POST',
      body: JSON.stringify({ account: 'admin1', password: '123456' })
    })

    assert.equal(response.status, 200)
    assert.equal(body.data.user.accountType, 'ADMIN')
    assert.ok(body.data.token)
  })
})

test('reset password updates a user selected by username or email', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const reset = await request(baseUrl, '/reset-password', {
      method: 'POST',
      body: JSON.stringify({ account: 'gin@example.com', password: '654321' })
    })
    const login = await request(baseUrl, '/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'gin', password: '654321' })
    })

    assert.equal(reset.response.status, 200)
    assert.equal(login.response.status, 200)
  })
})

test('normal user can view self but cannot list all users', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const login = await request(baseUrl, '/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'gin', password: '123456' })
    })
    const token = login.body.data.token

    const self = await request(baseUrl, '/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const users = await request(baseUrl, '/users', {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(self.response.status, 200)
    assert.equal(self.body.data.username, 'gin')
    assert.equal(users.response.status, 403)
  })
})

test('administrator can list, create, update, disable, and delete users', async () => {
  const db = createMemoryDatabase()
  const app = createApp(db, { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const login = await request(baseUrl, '/admin/login', {
      method: 'POST',
      body: JSON.stringify({ account: 'admin1', password: '123456' })
    })
    const token = login.body.data.token
    const headers = { Authorization: `Bearer ${token}` }

    const created = await request(baseUrl, '/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: 'managed',
        phone: '13800000000',
        email: 'managed@example.com',
        password: '123456',
        gender: '女'
      })
    })
    const userId = created.body.data.id

    const updated = await request(baseUrl, `/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        username: 'managed_user',
        phone: '13800000000',
        email: 'managed@example.com',
        password: '654321',
        gender: '女',
        status: 1
      })
    })
    const disabled = await request(baseUrl, `/users/${userId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 0 })
    })
    const listed = await request(baseUrl, '/users', { headers })
    const deleted = await request(baseUrl, `/users/${userId}`, {
      method: 'DELETE',
      headers
    })

    assert.equal(created.response.status, 201)
    assert.equal(updated.response.status, 200)
    assert.equal(disabled.response.status, 200)
    assert.equal(listed.response.status, 200)
    assert.equal(listed.body.data.find((user) => user.id === userId).status, 0)
    assert.equal(deleted.response.status, 200)
  })
})
