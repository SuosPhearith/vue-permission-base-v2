import axiosInstance from '@/utils/axiosInstance'
import { defineStore } from 'pinia'

export const useSystemConfigStore = defineStore('systemconfig', {
  state: () => ({
    config: localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {},
    isLoading: false
  }),

  actions: {
    deepEqual(obj1, obj2) {
      if (obj1 === obj2) return true
      if (obj1 == null || obj2 == null) return false
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false
      
      const keys1 = Object.keys(obj1)
      const keys2 = Object.keys(obj2)
      
      if (keys1.length !== keys2.length) return false
      
      for (let key of keys1) {
        if (!keys2.includes(key)) return false
        if (!this.deepEqual(obj1[key], obj2[key])) return false
      }
      
      return true
    },

    async getConfig() {
      this.isLoading = true
      
      try {
        const cachedConfig = localStorage.getItem('config') 
          ? JSON.parse(localStorage.getItem('config')) 
          : {}
        
        const res = await axiosInstance.get('/config')
        const newConfig = res.data.data
        
        const hasChanged = !this.deepEqual(cachedConfig, newConfig)
        
        if (hasChanged) {
          console.log('Config has changed, updating...')
          this.config = newConfig
          localStorage.setItem('config', JSON.stringify(this.config))
          window.dispatchEvent(new CustomEvent('configUpdated', { 
            detail: { 
              oldConfig: cachedConfig, 
              newConfig: newConfig 
            }
          }))
          window.location.reload()
        } else {
          console.log('Config unchanged, using cached version')
          this.config = cachedConfig
        }
        
      } catch (error) {
        console.log('Error fetching config:', error)
        const cachedConfig = localStorage.getItem('config') 
          ? JSON.parse(localStorage.getItem('config')) 
          : {}
        this.config = cachedConfig
      } finally {
        this.isLoading = false
      }
    }
  }
})
