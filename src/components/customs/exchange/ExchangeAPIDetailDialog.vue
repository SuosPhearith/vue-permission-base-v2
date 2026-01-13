<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-lg">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Exchange Rate API" :loading="loading">
      <VCardText>
        <div class="mb-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-medium">Endpoint</div>
            <div class="text-h6 text-primary">
              {{ endpoint }}
            </div>
          </div>
          <VBtn
            icon="tabler-copy"
            variant="text"
            color="primary"
            @click="
              copyToClipboard(endpoint)
            "
          />
        </div>

        <div class="mb-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-medium">Authentication</div>
            <div class="text-h6 text-primary">
              X-API-KEY : {{ isVisible ? apiKey : "????????" }}
              <VIcon @click="toggleVisible">{{
                isVisible ? "tabler-eye" : "tabler-eye-off"
              }}</VIcon>
            </div>
          </div>
          <VBtn
            icon="tabler-copy"
            variant="text"
            color="primary"
            @click="copyToClipboard(apiKey)"
          />
        </div>

        <div class="flex items-center justify-center justify-space-between">
          <div class="font-weight-medium">Sample Response</div>
          <VBtn
            icon="tabler-copy"
            variant="text"
            color="primary"
            @click="copyToClipboard(responseData)"
          />
        </div>
        <pre class="border py-3 px-3 text-warning font-mono overflow-x-auto"
          >{{ JSON.stringify(responseData, null, 2) }}
    </pre
        >
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import useSnackbar from "@/composables/useSnackbar";
import axiosInstance from "@/utils/axiosInstance";
import { computed, ref, watch } from "vue";
const { trigger } = useSnackbar();

const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(typeof text === "object" ? JSON.stringify(text, null, 2) : text)
    .then(() => trigger("Copied"));
};

const responseData = ref({});
const apiKey = ref("");
const endpoint = ref("");

const isVisible = ref(false);

const toggleVisible = () => {
  isVisible.value = !isVisible.value;
};

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  refetch: {
    type: Function,
    default: () => {},
  },
  initId: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const onDialogOpen = () => {
  setup();
};

watch(isDialogVisible, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    onDialogOpen();
  }
});

//::::::::::::::::::::::::::::::::::::: STATES
const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const setup = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get(`billing/exchange/doc`);
    responseData.value = res.data.data;
    apiKey.value = res.data.api_key;
    endpoint.value = res.data.endpoint;
  } catch (error) {
    console.error("Error fetching roles:", error);
  } finally {
    loading.value = false;
  }
};
</script>
