<template>
  <div>
    <ConfirmDialog ref="dialogRef" />
    <div class="mb-6">
      <h1 class="font-weight-bold text-high-emphasis mb-2">
        {{ t.t("app.title") }}
      </h1>
      <p class=" text-medium-emphasis">
        {{ t.t("app.description") }}
      </p>
    </div>

    <VForm ref="form" lazy-validation>
      <VRow>
        <VCol cols="12" md="8">
          <VCard elevation="2" class="mb-6" :loading="loading">
            <VCardItem>
              <VCardTitle class="font-weight-bold">
                <VIcon icon="tabler-settings" class="me-2" />
                {{ t.t("general.title") }}
              </VCardTitle>
              <VCardSubtitle>
                {{ t.t("general.subtitle") }}
              </VCardSubtitle>
            </VCardItem>

            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VTextField
                    v-model="appForm.appName"
                    :label="t.t('app.name.label')"
                    :placeholder="t.t('app.name.placeholder')"
                    prepend-inner-icon="tabler-apps"
                    variant="outlined"
                    :rules="[requiredValidator]"
                    :hint="t.t('app.name.hint')"
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VDivider />

            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="appForm.layout"
                    :label="t.t('layout.label')"
                    :placeholder="t.t('layout.placeholder')"
                    prepend-inner-icon="tabler-layout"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    clear-icon="tabler-x"
                    :items="layoutOptions"
                    :rules="[requiredValidator]"
                    :hint="t.t('layout.hint')"
                    persistent-hint
                  >
                    <template #item="{ props, item }">
                      <VListItem v-bind="props">
                        <template #prepend>
                          <VIcon :icon="item.raw.icon" />
                        </template>
                        <VListItemSubtitle>{{
                          item.raw.description
                        }}</VListItemSubtitle>
                      </VListItem>
                    </template>
                  </VAutocomplete>
                </VCol>

                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="appForm.skin"
                    :label="t.t('skin.label')"
                    :placeholder="t.t('skin.placeholder')"
                    prepend-inner-icon="tabler-palette"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    clear-icon="tabler-x"
                    :items="skinOptions"
                    :rules="[requiredValidator]"
                    :hint="t.t('skin.hint')"
                    persistent-hint
                  >
                    <template #item="{ props, item }">
                      <VListItem v-bind="props">
                        <template #prepend>
                          <VIcon :icon="item.raw.icon" />
                        </template>
                        <VListItemSubtitle>{{
                          item.raw.description
                        }}</VListItemSubtitle>
                      </VListItem>
                    </template>
                  </VAutocomplete>
                </VCol>
              </VRow>
            </VCardText>

            <VDivider />

            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn variant="outlined" @click="resetForm" :disabled="pending">
                {{ t.t("reset") }}
              </VBtn>
              <VBtn color="primary" @click="handleSubmit" :loading="pending">
                {{ t.t("save") }}
              </VBtn>
            </VCardActions>
          </VCard>

          <VCard elevation="2">
            <VCardItem>
              <VCardTitle class="font-weight-bold">
                <VIcon icon="tabler-letter-t" class="me-2" />
                {{ t.t("font.title") }}
              </VCardTitle>
              <VCardSubtitle>
                {{ t.t("font.subtitle") }}
              </VCardSubtitle>
            </VCardItem>

            <VCardText>
              <VAutocomplete
                v-model="selectedFontId"
                :label="t.t('font.label')"
                prepend-inner-icon="tabler-letter-t"
                item-title="name"
                item-value="id"
                variant="outlined"
                clear-icon="tabler-x"
                :items="fontData"
                :rules="[requiredValidator]"
                :hint="t.t('font.hint')"
                persistent-hint
              />
            </VCardText>

            <VDivider />

            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn
                color="primary"
                @click="handleSubmitFont"
                :loading="pending"
              >
                {{ t.t("save") }}
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard elevation="2">
            <VCardItem>
              <VCardTitle class="font-weight-bold">
                <VIcon icon="tabler-calendar-cog" class="me-2" />
                {{ t.t("datetime.title") }}
              </VCardTitle>
              <VCardSubtitle>
                {{ t.t("datetime.subtitle") }}
              </VCardSubtitle>
            </VCardItem>

            <VCardText>
              <VAutocomplete
                v-model="selectedDatetimeId"
                :label="t.t('datetime.label')"
                prepend-inner-icon="tabler-calendar-cog"
                item-title="format"
                item-value="id"
                variant="outlined"
                clear-icon="tabler-x"
                :items="dateTimeData"
                :rules="[requiredValidator]"
                :hint="t.t('datetime.hint')"
                persistent-hint
              />
            </VCardText>

            <VDivider />

            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn
                color="primary"
                @click="handleSubmitDatetime"
                :loading="pending"
              >
                {{ t.t("save") }}
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>

