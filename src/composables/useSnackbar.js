import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const color = ref('success')

const useSnackbar = () => {
  const trigger = (msg, variant = 'success', duration = 3000) => {
    message.value = msg
    color.value = variant
    show.value = true

    setTimeout(() => {
      show.value = false
    }, duration)
  }

  return {
    show,
    message,
    color,
    trigger,
  }
}

export default useSnackbar
