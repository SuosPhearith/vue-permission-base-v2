<template>
  <ConfirmDialog ref="dialogRef" />
  <VCard title="" :loading="loading">
    <div class="flex align-center justify-between mx-6">
      <h6 class="text-lg">Permission Management</h6>
      <VBtn
        prepend-icon="tabler-plus"
        @click="dialogCreate = true"
        v-if="hasPermission('create-module-setting')"
      >
        Add Module
      </VBtn>
    </div>
    <VCardText>
      <div v-if="permissions.length > 0">
        <div v-for="module in permissions" :key="module.id" class="mb-8">
          <!-- Module Header -->
          <div
            class="d-flex align-center justify-between border rounded-md px-4 mb-4 bg-grey-50"
          >
            <div class="d-flex align-center">
              <VIcon icon="tabler-folder" class="mr-2 text-primary" size="20" />
              <h6 class="text-[16px] text-bold text-primary">
                {{ module.name }}
              </h6>
            </div>
            <div class="d-flex align-center gap-1">
              <VSwitch
                v-if="hasPermission('toggle-module-setting')"
                :model-value="module.is_active"
                @change="toggleModuleActive(module)"
                color="success"
                hide-details
                inset
              />
              <VBtn
                v-if="hasPermission('delete-module-setting')"
                icon="tabler-trash"
                variant="text"
                color="error"
                @click="deleteModule(module)"
              />
            </div>
          </div>

          <!-- Permissions Grid -->
          <div class="">
            <VRow class="">
              <VCol
                v-for="permission in module.permissions"
                :key="permission.id"
                cols="12"
                md="6"
                lg="4"
              >
                <div
                  class="d-flex align-center justify-between px-3 border rounded-md"
                  :class="{ 'opacity-60': !module.is_active }"
                >
                  <VTooltip>
                    <template #activator="{ props }">
                      <div class="d-flex align-center">
                        <VIcon
                          icon="tabler-key"
                          class="mr-2 text-grey-500"
                          size="16"
                        />
                        <span v-bind="props" class="text-body-2">
                          {{ formatPermissionName(permission.name) }}
                        </span>
                      </div>
                    </template>
                    <span>{{ permission.name }}</span>
                  </VTooltip>

                  <div class="d-flex align-center gap-1">
                    <VSwitch
                      v-if="hasPermission('toggle-permission-setting')"
                      :model-value="permission.is_active"
                      @change="togglePermissionActive(permission)"
                      :disabled="!module.is_active"
                      :loading="pending"
                      color="primary"
                      hide-details
                      inset
                    />
                    <VBtn
                      v-if="hasPermission('delete-permission-setting')"
                      icon="tabler-trash"
                      variant="text"
                      color="error"
                      @click="deletePermission(permission)"
                    />
                  </div>
                </div>
              </VCol>

              <!-- Add Permission Button at the end of each module -->
              <VCol cols="12" md="6" lg="4">
                <div
                  v-if="hasPermission('create-permission-setting')"
                  class="d-flex border-[#7367F0] align-center justify-center px-3 py-1 border-2 border-dashed border-grey-300 rounded-md bg-grey-25 hover:border-success hover:bg-success-50 transition-all duration-200 cursor-pointer"
                  @click="onCreatePermissionDialog(module)"
                  :class="{
                    'opacity-50 cursor-not-allowed': !module.is_active,
                  }"
                  :disabled="!module.is_active"
                >
                  <VBtn
                    prepend-icon="tabler-plus"
                    variant="text"
                    color="primary"
                    size="small"
                    :disabled="!module.is_active"
                    @click="onCreatePermissionDialog(module)"
                  >
                    Add Permission
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-8">
        <VIcon icon="mdi-shield-alert" size="48" class="text-disabled mb-4" />
        <p class="text-disabled">No permissions available</p>
      </div>

      <div v-if="loading" class="text-center py-8">
        <VProgressCircular indeterminate color="primary" size="40" />
        <p class="text-disabled mt-3">Loading permissions...</p>
      </div>
    </VCardText>
  </VCard>
  <CreateModuleDialog v-model="dialogCreate" :refetch-list="getPermission" />
  <CreatePermissionDialog
    v-model="dialogPermission"
    :refetch-list="getPermission"
    :module-id="moduleID"
  />
</template>

<script setup>
import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import CreateModuleDialog from "@/components/customs/settings/permission/CreateModuleDialog.vue";
import CreatePermissionDialog from "@/components/customs/settings/permission/CreatePermissionDialog.vue";
import axiosInstance from "@/utils/axiosInstance";
import { hasPermission } from "@/utils/hasPermission";
import { ref } from "vue";

//::::::::::::::::::::::::::::::::::::::::::::::::::::: STATES
const permissions = ref([]);
const originalPermissions = ref([]);
const dialogCreate = ref(false);
const dialogPermission = ref(false);
const loading = ref(false);
const pending = ref(false);
const moduleID = ref(null);
const dialogRef = ref();

//::::::::::::::::::::::::::::::::::::::::::::::::::::: FUNCTIONS
const getPermission = async () => {
  loading.value = true;
  try {
    const res = await axiosInstance.get("/setting/module");
    permissions.value = res.data.data;
    originalPermissions.value = JSON.parse(JSON.stringify(res.data.data));
  } catch (error) {
    console.error("Error fetching permissions:", error);
  } finally {
    loading.value = false;
  }
};

const togglePermissionActive = async (permission) => {
  pending.value = true;
  try {
    await axiosInstance.put(`/setting/permission/${permission.id}`);
  } catch (error) {
    console.error("Error fetching permissions:", error);
  } finally {
    pending.value = false;
  }
};

const toggleModuleActive = async (module) => {
  pending.value = true;
  try {
    await axiosInstance.put(`/setting/module/${module.id}`);
    module.is_active = !module.is_active;
  } catch (error) {
    console.error("Error fetching modules:", error);
  } finally {
    pending.value = false;
  }
};

const deleteModule = async (module) => {
  const confirm = await dialogRef.value.show({
    title: "Confirm",
    message: "Are you sure?",
    type: "danger",
  });
  if (confirm) {
    pending.value = true;
    try {
      await axiosInstance.delete(`/setting/module/${module.id}`);
      getPermission();
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      pending.value = false;
    }
  }
};

const deletePermission = async (permission) => {
  const confirm = await dialogRef.value.show({
    title: "Confirm",
    message: "Are you sure?",
    type: "danger",
  });
  if (confirm) {
    pending.value = true;
    try {
      await axiosInstance.delete(`/setting/permission/${permission.id}`);
      getPermission();
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      pending.value = false;
    }
  }
};

const formatPermissionName = (name) => {
  return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const onCreatePermissionDialog = (value) => {
  moduleID.value = value.id;
  dialogPermission.value = true;
};

//::::::::::::::::::::::::::::::::::::::::::::::::::::: INITIAL
onMounted(async () => {
  try {
    await Promise.all([getPermission()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
</script>
