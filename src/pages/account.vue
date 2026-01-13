<template>
  <VCard>
    <ConfirmDialog ref="dialogRef" />
    <VCardText>
      <VTabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="mb-6"
      >
        <VTab value="profile">
          <VIcon icon="tabler-user" class="mr-2" size="20" />
          {{ formTranslater("kh:គណនី;en:Profile") }}
        </VTab>
        <VTab value="password">
          <VIcon icon="tabler-key" class="mr-2" size="20" />
          {{ formTranslater("kh:ប្តូរពាក្យសម្ងាត់;en:Change Password") }}
        </VTab>
        <VTab value="2fa">
          <VIcon icon="tabler-shield-check" class="mr-2" size="20" />
          {{
            formTranslater(
              "kh:ការផ្ទៀងផ្ទាត់ពីរជាន់;en:Two-Factor Authentication"
            )
          }}
        </VTab>
      </VTabs>

      <VWindow v-model="activeTab">
        <VWindowItem value="profile">
          <VCard flat>
            <VCardTitle class="pb-4">
              {{ formTranslater("kh:ព័ត៌មានគណនី;en:Profile Information") }}
            </VCardTitle>
            <VCardText>
              <VForm ref="profileForm" @submit.prevent="updateProfile">
                <VRow>
                  <VCol cols="12" class="text-center mb-6">
                    <div class="d-flex flex-column align-center">
                      <div
                        style="
                          width: 120px;
                          height: 120px;
                          border-radius: 50%;
                          overflow: hidden;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          background-color: #f5f5f5;
                        "
                      >
                        <img
                          v-if="profileData.avatar"
                          :src="
                            profileData.avatar.startsWith('data:')
                              ? profileData.avatar
                              : `${fileUrl}${profileData.avatar}`
                          "
                          style="width: 100%; height: 100%; object-fit: cover"
                        />
                        <VIcon v-else icon="tabler-user" size="60" />
                      </div>

                      <div class="d-flex gap-3 mt-4">
                        <VBtn
                          prepend-icon="tabler-upload"
                          size="small"
                          variant="outlined"
                          color="primary"
                          @click="uploadAvatar"
                        >
                          {{
                            formTranslater("kh:បញ្ចូលរូបភាព;en:Upload Avatar")
                          }}
                        </VBtn>
                        <VBtn
                          v-if="profileData.avatar"
                          prepend-icon="tabler-trash"
                          size="small"
                          variant="outlined"
                          color="error"
                          @click="removeAvatar"
                        >
                          {{ formTranslater("kh:លុប;en:Remove") }}
                        </VBtn>
                      </div>
                    </div>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="profileData.name"
                      :label="formTranslater('kh:ឈ្មោះពេញ;en:Full Name')"
                      prepend-inner-icon="tabler-user"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="profileData.phone"
                      :label="formTranslater('kh:លេខទូរស័ព្ទ;en:Phone Number')"
                      prepend-inner-icon="tabler-phone"
                      :rules="[rules.required, rules.phone]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>

                  <VCol cols="12">
                    <VTextField
                      v-model="profileData.email"
                      :label="formTranslater('kh:អ៊ីមែល;en:Email Address')"
                      prepend-inner-icon="tabler-mail"
                      :rules="[rules.required, rules.email]"
                      variant="outlined"
                      density="comfortable"
                      type="email"
                      readonly
                    />
                  </VCol>

                  <VCol cols="12" class="pt-6">
                    <div class="d-flex justify-end gap-3">
                      <VBtn
                        variant="outlined"
                        color="secondary"
                        @click="resetProfile"
                      >
                        {{ formTranslater("kh:កំណត់ឡើងវិញ;en:Reset") }}
                      </VBtn>
                      <VBtn
                        color="error"
                        :loading="profileLoading"
                        @click="handleDeleteAccount"
                      >
                        {{ formTranslater("kh:លុបគណនី;en:Delete Account") }}
                      </VBtn>
                      <VBtn
                        type="submit"
                        color="primary"
                        :loading="profileLoading"
                      >
                        {{
                          formTranslater(
                            "kh:ធ្វើបច្ចុប្បន្នភាព;en:Update Profile"
                          )
                        }}
                      </VBtn>
                    </div>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VWindowItem>

        <VWindowItem value="password">
          <VCard flat>
            <VCardTitle class="pb-4">
              {{ formTranslater("kh:ប្តូរពាក្យសម្ងាត់;en:Change Password") }}
            </VCardTitle>
            <VCardText>
              <VForm ref="passwordForm" @submit.prevent="changePassword">
                <VRow>
                  <VCol cols="12">
                    <VTextField
                      v-model="passwordData.currentPassword"
                      :label="
                        formTranslater(
                          'kh:ពាក្យសម្ងាត់បច្ចុប្បន្ន;en:Current Password'
                        )
                      "
                      prepend-inner-icon="tabler-lock"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      :append-inner-icon="
                        showCurrentPassword ? 'tabler-eye-off' : 'tabler-eye'
                      "
                      @click:append-inner="
                        showCurrentPassword = !showCurrentPassword
                      "
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="passwordData.newPassword"
                      :label="
                        formTranslater('kh:ពាក្យសម្ងាត់ថ្មី;en:New Password')
                      "
                      prepend-inner-icon="tabler-lock"
                      :type="showNewPassword ? 'text' : 'password'"
                      :append-inner-icon="
                        showNewPassword ? 'tabler-eye-off' : 'tabler-eye'
                      "
                      @click:append-inner="showNewPassword = !showNewPassword"
                      :rules="[rules.required, rules.minLength]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField
                      v-model="passwordData.confirmPassword"
                      :label="
                        formTranslater(
                          'kh:បញ្ជាក់ពាក្យសម្ងាត់ថ្មី;en:Confirm New Password'
                        )
                      "
                      prepend-inner-icon="tabler-lock"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      :append-inner-icon="
                        showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'
                      "
                      @click:append-inner="
                        showConfirmPassword = !showConfirmPassword
                      "
                      :rules="[rules.required, rules.passwordMatch]"
                      variant="outlined"
                      density="comfortable"
                    />
                  </VCol>

                  <VCol cols="12" class="pt-6">
                    <div class="d-flex justify-end gap-3">
                      <VBtn
                        variant="outlined"
                        color="secondary"
                        @click="resetPassword"
                      >
                        {{ formTranslater("kh:កំណត់ឡើងវិញ;en:Reset") }}
                      </VBtn>
                      <VBtn
                        type="submit"
                        color="primary"
                        :loading="passwordLoading"
                      >
                        {{
                          formTranslater(
                            "kh:ប្តូរពាក្យសម្ងាត់;en:Change Password"
                          )
                        }}
                      </VBtn>
                    </div>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VWindowItem>

        <VWindowItem value="2fa">
          <VCard flat>
            <VCardTitle class="pb-4">
              {{
                formTranslater(
                  "kh:ការផ្ទៀងផ្ទាត់ពីរជាន់;en:Two-Factor Authentication"
                )
              }}
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12">
                  <VCard variant="outlined" class="pa-6">
                    <div class="d-flex align-center justify-between mb-4">
                      <div class="d-flex align-center">
                        <VAvatar
                          size="48"
                          :color="
                            twoFactorData.isEnabled ? 'success' : 'warning'
                          "
                          class="mr-4"
                        >
                          <VIcon
                            :icon="
                              twoFactorData.isEnabled
                                ? 'tabler-shield-check'
                                : 'tabler-shield-off'
                            "
                            size="24"
                          />
                        </VAvatar>
                        <div>
                          <h6 class="mb-1">
                            {{
                              formTranslater(
                                "kh:ការផ្ទៀងផ្ទាត់ពីរជាន់;en:Two-Factor Authentication"
                              )
                            }}
                          </h6>
                          <p class="text-medium-emphasis mb-0">
                            {{
                              twoFactorData.isEnabled
                                ? formTranslater("kh:បានបើក;en:Enabled")
                                : formTranslater("kh:បានបិទ;en:Disabled")
                            }}
                          </p>
                        </div>
                      </div>
                      <VBtn
                        :color="twoFactorData.isEnabled ? 'error' : 'success'"
                        :variant="twoFactorData.isEnabled ? 'outlined' : 'flat'"
                        :prepend-icon="
                          twoFactorData.isEnabled
                            ? 'tabler-shield-off'
                            : 'tabler-shield-check'
                        "
                        @click="
                          twoFactorData.isEnabled ? disable2FA() : enable2FA()
                        "
                        :loading="twoFactorLoading"
                      >
                        {{
                          twoFactorData.isEnabled
                            ? formTranslater("kh:បិទ 2FA;en:Disable 2FA")
                            : formTranslater("kh:បើក 2FA;en:Enable 2FA")
                        }}
                      </VBtn>
                    </div>

                    <VDivider class="mb-4" />

                    <div class="text-medium-emphasis mb-4">
                      {{
                        formTranslater(
                          "kh:ការផ្ទៀងផ្ទាត់ពីរជាន់បន្ថែមសុវត្ថិភាពបន្ថែមទៅលើគណនីរបស់អ្នក។ នៅពេលបានបើក អ្នកត្រូវបញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ពីកម្មវិធី Authenticator បន្ថែមពីលើពាក្យសម្ងាត់។;en:Two-factor authentication adds an extra layer of security to your account. When enabled, you must enter a verification code from your authenticator app in addition to your password."
                        )
                      }}
                    </div>

                    <div v-if="twoFactorData.isEnabled" class="mb-4">
                      <VAlert type="success" variant="tonal" class="mb-4">
                        <VAlertTitle>
                          {{
                            formTranslater(
                              "kh:2FA កំពុងដំណើរការ;en:2FA is Active"
                            )
                          }}
                        </VAlertTitle>
                        {{
                          formTranslater(
                            "kh:ការផ្ទៀងផ្ទាត់ពីរជាន់ត្រូវបានបើកសម្រាប់គណនីរបស់អ្នក។;en:Two-factor authentication is currently enabled for your account."
                          )
                        }}
                      </VAlert>

                      <div class="d-flex gap-3">
                        <VBtn
                          prepend-icon="tabler-refresh"
                          variant="outlined"
                          color="secondary"
                          @click="enable2FA"
                        >
                          {{
                            formTranslater(
                              "kh:បង្កើតកូដថ្មី;en:Regenerate Codes"
                            )
                          }}
                        </VBtn>
                      </div>
                    </div>

                    <div v-else>
                      <VAlert type="warning" variant="tonal" class="mb-4">
                        <VAlertTitle>
                          {{
                            formTranslater(
                              "kh:2FA មិនទាន់បានបើក;en:2FA is Disabled"
                            )
                          }}
                        </VAlertTitle>
                        {{
                          formTranslater(
                            "kh:គណនីរបស់អ្នកមិនទាន់មានការការពារដោយការផ្ទៀងផ្ទាត់ពីរជាន់ទេ។ សូមបើកវាឥឡូវនេះដើម្បីបង្កើនសុវត្ថិភាព។;en:Your account is not protected by two-factor authentication. Enable it now to improve your account security."
                          )
                        }}
                      </VAlert>

                      <div class="mb-4">
                        <strong>
                          {{
                            formTranslater(
                              "kh:ជំហានដើម្បីបើក 2FA:;en:Steps to enable 2FA:"
                            )
                          }}
                        </strong>
                        <ol class="mt-2 ml-4">
                          <li>
                            {{
                              formTranslater(
                                "kh:ដំឡើងកម្មវិធី Authenticator (Google Authenticator, Authy ជាដើម);en:Install an authenticator app (Google Authenticator, Authy, etc.)"
                              )
                            }}
                          </li>
                          <li>
                            {{
                              formTranslater(
                                'kh:ចុចប៊ូតុង “បើក 2FA”;en:Click "Enable 2FA" button'
                              )
                            }}
                          </li>
                          <li>
                            {{
                              formTranslater(
                                "kh:ស្កេន QR Code ជាមួយកម្មវិធី Authenticator;en:Scan the QR code with your authenticator app"
                              )
                            }}
                          </li>
                          <li>
                            {{
                              formTranslater(
                                "kh:បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ដើម្បីបញ្ចប់ការកំណត់;en:Enter the verification code to complete setup"
                              )
                            }}
                          </li>
                        </ol>
                      </div>
                    </div>
                  </VCard>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
  <VDialog v-model="dialogEnable" width="500" persistent>
    <DialogCloseBtn @click="dialogEnable = false" />
    <VCard :title="formTranslater('kh:កូដ QR;en:QR Code')" class="px-3">
      <VCardText>
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
          "
        >
          <QRCodeVue :value="qrCode2fa" :size="200" />
        </div>
      </VCardText>

      <VTextField
        v-model="otpCode"
        :label="formTranslater('kh:លេខកូដ OTP;en:OTP Code')"
        prepend-inner-icon="tabler-lock"
        variant="outlined"
        density="comfortable"
      />

      <VBtn color="success" class="my-3" @click="verifySetup">
        {{ formTranslater("kh:ផ្ទៀងផ្ទាត់កូដ;en:Verify Code") }}
      </VBtn>
    </VCard>
  </VDialog>
