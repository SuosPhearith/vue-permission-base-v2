<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Detail" :loading="loading">
      <VCardText> {{ props?.initId }} </VCardText>
      <VCardText> {{ props?.initData }} </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";

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
  initData: {
    type: Object,
    default: null,
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
    // const resUser = await axiosInstance.get(`/user/${props.initId}`);
  } catch (error) {
    console.error("Error fetching roles:", error);
  } finally {
    loading.value = false;
  }
};
</script>
