<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Create new User" :loading="loading">
      <VCardText>
        <VForm ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator]"
                label="Full Name"
                v-model="name"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator]"
                label="Phone Number"
                v-model="phoneNumber"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Email"
                :rules="[requiredValidator, emailValidator]"
                v-model="email"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Password"
                :rules="[requiredValidator]"
                v-model="password"
                type="password"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Confirm Password"
                :rules="[requiredValidator, confirmPasswordValidator]"
                v-model="cPassword"
                type="password"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <VAutocomplete
                :disabled="loading"
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
import { emailValidator, requiredValidator } from "@/@core/utils/validators";
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
const phoneNumber = ref("");
const email = ref("");
const password = ref("");
const cPassword = ref("");
const role = ref(null);

const roles = ref([]);

const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: VALIDATORS
const confirmPasswordValidator = (value) => {
  if (value !== password.value) {
    return "Passwords do not match";
  }
  return true;
};

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
  phoneNumber.value = "";
  email.value = "";
  password.value = "";
  cPassword.value = "";
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
        phone_number: phoneNumber.value,
        email: email.value,
        password: password.value,
        role_id: role.value,
      };

      await axiosInstance.post("/user", userData);
      isDialogVisible.value = false;
      if (props.refetchUserList) {
        await props.refetchUserList();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      pending.value = false;
    }
  }
};
</script>
