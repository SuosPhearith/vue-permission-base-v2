<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create" v-if="!loading">
      <VCardText>
        <VForm ref="form" lazy-validation>
          <VRow>
            <VCol cols="12">
              <VTextField
                :rules="[requiredValidator]"
                label="Full Name"
                v-model="name"
              ></VTextField>
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                label="Role"
                :items="roles"
                :rules="[requiredValidator]"
                item-title="name"
                item-value="id"
                clearable
                clear-icon="tabler-x"
                multiple
                chips
                closable-chips
                v-model="role"
              ></VAutocomplete>
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
    <v-card v-else> <VCardText>Loading...</VCardText> </v-card>
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
  setup();
};

watch(isDialogVisible, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    onDialogOpen();
  }
});

//::::::::::::::::::::::::::::::::::::: STATES
const form = ref();
const name = ref("");
const role = ref(null);

const roles = ref([]);

const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const setup = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get("/setting/setup?select=role");
    roles.value = res.data.data.roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  name.value = "";
  role.value = null;

  // Reset form validation
  if (form.value) {
    form.value.resetValidation();
  }
};

const handleCreate = async () => {
  const isValid = await form.value?.validate();

  if (isValid?.valid) {
    pending.value = true;
    try {
      const userData = {
        name: name.value,
        role_id: role.value,
      };

      await axiosInstance.post("/user", userData);
      isDialogVisible.value = false;
      if (props.refetch) {
        await props.refetch();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      pending.value = false;
    }
  }
};
</script>
