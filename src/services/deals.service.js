import { httpService } from './http.service'

export const dealsService = {
  runOnce,
  getStatus,
  getDeals,
  getSnapshot,
  deleteWatchItem
}

function runOnce(overrides = {}) {
  return httpService.post('watchItem/run', overrides)
  //return httpService.post('deals/run', overrides)
}

function getStatus() {
  return httpService.get('deals/status')
}

function getDeals() {
  return httpService.get('deals')
}

function getSnapshot() {
  return httpService.get('deals/snapshot')
}

function deleteWatchItem(watchItemId) {
  return httpService.del(`watchItem/${watchItemId}`)
}
