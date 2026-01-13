<template>
  <VDialog v-model="isDialogVisible" persistent class="v-dialog-sm">
    <DialogCloseBtn
      @click="isDialogVisible = !isDialogVisible"
      v-if="!pending"
    />
    <VCard title="Reset Password" :loading="loading">
      <VCardText>
        <VForm ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator, minLengthValidator]"
                label="New Password"
                v-model="password"
                type="password"
                counter="30"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                :rules="[requiredValidator, confirmPasswordValidator]"
                label="Confirm New Password"
                v-model="cPassword"
                type="password"
                counter="30"
              ></v-text-field>
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
        <VBtn @click="handleResetPassword" :disabled="pending">
          <template v-if="pending">
            <VProgressCircular indeterminate color="primary" size="20" />
          </template>
          <template v-else> Update Password </template>
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
  resetForm();
};

watch(isDialogVisible, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    onDialogOpen();
  }
});

//::::::::::::::::::::::::::::::::::::: STATES
const form = ref();
const password = ref("");
const cPassword = ref("");

const loading = ref(false);
const pending = ref(false);

//::::::::::::::::::::::::::::::::::::: VALIDATORS
const minLengthValidator = (value) => {
  if (!value || value.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return true;
};

const confirmPasswordValidator = (value) => {
  if (value !== password.value) {
    return "Passwords do not match";
  }
  return true;
};

//::::::::::::::::::::::::::::::::::::: FUNCTIONS

const resetForm = () => {
  password.value = "";
  cPassword.value = "";

  // Reset form validation
  if (form.value) {
    form.value.resetValidation();
  }
};

const handleResetPassword = async () => {
  const isValid = await form.value?.validate();

  if (isValid?.valid) {
    pending.value = true;
    try {
      const passwordData = {
        new_password: password.value,
      };

      await axiosInstance.put(
        `/user/${props.userId}/reset-password`,
        passwordData
      );

      isDialogVisible.value = false;

      if (props.refetchUserList) {
        await props.refetchUserList();
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      pending.value = false;
    }
  }
};
</script>
