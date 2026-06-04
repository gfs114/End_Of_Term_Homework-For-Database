const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('router separates normal users and administrators by role', () => {
  const router = read('src/router/index.js')

  assert.match(router, /AdminUsersPage/)
  assert.match(router, /path:\s*['"]\/user['"][\s\S]*role:\s*['"]USER['"]/)
  assert.match(router, /path:\s*['"]\/admin\/users['"][\s\S]*role:\s*['"]ADMIN['"]/)
  assert.match(router, /getAuthUser/)
})

test('administrator login enters the dedicated administrator side', () => {
  const adminLogin = read('src/components/AdminLogin.vue')

  assert.match(adminLogin, /\$router\.push\(['"]\/admin\/users['"]\)/)
})

test('normal user page only manages the current profile', () => {
  const userPage = read('src/components/user.vue')

  assert.doesNotMatch(userPage, /fetchUsers/)
  assert.doesNotMatch(userPage, /http\.get\(['"]\/users['"]\)/)
  assert.match(userPage, /http\.get\(['"]\/users\/me['"]\)/)
})

test('administrator page owns user CRUD operations', () => {
  const adminPage = read('src/components/AdminUsers.vue')

  assert.match(adminPage, /用户管理/)
  assert.match(adminPage, /http\.get\(['"]\/users['"]\)/)
  assert.match(adminPage, /http\.post\(['"]\/users['"]/)
  assert.match(adminPage, /http\.delete\(`\/users\/\$\{user\.id\}`\)/)
})

test('normal login restores the original simple visual direction without losing API login', () => {
  const loginPage = read('src/components/Login.vue')

  assert.match(loginPage, /这个是登录界面/)
  assert.doesNotMatch(loginPage, /auth-visual/)
  assert.match(loginPage, /http\.post\(['"]\/login['"]/)
})
