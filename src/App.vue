<script setup>
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@core/utils/colorConverter";
import { useTheme } from "vuetify";
import axiosInstance from "./utils/axiosInstance";

import Loading from "./components/customs/Loading.vue";
import { useAuthStore } from "./stores/auth";
import { useSystemConfigStore } from "./stores/config";

import useSnackbar from "@/composables/useSnackbar";
import { useTranslateStore } from "./stores/translate";
const { show, message, color } = useSnackbar();

const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();

//:::::::::::::::::::::::::::::::::::::::::::::::: FETCH PERMISSION

const authStore = useAuthStore();
const translate = useTranslateStore();
const config = useSystemConfigStore();
const loading = ref(false);

const selectedFontName = computed(() => {
  const fonts = config?.config?.font?.fonts || [];
  const activeFonts = fonts.filter(
    (f) => f.id === config?.config?.font?.active
  );
  return activeFonts.length > 0 ? activeFonts[0].name : "";
});

const fontClass = computed(() => {
  switch (selectedFontName.value) {
    case "Siemreap":
      return "font-siemreap";
    case "Noto Sans Khmer":
      return "font-notosans";
    case "Hanuman":
      return "font-hanuman";
    case "Suwannaphum":
      return "font-suwannaphum";
    case "Nokora":
      return "font-nokora";
    default:
      return "font-siemreap";
  }
});

onMounted(async () => {
  loading.value = true;
  try {
    const resTranslate = await axiosInstance.get("/setting/get-translate");
    translate.setTranslates(resTranslate?.data?.data ?? {});
    const res = await axiosInstance.get("/auth/me");
    await config.getConfig();
    authStore.setAuth(res.data);

  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

//:::::::::::::::::::::::::::::::::::::::::::::::: FETCH PERMISSION
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
      :class="fontClass"
      v-if="!loading"
    >
      <VSnackbar
        v-model="show"
        :color="color"
        timeout="3000"
        location="bottom right"
      >
        {{ message }}
      </VSnackbar>
      <RouterView />

      <ScrollToTop />
    </VApp>
    <Loading v-else />
  </VLocaleProvider>
</template>
