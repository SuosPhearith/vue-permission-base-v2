import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import "./main.css";

// Styles
import '@core/scss/template/index.scss';
import '@styles/styles.scss';

// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)

// Register Pinia
app.use(createPinia())

// Mount vue app
app.mount('#app')
