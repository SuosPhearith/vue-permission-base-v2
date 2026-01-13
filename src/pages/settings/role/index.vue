<template>
  <div>
    <ConfirmDialog ref="dialogRef" />
    <v-card>
      <VCardText>
        <VRow align="center">
          <VCol cols="12" sm="4">
            <VSelect
              v-model="selectedStatus"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              clearable
              clear-icon="tabler-x"
              variant="outlined"
              label="Select Status"
            />
          </VCol>
          <VCol cols="12" sm="8" class="d-flex justify-end align-center">
            <VTextField
              v-model="searchQuery"
              variant="outlined"
              label="Search Role"
              prepend-inner-icon="tabler-search"
              clearable
              class="me-3"
              style="max-width: 300px"
            />
            <VBtn
              prepend-icon="tabler-plus"
              @click="dialogCreate = true"
              v-if="hasPermission('create-role-setting')"
            >
              Add New Role
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />
      <VDataTableServer
        v-model:items-per-page="perPage"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :items-length="total"
        :headers="headers"
        :items="roleData"
        :loading="loading"
        fixed-header
        show-current-page
        :items-per-page-options="[10, 20, 50]"
        @update:sort-by="handleSortChange"
        @update:page="handlePageChange"
        @update:items-per-page="handlePerPageChange"
      >
        <!-- full name -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar size="32" color="primary">
              <v-icon>tabler-user-check</v-icon>
            </VAvatar>
            <div class="d-flex flex-column ms-3">
              <span
                class="d-block font-weight-medium text-high-emphasis text-truncate"
                >{{ item.name }}</span
              >
            </div>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <span>{{
            formTranslater(
              formatDateBySelectedFormat(item.created_at, false, true)
            )
          }}</span>
        </template>

        <template #item.updated_at="{ item }">
          <span>{{ formatDateBySelectedFormat(item.updated_at) }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip v-if="item.is_active" size="small" color="success">
            Active
          </v-chip>
          <v-chip v-else size="small" color="error">Inactive</v-chip>
        </template>

        <!-- Actions -->
        <template #item.action="{ item }">
          <div class="d-flex align-center gap-2">
            <VSwitch
              v-if="hasPermission('toggle-role-setting')"
              v-model="item.is_active"
              :loading="pending"
              @change="toggleStatus(item?.id)"
              color="success"
              hide-details
            />
            <VBtn icon variant="text" color="medium-emphasis">
              <VIcon icon="tabler-dots-vertical" />
              <VMenu activator="parent">
                <VList>
                  <VListItem
                    link
                    @click="editRole(item)"
                    v-if="hasPermission('update-role-setting')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-pencil" />
                    </template>
                    <VListItemTitle>Edit</VListItemTitle>
                  </VListItem>
                  <VListItem
                    link
                    @click="deleteRole(item)"
                    class="text-error"
                    v-if="hasPermission('delete-role-setting')"
                  >
                    <template #prepend>
                      <VIcon icon="tabler-trash" />
                    </template>
                    <VListItemTitle>Delete</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VBtn>
          </div>
        </template>
      </VDataTableServer>
    </v-card>
    <CreateRoleDialog v-model="dialogCreate" :refetch-list="getData" />
    <UpdateRoleDialog
      :init-id="updateId"
      v-model="dialogUpdate"
      :refetch-list="getData"
    />
  </div>
</template>

<script setup>
import axiosInstance from "@/utils/axiosInstance";
import { formatDateBySelectedFormat } from "@/utils/format";
import { onMounted, ref, watch } from "vue";

import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import CreateRoleDialog from "@/components/customs/settings/role/CreateRoleDialog.vue";
import UpdateRoleDialog from "@/components/customs/settings/role/UpdateRoleDialog.vue";
import { hasPermission } from "@/utils/hasPermission";
import { formTranslater } from "@/utils/formLang";

const headers = [
  {
    title: "NAME",
    key: "name",
    sortable: false,
  },
  {
    title: "CREATED DATE",
    key: "created_at",
    sortable: true,
  },
  {
    title: "STATUS",
    key: "status",
    sortable: false,
  },
  {
    title: "ACTIONS",
    key: "action",
    sortable: false,
  },
];

//::::::::::::::::::::::::::::::::::::::::::::::::::::: STATES
const loading = ref(false);
const pending = ref(false);
const roles = ref([]);
const roleData = ref([]);

const updateId = ref(null);

//:::::::::::::::::::::::: DIALOG
const dialogRef = ref();
const dialogCreate = ref(false);
const dialogUpdate = ref(false);
const dialogReset = ref(false);

//:::::::::::::::::::::::: TABLE & PAGINATION
const perPage = ref(10);
const page = ref(1);
const total = ref(0);
const sortBy = ref([]);

//:::::::::::::::::::::::: FILTER
const searchQuery = ref("");
const selectedStatus = ref(null);

// Status options
const statusOptions = ref([
  { title: "Active", value: "1" },
  { title: "Inactive", value: "0" },
]);

//::::::::::::::::::::::::::::::::::::::::::::::::::::: FUNCTIONS

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

const getData = async () => {
  loading.value = true;
  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Pagination
    params.append("per_page", perPage.value);
    params.append("page", page.value);

    // Search
    if (searchQuery.value) {
      params.append("keyword", searchQuery.value);
    }

    // Filters

    if (selectedStatus.value !== null) {
      params.append("is_active", selectedStatus.value);
    }

    // Sorting
    if (sortBy.value.length > 0) {
      const sortItem = sortBy.value[0];
      params.append("sort_direction", sortItem.order);
    }

    const res = await axiosInstance.get(`/setting/role?${params.toString()}`);
    roleData.value = res.data.data;
    total.value = res.data.meta.total;
  } catch (error) {
    console.error("Error fetching roleData:", error);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async (id) => {
  pending.value = true;
  try {
    await axiosInstance.put(`/setting/role/${id}/toggle-status`);
    // Refresh current page data
    await getData();
  } catch (error) {
    alert("Error updating status");
    console.error("Error toggling status:", error);
  } finally {
    pending.value = false;
  }
};

//::::::::::::::::::::::::::::::::::::::::::::::::::::: ACTION HANDLERS

const editRole = (role) => {
  updateId.value = role.id;
  dialogUpdate.value = true;
};

const deleteRole = async (role) => {
  const confirm = await dialogRef.value.show({
    title: "Confirm Delete",
    message: "Are you sure to delete?",
    type: "danger",
  });

  if (confirm) {
    try {
      pending.value = true;
      await axiosInstance.delete(`/setting/role/${role.id}`);
      getData();
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      pending.value = false;
    }
  }
};

//::::::::::::::::::::::::::::::::::::::::::::::::::::: EVENT HANDLERS

const handleSortChange = (newSortBy) => {
  sortBy.value = newSortBy;
  page.value = 1;
  getData();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  getData();
};

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage;
  page.value = 1; // Reset to first page when items per page changes
  getData();
};

//::::::::::::::::::::::::::::::::::::::::::::::::::::: DEBOUNCED FUNCTIONS

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const debouncedSearch = debounce(() => {
  page.value = 1; // Reset to first page when searching
  getData();
}, 500);

const debouncedFilter = debounce(() => {
  page.value = 1; // Reset to first page when filtering
  getData();
}, 300);

//::::::::::::::::::::::::::::::::::::::::::::::::::::: WATCHERS

watch(searchQuery, () => {
  debouncedSearch();
});

watch([selectedStatus], () => {
  debouncedFilter();
});

//::::::::::::::::::::::::::::::::::::::::::::::::::::: INITIAL
onMounted(async () => {
  try {
    await Promise.all([setup(), getData()]);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
</script>