</template>
<script setup>
import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import useSnackbar from "@/composables/useSnackbar";
import { useAuthStore } from "@/stores/auth";
import axiosInstance from "@/utils/axiosInstance";
import QRCodeVue from "qrcode.vue";
import { reactive, ref } from "vue";
import { VAvatar } from "vuetify/components";

// Tab management
const dialogRef = ref();
const activeTab = ref("profile");

// Loading states
const profileLoading = ref(false);
const passwordLoading = ref(false);
const twoFactorLoading = ref(false);

// Form refs
const profileForm = ref(null);
const passwordForm = ref(null);
const dialogEnable = ref(false);
const qrCode2fa = ref(null);
const otpCode = ref("");

const fileUrl = import.meta.env.VITE_FILE_URL;

// Profile data
const auth = useAuthStore();

const profileData = reactive({
  name: auth?.user?.name,
  phone: auth?.user?.phone_number,
  email: auth?.user?.email,
  avatar: auth?.user?.avatar,
});

// Password data
const passwordData = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 2FA data
const twoFactorData = reactive({
  isEnabled: auth.user.enable_2fa,
});

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Validation rules
const rules = {
  required: (value) => !!value || "This field is required",
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Please enter a valid email address";
  },
  phone: (value) => {
    const pattern = /^[+]?[\d\s\-\(\)]+$/;
    return pattern.test(value) || "Please enter a valid phone number";
  },
  minLength: (value) =>
    value.length >= 6 || "Password must be at least 6 characters",
  passwordMatch: (value) =>
    value === passwordData.newPassword || "Passwords do not match",
};

