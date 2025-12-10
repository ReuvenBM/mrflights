import { httpService } from './http.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

export const userService = {
  query,
  getById,
  save,
  remove,
  updateProfile,
  login,
  signup,
  logout,
  getLoggedinUser,
  saveLocalUser,
  getEmptyUser,
  getGreeting
}

function query(params = {}) {
  return httpService.get('user', params)
}

function getById(userId) {
  return httpService.get(`user/${userId}`)
}

function save(user) {
  if (user._id) return httpService.put(`user/${user._id}`, user)
  return httpService.post('user', user)
}

function remove(userId) {
  return httpService.del(`user/${userId}`)
}

async function updateProfile(user) {
  const userId = user._id || user.id
  if (!userId) throw new Error('userId is required')
  const updated = await httpService.put(`users/${userId}`, user)
  return saveLocalUser(updated)
}

async function login(credentials) {
  const user = await httpService.post('auth/login', credentials)
  return saveLocalUser(user)
}

async function signup(credentials) {
  const user = await httpService.post('auth/signup', credentials)
  return saveLocalUser(user)
}

async function logout() {
  await httpService.post('auth/logout')
  sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
}

function saveLocalUser(user) {
  const minimalUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    favorites: user.favorites || [],
    imgUrl: user.imgUrl || user.avatar || '',
    flightConfig: user.flightConfig || null
  }
  sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(minimalUser))
  return minimalUser
}

function getLoggedinUser() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function getEmptyUser() {
  return {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    email: '',
    imgUrl: ''
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}
