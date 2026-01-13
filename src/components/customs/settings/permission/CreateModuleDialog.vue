<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-lg">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create new Permission" :loading="loading">
      <VForm ref="form" lazy-validation @submit.prevent="handleCreate">
        <VCardText>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator]"
                label="Module Name"
                v-model="name"
              ></v-text-field>
            </v-col>
          </v-row>
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
      </VForm>
    </VCard>
  </VDialog>
</template>

<script setup>
import { requiredValidator } from "@/@core/utils/validators";
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  refetchList: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

//::::::::::::::::::::::::::::::::::::: STATES
const name = ref("");
const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const handleCreate = async () => {
  pending.value = true;
  try {
    const obj = { name: name.value };
    await axiosInstance.post("/setting/module", obj);
    if (props.refetchList) {
      await props.refetchList();
    }
    isDialogVisible.value = false;
  } catch (error) {
    console.error("Error create module:", error);
  } finally {
    pending.value = false;
  }
};
</script>
