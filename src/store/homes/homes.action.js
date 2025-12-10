import { homeService } from "../../services/home.service"
import { SET_IS_LOADING } from "./homes.reducer"
import { store } from "../store"
import {
  ADD_HOME,
  REMOVE_HOME,
  SET_HOMES,
  SET_HOME,
  UPDATE_HOME,
  ADD_HOME_MSG,
  SET_FILTER,
} from "./homes.reducer"

//setFilterBy({ location: "", checkIn: "", checkOut: "", capacity: "" }) reset filterBy

export async function loadHomes(filterBy) {
  try {
    const homes = await homeService.query(filterBy)

    store.dispatch(getCmdSetHomes(homes))
  } catch (err) {
    console.log("Cannot load homes", err)
    throw err
  }
}

export async function removeHome(homeId) {
  try {
    await homeService.remove(homeId)
    store.dispatch(getCmdRemoveHome(homeId))
  } catch (err) {
    console.log("Cannot remove home", err)
    throw err
  }
}

export async function addHome(home) {
  try {
    const savedHome = await homeService.save(home)
    store.dispatch(getCmdAddHome(savedHome))
    return savedHome
  } catch (err) {
    console.log("Cannot add home", err)
    throw err
  }
}

export async function updateHome(home) {
  try {
    const savedHome = await homeService.save(home)
    store.dispatch(getCmdUpdateHome(savedHome))
    return savedHome
  } catch (err) {
    console.log("Cannot save home", err)
    throw err
  }
}

export async function addHomeMsg(homeId, txt) {
  try {
    const msg = await homeService.addHomeMsg(homeId, txt)
    store.dispatch(getCmdAddHomeMsg(msg))
    return msg
  } catch (err) {
    console.log("Cannot add home msg", err)
    throw err
  }
}
export function setFilterBy(filterBy) {
  store.dispatch({ type: SET_FILTER, filterBy })
}
export function setIsLoading(isLoading) {
  store.dispatch({ type: SET_IS_LOADING, isLoading })
}

// Command Creators:
function getCmdSetHomes(homes) {
  return {
    type: SET_HOMES,
    homes,
  }
}
function getCmdSetHome(home) {
  return {
    type: SET_HOME,
    home,
  }
}
function getCmdRemoveHome(homeId) {
  return {
    type: REMOVE_HOME,
    homeId,
  }
}
function getCmdAddHome(home) {
  return {
    type: ADD_HOME,
    home,
  }
}
function getCmdUpdateHome(home) {
  return {
    type: UPDATE_HOME,
    home,
  }
}
function getCmdAddHomeMsg(msg) {
  return {
    type: ADD_HOME_MSG,
    msg,
  }
}
