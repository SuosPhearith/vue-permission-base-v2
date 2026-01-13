import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    permissions: [],
    navigator: [],
  }),

  actions: {
    setAuth(payload) {
      this.user = payload.user
      this.permissions = payload.permissions
      this.navigator = payload.navigator
    },
    clearAuth() {
      this.user = null
      this.permissions = []
      this.navigator = []
    }
  },
  // persist: true,
})
