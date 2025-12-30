import { httpService } from './http.service'

export const dealsService = {
  saveCredentials,
  saveConfig,
  runOnce,
  getStatus,
  getDeals,
  getSchedule,
  startSchedule,
  stopSchedule
}

function saveCredentials({ clientId, clientSecret }) {
  return httpService.post('deals/credentials', { clientId, clientSecret })
}

function saveConfig(config) {
  return httpService.post('deals/config', config)
}

function runOnce(overrides = {}) {
  console.log(overrides)
  return httpService.post('watchItem', overrides)
  //return httpService.post('deals/run', overrides)
}

function getStatus() {
  return httpService.get('deals/status')
}

function getDeals() {
  return httpService.get('deals')
}

function getSchedule() {
  return httpService.get('deals/schedule')
}

function startSchedule(config) {
  return httpService.post('deals/schedule', config)
}

function stopSchedule() {
  return httpService.del('deals/schedule')
}
