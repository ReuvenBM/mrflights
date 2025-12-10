export const SET_HOMES = "SET_HOMES"
export const SET_HOME = "SET_HOME"
export const REMOVE_HOME = "REMOVE_HOME"
export const ADD_HOME = "ADD_HOME"
export const UPDATE_HOME = "UPDATE_HOME"
export const ADD_HOME_MSG = "ADD_HOME_MSG"
export const SET_FILTER = "SET_FILTER"
export const SET_IS_LOADING = "SET_IS_LOADING"

const initialState = {
  homes: [],
  filterBy: {},
  isLoading: false,
}

export function homeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_HOMES:
      return { ...state, homes: action.homes }

    case SET_HOME:
      return { ...state, home: action.home }

    case REMOVE_HOME:
      const lastRemovedHome = state.homes.find(home => home._id === action.homeId)
      return {
        ...state,
        homes: state.homes.filter(home => home._id !== action.homeId),
        lastRemovedHome
      }

    case ADD_HOME:
      return { ...state, homes: [...state.homes, action.home] }

    case UPDATE_HOME:
      return {
        ...state,
        homes: state.homes.map(home =>
          home._id === action.home._id ? action.home : home
        )
      }

    case ADD_HOME_MSG:
      return {
        ...state,
        home: {
          ...state.home,
          msgs: [...(state.home.msgs || []), action.msg]
        }
      }

    case SET_FILTER:
      return { ...state, filterBy: {...state.filterBy,...action.filterBy }}

    case SET_IS_LOADING:
      return { ...state, isLoading: action.isLoading }

    default:
      return state
  }
}
