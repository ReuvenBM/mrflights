export const SET_USER = "SET_USER"
export const LOGOUT = "LOGOUT"
export const REMOVE_USER = "REMOVE_USER"
export const SET_USERS = "SET_USERS"

const initialState = {
  users: [],
  loggedInUser: null,
}

export function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, loggedInUser: action.user }

    case LOGOUT:
      return { ...state, loggedInUser: null }
    case REMOVE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.userId),
      }
    case SET_USERS:
      return { ...state, users: action.users }

    default:
      return state
  }
}
