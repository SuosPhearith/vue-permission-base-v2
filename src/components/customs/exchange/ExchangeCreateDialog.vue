<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create new Exchange Rate" v-if="!loading">
      <VCardText>
        <VForm ref="form" lazy-validation>
          <VRow>
            <VCol cols="5" align-self="center">1 USD</VCol>
            <VCol cols="2" align-self="center"
              ><VIcon size="24" color="info"
                >tabler-arrows-exchange</VIcon
              ></VCol
            >
            <VCol cols="5">
              <v-text-field
                :rules="[requiredValidator]"
                label="? KHR"
                v-model="rate"
                type="number"
              ></v-text-field>
            </VCol>
            <VCol cols="12">
              <v-text-field
                :rules="[requiredValidator]"
                label="Source Reference"
                v-model="source"
              ></v-text-field>
            </VCol>
            <VCol cols="12">
              <VSwitch v-model="isActive" label="Active" inset></VSwitch>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="isDialogVisible = false"
          :disabled="pending"
        >
          Cancel
        </VBtn>
        <VBtn @click="handleCreate" :disabled="pending">
          <template v-if="pending">
            <VProgressCircular indeterminate color="primary" size="20" />
          </template>
          <template v-else> Create </template>
        </VBtn>
      </VCardText>
    </VCard>
    <v-card v-else> Loading... </v-card>
  </VDialog>
</template>

<script setup>
import { requiredValidator } from "@/@core/utils/validators";
import axiosInstance from "@/utils/axiosInstance";
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
});

const emit = defineEmits(["update:modelValue"]);

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const onDialogOpen = () => {
  resetForm();
};

watch(isDialogVisible, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    onDialogOpen();
  }
});

//::::::::::::::::::::::::::::::::::::: STATES
const form = ref();
const rate = ref("");
const source = ref("");
const isActive = ref(true);

const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const resetForm = () => {
  rate.value = "";
  source.value = "";
  isActive.value = true;

  if (form.value) {
    form.value.resetValidation();
  }
};

const handleCreate = async () => {
  const isValid = await form.value?.validate();

  if (isValid?.valid) {
    pending.value = true;
    try {
      const payload = {
        rate: rate.value,
        source: source.value,
        is_active: isActive.value,
      };

      await axiosInstance.post("/billing/exchange", payload);
      isDialogVisible.value = false;
      if (props.refetch) {
        await props.refetch();
      }
    } catch (error) {
      console.error("Error creating exchange rate:", error);
    } finally {
      pending.value = false;
    }
  }
};
</script>
