<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-lg">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create new Permissions" :loading="loading">
      <VForm ref="form" lazy-validation @submit.prevent="handleCreate">
        <VCardText>
          <v-row>
            <v-col cols="12">
              <div
                v-for="(permission, index) in permissions"
                :key="index"
                class="d-flex align-center gap-2 mb-4"
              >
                <v-text-field
                  :rules="[requiredValidator]"
                  label="Permission Name"
                  v-model="permission.name"
                  hide-details="auto"
                ></v-text-field>
                <VBtn
                  v-if="permissions.length > 1"
                  icon="tabler-trash"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removePermission(index)"
                />
              </div>
              <VBtn
                v-if="canAddPermission"
                color="success"
                variant="outlined"
                size="small"
                @click="addPermission"
                class=""
              >
                <VIcon icon="mdi-plus" class="tabler-plus" />
                Add Permission
              </VBtn>
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
          <VBtn @click="handleCreate" :disabled="pending || !isFormValid">
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
  moduleId: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
    if (!value) {
      resetForm();
    }
  },
});

//::::::::::::::::::::::::::::::::::::: STATES
const permissions = ref([{ name: "" }]);
const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: COMPUTED
const isFormValid = computed(() => {
  return (
    permissions.value.length > 0 &&
    permissions.value.every((permission) => permission.name.trim() !== "")
  );
});

const canAddPermission = computed(() => {
  // Check if the last permission field has a non-empty value
  const lastPermission = permissions.value[permissions.value.length - 1];
  return lastPermission && lastPermission.name.trim() !== "";
});

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const addPermission = () => {
  permissions.value.push({ name: "" });
};

const removePermission = (index) => {
  if (permissions.value.length > 1) {
    permissions.value.splice(index, 1);
  }
};

const resetForm = () => {
  permissions.value = [{ name: "" }];
  loading.value = false;
  pending.value = false;
};

const handleCreate = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  pending.value = true;

  try {
    const payload = {
      permissions: permissions.value.filter((p) => p.name.trim() !== ""),
    };

    console.log("payload", payload);

    await axiosInstance.post(
      `/setting/permission/${props.moduleId}/create`,
      payload
    );

    if (props.refetchList) {
      await props.refetchList();
    }

    isDialogVisible.value = false;
  } catch (error) {
    console.error("Error creating permissions:", error);
  } finally {
    loading.value = false;
    pending.value = false;
  }
};
</script>
