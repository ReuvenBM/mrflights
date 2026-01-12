import { httpService } from './http.service'

export const dealsService = {
  saveCredentials,
  runOnce,
  getStatus,
  getDeals,
  getSnapshot
}

function saveCredentials({ clientId, clientSecret }) {
  return httpService.post('deals/credentials', { clientId, clientSecret })
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
