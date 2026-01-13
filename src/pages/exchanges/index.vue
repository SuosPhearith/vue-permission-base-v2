<template>
  <ConfirmDialog ref="dialogRef" />
  <VCard>
    <VCardText>
      <VRow>
        <VCol cols="12">
          <VRow>
            <VCol cols="6">
              <h2 class="text-lg">Page</h2>
            </VCol>
            <VCol cols="3">
              <VAutocomplete
                :items="filterOptions"
                v-model="selectedFilter"
                :item-title="(item) => formTranslater(item.name)"
                item-value="id"
                clearable
                clear-icon="tabler-x"
                variant="outlined"
                label="Select"
              />
            </VCol>
            <VCol cols="3" class="flex gap-2">
              <VTextField
                label="Search"
                append-inner-icon="tabler-search"
                clearable
                clear-icon="tabler-x"
                v-model="searchQuery"
              />
              <VBtn icon="tabler-plus" rounded @click="handleCreate" />
              <VBtn icon="tabler-reload" rounded @click="getData" />
            </VCol>
          </VRow>
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
      :items="data"
      :loading="loading"
      fixed-header
      show-current-page
      :items-per-page-options="[10, 20, 50]"
      @update:sort-by="handleSortChange"
      @update:page="handlePageChange"
      @update:items-per-page="handlePerPageChange"
      :items-per-page-text="
        formTranslater('en:Item Per Page;kh:ទិន្នន័យក្នុងមួយទំព័រ')
      "
    >
      <template #item.information="{ item }">
        <div class="d-flex align-center">
          <VAvatar size="32" color="primary">
            <v-icon>tabler-user</v-icon>
          </VAvatar>
          <div class="d-flex flex-column ms-3">
            <span
              class="d-block font-weight-medium text-high-emphasis text-truncate"
              >{{ item.name }}</span
            >
            <small>
              {{ item.description }}
            </small>
          </div>
        </div>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-2 flex-wrap">
          <VSwitch
            :loading="pending"
            color="success"
            hide-details
            v-model="item.status"
          />
          <VBtn icon variant="text" color="medium-emphasis">
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListItem
                  link
                  class="text-info"
                  @click="handleDetail(item.id, item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-eye" />
                  </template>
                  <VListItemTitle>View</VListItemTitle>
                </VListItem>
                <VListItem
                  link
                  class="text-primary"
                  @click="handleUpdate(item.id)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-pencil" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>
                <VListItem
                  link
                  class="text-error"
                  @click="handleDelete(item.id)"
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
  </VCard>
  <SampleCreateDialog v-model="dialogCreate" :refetch="getData" />
  <SampleUpdateDialog
    v-model="dialogUpdate"
    :refetch="getData"
    :init-id="initId"
  />
  <SampleDetailDialog
    v-model="dialogDetail"
    :refetch="getData"
    :init-id="initId"
    :init-data="initData"
  />
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import { useRoute, useRouter } from "vue-router";
import useSnackbar from "@/composables/useSnackbar";
import { formTranslater } from "@/utils/formLang";
import SampleCreateDialog from "@/components/customs/sample/SampleCreateDialog.vue";
import SampleUpdateDialog from "@/components/customs/sample/SampleUpdateDialog.vue";
import SampleDetailDialog from "@/components/customs/sample/SampleDetailDialog.vue";

const headers = ref([
  { title: "Information", key: "information", sortable: false },
  { title: "", key: "actions", sortable: false },
]);

//::::::::::::::::::::::::::::::::::::::::::::::::::::: STATES
const fileUrl = import.meta.env.VITE_FILE_URL;
const loading = ref(false);
const pending = ref(false);
const data = ref([
  {
    id: 1,
    name: "SUOS PHEARITH",
    description: "SUOS PHEARITH",
    status: true,
  },
]);
const router = useRouter();
const route = useRoute();

const initId = ref(null);
const initData = ref(null);

//:::::::::::::::::::::::: DIALOG
const dialogRef = ref();
const dialogCreate = ref(false);
const dialogUpdate = ref(false);
const dialogDetail = ref(false);

//:::::::::::::::::::::::: TABLE & PAGINATION
const perPage = ref(10);
const page = ref(1);
const total = ref(0);
const sortBy = ref([]);
const { trigger } = useSnackbar();

//:::::::::::::::::::::::: FILTER
const searchQuery = ref("");
const selectedFilter = ref(null);

// Status options
const filterOptions = ref([
  { name: "Active", id: "1" },
  { name: "Inactive", id: "0" },
]);

//::::::::::::::::::::::::::::::::::::::::::::::::::::: FUNCTIONS

const setup = async () => {
  loading.value = true;
  try {
    // Call api
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

    if (selectedFilter.value !== null) {
      params.append("is_active", selectedFilter.value);
    }

    // Sorting
    if (sortBy.value.length > 0) {
      const sortItem = sortBy.value[0];
      params.append("sort_direction", sortItem.order);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    // const res = await axiosInstance.get(`/setting/role?${params.toString()}`);
    // data.value = res.data.data;
    total.value = res.data.meta.total;
  } catch (error) {
    console.error("Error fetching:", error);
  } finally {
    loading.value = false;
  }
};

//::::::::::::::::::::::::::::::::::::::::::::::::::::: ACTION HANDLERS

const handleCreate = () => {
  dialogCreate.value = true;
};

const handleUpdate = (id) => {
  initId.value = id;
  dialogUpdate.value = true;
};

const handleDetail = (id, data) => {
  initId.value = id;
  initData.value = data;
  dialogDetail.value = true;
};

const handleDelete = async (id) => {
  const confirm = await dialogRef.value.show({
    title: "Confirm",
    message: "Are you sure?",
    type: "primary",
  });
  if (!confirm) {
    return;
  } else {
    try {
      pending.value = true;
      // await axiosInstance.put(``);
      trigger();
      getData();
    } catch (error) {
      console.error("Error creating user:", error);
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

watch([selectedFilter], () => {
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
