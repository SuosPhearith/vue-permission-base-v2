<template>
  <VBtn icon variant="text" color="medium-emphasis">
    <img
      :src="`${fileUrl}${store.translates[store.locale].flag}`"
      class="w-[25px]"
    />
    <VMenu activator="parent">
      <VList>
        <VListItem
          v-for="(lang, key) in store.translates"
          :key="key"
          @click="changeLang(key)"
          :active="store.locale === key"
          active-color="primary"
        >
          <template #prepend>
            <img :src="`${fileUrl}${lang.flag}`" class="w-[25px] me-1" />
          </template>
          <VListItemTitle>{{ lang.title }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </VBtn>
</template>

<script setup>
import { useTranslateStore } from "@/stores/translate";

const store = useTranslateStore();
const fileUrl = import.meta.env.VITE_FILE_URL;

const changeLang = (lang) => {
  store.setLang(lang);
};
</script>
