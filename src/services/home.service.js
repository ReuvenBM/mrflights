import { httpService } from './http.service'

export const homeService = {
  query,
  getById,
  save,
  remove,
  getHomeReviews,
  getFormattedDateRange,
  getFilterFromSearchParams,
  getHomesByHost,
  getHomeRating,
  normalize,
  denormalize
}

async function query(filterBy = {}) {
  return httpService.get('home', filterBy)
}

async function getById(id) {
  return httpService.get(`home/${id}`)
}

async function save(home) {
  const payload = home._id
    ? pickDefined(denormalize(home), [
      'host_id',
      'title',
      'description',
      'price',
      'capacity',
      'rooms',
      'beds',
      'bathrooms',
      'type',
      'img_urls',
      'rating',
      'number_of_raters',
      'added_to_wishlist',
      'guest_favorite',
      'location',
      'amenities',
      'highlights',
      'msgs',
      'unavailable_dates',
      'last_search_value',
      'createdAt'
    ])
    : denormalize(home)

  if (home._id) {
    return normalize(await httpService.put(`home/${home._id}`, payload))
  } else {
    return normalize(await httpService.post('home', payload))
  }
}


async function remove(id) {
  return httpService.del(`home/${id}`)
}

export async function getHomeReviews(homeId) {
  if (!homeId) throw new Error('homeId is required')
  const res = await httpService.get('review', { homeId })
  const list = Array.isArray(res) ? res : (res?.items || [])
  return list
}

export function getFormattedDateRange(checkIn, checkOut) {
  const toDate = v => v ? new Date(v) : null

  let inDate = toDate(checkIn)
  let outDate = toDate(checkOut)

  if (!inDate || !outDate) {
    const now = new Date()
    inDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)
    outDate = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate() + 2)
  }

  const fmt = d => ({
    m: d.toLocaleString('en-US', { month: 'short' }),
    day: d.getDate()
  })

  const a = fmt(inDate)
  const b = fmt(outDate)

  return a.m === b.m
    ? `${a.m} ${a.day}–${b.day}`
    : `${a.m} ${a.day} – ${b.m} ${b.day}`
}

function getFilterFromSearchParams(searchParams) {
  const sp = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams

  const locationStr = sp.get('location') || ''
  let city = ''
  let country = ''

  if (locationStr.includes(',')) {
    const [c1, c2] = locationStr.split(',')
    city = (c1 || '').trim()
    country = (c2 || '').trim()
  } else {
    city = locationStr.trim()
  }

  const num = v => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  return {
    location: locationStr,
    city,
    country,
    checkIn: sp.get('checkIn') || '',
    checkOut: sp.get('checkOut') || '',
    guests: num(sp.get('guests')) || 0,
    capacity: num(sp.get('capacity')),
    minPrice: num(sp.get('minPrice')),
    maxPrice: num(sp.get('maxPrice')),
    type: sp.get('type') || '',
    txt: sp.get('txt') || '',
    sortField: sp.get('sortField') || '',
    sortDir: sp.get('sortDir') || ''
  }
}

function pickDefined(obj, keys) {
  const out = {}
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k]
  return out
}
async function getHomesByHost(hostId) {
  if (!hostId) throw new Error('hostId is required')
  const res = await httpService.get('home', { host_id: hostId }) // match backend
  return Array.isArray(res)
    ? res
    : (Array.isArray(res?.items) ? res.items : [])
}

async function getHomeRating(homeId) {
  if (!homeId) throw new Error('homeId is required')

  try {
    const res = await httpService.get(`review/rating/${homeId}`)
    if (typeof res === 'number') return res
    if (res && typeof res.avg === 'number') return res.avg
  } catch (_) { }

  const reviews = await getHomeReviews(homeId)
  const nums = reviews.map(r => Number(r.rating)).filter(n => Number.isFinite(n))
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0
}

function normalize(h) {
  if (!h) return null

  const imgs = h.img_urls || h.imgUrls || []

  return {
    _id: h._id,
    hostId: h.host_id ?? h.hostId ?? null,
    title: h.title ?? "",
    description: h.description ?? "",
    price: h.price ?? 0,
    capacity: h.capacity ?? 0,
    rooms: h.rooms ?? null,
    beds: h.beds ?? null,
    bathrooms: h.bathrooms ?? null,
    type: h.type ?? null,

    imgUrls: imgs,
    imgUrl: Array.isArray(imgs) && imgs.length ? imgs[0] : "",

    rating: h.rating ?? 0,
    numberOfRaters: h.number_of_raters ?? h.numberOfRaters ?? 0,
    addedToWishlist: h.added_to_wishlist ?? h.addedToWishlist ?? false,
    guestFavorite: h.guest_favorite ?? h.guestFavorite ?? false,
    location: h.location ?? null,
    amenities: h.amenities ?? [],
    highlights: h.highlights ?? [],
    msgs: h.msgs ?? [],
    unavailableDates: h.unavailable_dates ?? h.unavailableDates ?? [],
    lastSearchValue: h.last_search_value ?? h.lastSearchValue ?? "",
    createdAt: h.createdAt ?? h.created_at ?? Date.now()
  }
}


function denormalize(h) {
  return {
    host_id: h.hostId,
    title: h.title,
    description: h.description,
    price: h.price,
    capacity: h.capacity,
    rooms: h.rooms,
    beds: h.beds,
    bathrooms: h.bathrooms,
    type: h.type,
    img_urls: h.imgUrls,
    rating: h.rating,
    number_of_raters: h.numberOfRaters,
    added_to_wishlist: h.addedToWishlist,
    guest_favorite: h.guestFavorite,
    location: h.location,
    amenities: h.amenities,
    highlights: h.highlights,
    msgs: h.msgs,
    unavailable_dates: h.unavailableDates,
    last_search_value: h.lastSearchValue,
    createdAt: h.createdAt
  }
}
