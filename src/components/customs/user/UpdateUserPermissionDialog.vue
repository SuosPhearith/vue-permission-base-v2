<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-lg">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Update Permission" :loading="loading">
      <VCardText>
        <v-row>
          <v-col cols="12">
            <h6 class="text-h6 mb-3">Clone Role</h6>
            <VAutocomplete
              :disabled="loading"
              label="Role"
              :items="role"
              :rules="[]"
              item-title="name"
              item-value="id"
              clearable
              return-object
              clear-icon="tabler-x"
              @update:model-value="onRoleSelected"
            ></VAutocomplete>
          </v-col>
          <v-col cols="12">
            <h6 class="text-h6 mb-3">Permissions</h6>
            <div v-for="module in permissions" :key="module.id" class="mb-4">
              <h6
                class="text-subtitle-1 mb-2 d-flex align-center border rounded-md px-2 py-2"
              >
                {{ module.module }}
              </h6>
              <v-row>
                <v-col
                  v-for="permission in module.permissions"
                  :key="permission.id"
                  cols="4"
                >
                  <v-checkbox
                    v-if="permission.disabled"
                    :label="permission.name"
                    :value="permission.id"
                    v-model="selectedPermissions"
                    hide-details
                    :disabled="true"
                  />
                  <v-checkbox
                    v-else
                    :label="permission.name"
                    :value="permission.id"
                    v-model="selectedNewPermissions"
                    hide-details
                  />
                </v-col>
              </v-row>
            </div>
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
        <VBtn @click="handleUpdate" :disabled="pending">
          <template v-if="pending">
            <VProgressCircular indeterminate color="primary" size="20" />
          </template>
          <template v-else> Update </template>
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import axiosInstance from "@/utils/axiosInstance";
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  refetchUserList: {
    type: Function,
    default: () => {},
  },
  userId: {
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
  getRole();
};

watch(isDialogVisible, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    onDialogOpen();
  }
});

//::::::::::::::::::::::::::::::::::::: STATES
const permissions = ref([]);
const selectedPermissions = ref([]);
const selectedNewPermissions = ref([]);
const lastRolePermissions = ref([]); // Track permissions of the last selected role
const role = ref([]);
const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: FUNCTIONS
const setup = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get(
      `/user/${props.userId}/get-user-permission`
    );

    permissions.value = res?.data?.data?.permissions;
    const userNewPermissions = res?.data?.data?.user_permissions || [];

    // Initialize selectedPermissions as an empty array
    const selectedItemPermissions = [];
    const selectedNewItemPermissions = [];

    permissions.value.forEach((permission) => {
      permission.permissions.forEach((itemPermission) => {
        if (itemPermission?.disabled === true) {
          selectedItemPermissions?.push(itemPermission?.id);
        }
      });
    });

    userNewPermissions.forEach((newPermission) => {
      selectedNewItemPermissions?.push(newPermission);
    });

    selectedNewPermissions.value = selectedNewItemPermissions;
    selectedPermissions.value = selectedItemPermissions;
  } catch (error) {
    console.log("Error Get User Permission", error);
  } finally {
    loading.value = false;
  }
};

const getRole = async () => {
  try {
    const res = await axiosInstance.get("/setting/role/permission");
    role.value = res.data.data;
  } catch (error) {
    console.log("Error Get Role Permission", error);
  }
};

const onRoleSelected = async (value) => {
  if (value === null) {
    try {
      const res = await axiosInstance.get(
        `/user/${props.userId}/get-user-permission`
      );
      selectedNewPermissions.value = res?.data?.data?.user_permissions || [];
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  } else {
    // Append value.permission_ids and remove duplicates
    selectedNewPermissions.value = [
      ...new Set([...selectedNewPermissions.value, ...value.permission_ids]),
    ];
  }
};

const handleUpdate = async () => {
  try {
    const permissionData = {
      permission_id: selectedNewPermissions.value,
    };

    await axiosInstance.put(
      `/user/${props.userId}/update-permission`,
      permissionData
    );

    isDialogVisible.value = false;
    if (props.refetchUserList) {
      await props.refetchUserList();
    }
  } catch (error) {
    console.error("Error updating role:", error);
  } finally {
    pending.value = false;
  }
};
</script>
