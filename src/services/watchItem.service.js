import { httpService } from './http.service'

export const watchItemService = {
  query,
  getById,
  save,
  remove,
  setStatus,
}

function query(filterBy = {}) {
  // supports: status, page, limit, origin, dest, date, etc (depending on backend)
  return httpService.get('watchitem', filterBy)
}

function getById(watchItemId) {
  return httpService.get(`watchitem/${watchItemId}`)
}

function save(watchItem) {
  // if _id exists -> update, else -> create
  if (watchItem?._id) return httpService.put(`watchitem/${watchItem._id}`, watchItem)
  return httpService.post('watchitem', watchItem)
}

function remove(watchItemId) {
  return httpService.del(`watchitem/${watchItemId}`)
}

function setStatus(watchItemId, status) {
  // expects backend route like: PUT /watchitem/:id/status { status }
  return httpService.put(`watchitem/${watchItemId}/status`, { status })
}