<script setup>
import { requiredValidator } from "@/@core/utils/validators";
import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import useSnackbar from "@/composables/useSnackbar";
import { useTranslateStore } from "@/stores/translate";
import axiosInstance from "@/utils/axiosInstance";
import { onMounted, ref } from "vue";

const { trigger } = useSnackbar();
const dialogRef = ref();
const form = ref(null);

const selectedDatetimeId = ref(null);
const dateTimeData = ref([]);
const selectedFontId = ref(null);
const fontData = ref([]);
const t = useTranslateStore();

const appForm = ref({ appName: null, layout: null, skin: null });
const originalForm = ref({ appName: null, layout: null, skin: null });
const loading = ref(false);
const pending = ref(false);

const layoutOptions = [
  {
    id: "vertical",
    name: "Vertical Layout",
    description: "Side navigation menu",
    icon: "tabler-layout-sidebar",
  },
  {
    id: "horizontal",
    name: "Horizontal Layout",
    description: "Top navigation menu",
    icon: "tabler-layout-navbar",
  },
];

const skinOptions = [
  {
    id: "default",
    name: "Default Theme",
    description: "Clean and modern appearance",
    icon: "tabler-palette",
  },
  {
    id: "bordered",
    name: "Bordered Theme",
    description: "Defined borders and sections",
    icon: "tabler-border-all",
  },
];

const getData = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get("/config");
    const config = res.data?.data?.app_config;
    const configDatetime = res.data?.data?.datetime_format;
    const configFont = res.data?.data?.font;

    appForm.value.appName = config?.app_name || null;
    appForm.value.layout = config?.layout || null;
    appForm.value.skin = config?.skin || null;
    selectedDatetimeId.value = configDatetime?.active || null;
    dateTimeData.value = configDatetime?.formats || [];
    selectedFontId.value = configFont?.active || null;
    fontData.value = configFont?.fonts || [];
    originalForm.value = { ...appForm.value };
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  const confirm = await dialogRef.value.show({
    title: t.t("confirm.title"),
    message: t.t("confirm.message"),
    type: "primary",
  });
  if (!confirm) return;
  const isValid = await form.value?.validate();
  if (!isValid.valid) return;
  pending.value = true;
  try {
    await axiosInstance.put("/config/app-config", {
      app_name: appForm.value.appName,
      layout: appForm.value.layout,
      skin: appForm.value.skin,
    });
    trigger(t.t("updated.success"), "success");
    getData();
  } finally {
    pending.value = false;
  }
};

const handleSubmitDatetime = async () => {
  const confirm = await dialogRef.value.show({
    title: t.t("confirm.title"),
    message: t.t("confirm.message"),
    type: "primary",
  });
  if (!confirm) return;
  const isValid = await form.value?.validate();
  if (!isValid.valid) return;
  pending.value = true;
  try {
    await axiosInstance.put("/config/app-datetime", {
      active: +selectedDatetimeId.value,
    });
    trigger(t.t("updated.success"), "success");
    getData();
  } finally {
    pending.value = false;
  }
};

const handleSubmitFont = async () => {
  const confirm = await dialogRef.value.show({
    title: t.t("confirm.title"),
    message: t.t("confirm.message"),
    type: "primary",
  });
  if (!confirm) return;
  const isValid = await form.value?.validate();
  if (!isValid.valid) return;
  pending.value = true;
  try {
    await axiosInstance.put("/config/app-font", {
      active: +selectedFontId.value,
    });
    trigger(t.t("updated.success"), "success");
    getData();
  } finally {
    pending.value = false;
  }
};

const resetForm = () => {
  appForm.value = { ...originalForm.value };
  form.value?.resetValidation();
};

onMounted(() => {
  getData();
});
</script>