// Profile methods
const pending = ref(false);
const avatarFile = ref(null);
const { trigger } = useSnackbar();
const handleDeleteAccount = async () => {
  const confirm = await dialogRef.value.show({
    title: "លុបគណនីរបស់អ្នក",
    message: "តើអ្នកពិតជាចង់លុបគណនីរបស់អ្នកមែនទេ?",
    type: "danger",
  });
  if (!confirm) {
    return;
  } else {
    try {
      pending.value = true;
      await axiosInstance.delete(`/auth/delete/account`);
      trigger();
      getData();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      pending.value = false;
    }
  }
};
const updateProfile = async () => {
  const { valid } = await profileForm.value.validate();
  if (!valid) return;

  profileLoading.value = true;

  try {
    const formData = new FormData();
    formData.append("name", profileData.name);
    formData.append("phone_number", profileData.phone);

    // Append avatar only if a new file was selected
    if (avatarFile.value) {
      formData.append("avatar", avatarFile.value);
    }

    await axiosInstance.post(`/auth/update-profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    trigger("Saved successfully", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
  } finally {
    profileLoading.value = false;
  }
};

const resetProfile = () => {
  profileData.name = auth?.user?.name;
  profileData.phone = auth?.user?.phone_number;
  profileData.email = auth?.user?.email;
  profileForm.value?.resetValidation();
};

const uploadAvatar = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      avatarFile.value = file; // store file for upload

      const reader = new FileReader();
      reader.onload = (e) => {
        profileData.avatar = e.target.result; // base64 for preview
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

const removeAvatar = () => {
  profileData.avatar = null;
};

// Password methods
const changePassword = async () => {
  const { valid } = await passwordForm.value.validate();
  if (!valid) return;

  passwordLoading.value = true;
  try {
    await axiosInstance.put(`/auth/change-password`, {
      current_password: passwordData?.currentPassword,
      new_password: passwordData?.newPassword,
      new_password_confirmation: passwordData?.confirmPassword,
    });
    resetPassword();
    trigger("Saved successfully", "success");
  } catch (error) {
    console.error("Error changing password:", error);
  } finally {
    passwordLoading.value = false;
  }
};

const resetPassword = () => {
  passwordData.currentPassword = "";
  passwordData.newPassword = "";
  passwordData.confirmPassword = "";
  passwordForm.value?.resetValidation();
};

// 2FA methods
const disable2FA = async () => {
  twoFactorLoading.value = true;
  try {
    // Simulate API call
    await axiosInstance.delete(`/auth/2fa/disable-2fa`);
    twoFactorData.isEnabled = !twoFactorData.isEnabled;
    trigger("Saved successfully", "success");
  } catch (error) {
    console.error("Error toggling 2FA:", error);
  } finally {
    twoFactorLoading.value = false;
  }
};

const enable2FA = async () => {
  twoFactorLoading.value = true;
  try {
    const res = await axiosInstance.post(`/auth/2fa/setup`);
    qrCode2fa.value = res.data.otpauth_url;
    dialogEnable.value = true;
  } catch (error) {
    console.error("Error toggling 2FA:", error);
  } finally {
    twoFactorLoading.value = false;
  }
};

const verifySetup = async () => {
  if (!otpCode.value) {
    return;
  }
  twoFactorLoading.value = true;
  try {
    await axiosInstance.post(`/auth/2fa/verify-setup`, {
      otp: otpCode.value,
    });
    qrCode2fa.value = null;
    dialogEnable.value = false;
    twoFactorData.isEnabled = true;
    trigger("Saved successfully", "success");
  } catch (error) {
    console.error("Error toggling 2FA:", error);
  } finally {
    twoFactorLoading.value = false;
  }
};
</script>
