<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-lg">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create new Role" :loading="loading">
      <VCardText>
        <VForm ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator]"
                label="Role Name"
                v-model="name"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <h6 class="text-h6 mb-3">Permissions</h6>
              <div v-for="module in permissions" :key="module.id" class="mb-4">
                <h6
                  class="text-subtitle-1 mb-2 d-flex align-center border rounded-md"
                >
                  <v-checkbox
                    :label="module.name"
                    :model-value="isModuleFullySelected(module)"
                    :indeterminate="isModuleIndeterminate(module)"
                    @change="toggleModulePermissions(module)"
                    hide-details
                    class="me-2"
                    color="success"
                  />
                </h6>
                <v-row>
                  <v-col
                    v-for="permission in module.permissions"
                    :key="permission.id"
                    cols="4"
                  >
                    <v-checkbox
                      :label="permission.name"
                      :value="permission.id"
                      v-model="selectedPermissions"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
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
const selectedPermissions = ref([]);

const permissions = ref([]);

const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const setup = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get("/setting/module");
    permissions.value = res.data.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  name.value = "";
  selectedPermissions.value = [];

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
      const roleData = {
        name: name.value,
        permission_id: selectedPermissions.value,
      };

      await axiosInstance.post("/setting/role", roleData);
      if (props.refetchList) {
        await props.refetchList();
      }
      isDialogVisible.value = false;
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      pending.value = false;
    }
  }
};

const isModuleFullySelected = (module) => {
  return module.permissions.every((p) =>
    selectedPermissions.value.includes(p.id)
  );
};

const isModuleIndeterminate = (module) => {
  const selectedCount = module.permissions.filter((p) =>
    selectedPermissions.value.includes(p.id)
  ).length;
  return selectedCount > 0 && selectedCount < module.permissions.length;
};

const toggleModulePermissions = (module) => {
  const allPermissionIds = module.permissions.map((p) => p.id);
  const isFullySelected = isModuleFullySelected(module);

  if (isFullySelected) {
    // Uncheck all
    selectedPermissions.value = selectedPermissions.value.filter(
      (id) => !allPermissionIds.includes(id)
    );
  } else {
    // Add missing permissions
    selectedPermissions.value = Array.from(
      new Set([...selectedPermissions.value, ...allPermissionIds])
    );
  }
};
</script>
