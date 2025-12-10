import { configureStore } from "@reduxjs/toolkit"
import { homeReducer } from "./homes/homes.reducer"
import { userReducer } from "./user/user.reducer"

export const store = configureStore({
  reducer: {
    homeModule: homeReducer,
    userModule: userReducer,
  },
})

// For debugging in console
window.gStore = store
