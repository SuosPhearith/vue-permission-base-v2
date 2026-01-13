<script setup>
import { requiredValidator } from "@/@core/utils/validators";
import { useAuthStore } from "@/stores/auth";
import axiosInstance from "@/utils/axiosInstance";
import authV1BottomShape from "@images/svg/auth-v1-bottom-shape.svg?raw";
import authV1TopShape from "@images/svg/auth-v1-top-shape.svg?raw";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::: STATES
const form = ref({
  login: "suosphearith@gmail.com",
  password: "123456",
});

const registerForm = ref({
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const isLoading = ref(false);
const isRegisterLoading = ref(false);
const showVerification = ref(false);
const otp = ref("");
const isOtpInserted = ref(false);
const twoFactorKey = ref("");

// Determine current view based on query parameter
const currentView = computed(() => route.query.view || "login");

const authStore = useAuthStore();

// :::::::::::::::::::::::::::::::::::::::::::::::::::: FUNCTIONS
const switchToRegister = () => {
  router.push({ query: { view: "register" } });
};

const switchToLogin = () => {
  router.push({ query: { view: "login" } });
};

const handleLogin = async () => {
  isLoading.value = true;

  try {
    const loginData = {
      login: form.value.login,
      password: form.value.password,
    };

    const resLogin = await axiosInstance.post("/auth/login", loginData);
    const { access_token, verify, two_factor_key } = resLogin.data;

    // Store token
    window.localStorage.setItem("token", access_token);

    // Fetch user info
    const resMe = await axiosInstance.get("/auth/me");
    authStore.setAuth(resMe.data);

    if (verify === true) {
      showVerification.value = true;
      twoFactorKey.value = two_factor_key;
      router.push({ query: { view: "verify" } });
    } else {
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Login error:", error?.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  isRegisterLoading.value = true;

  try {
    const registerData = {
      name: registerForm.value.name,
      email: registerForm.value.email,
      phone_number: registerForm.value.phone,
      password: registerForm.value.password,
    };

    await axiosInstance.post("/auth/register", registerData);
    switchToLogin();
  } catch (error) {
    console.error(
      "Registration error:",
      error?.response?.data || error.message
    );
  } finally {
    isRegisterLoading.value = false;
  }
};

const handleOtpVerification = async () => {
  isOtpInserted.value = true;

  try {
    const verifyData = {
      two_factor_key: twoFactorKey.value,
      otp: otp.value,
    };

    const resVerify = await axiosInstance.post("/auth/2fa/verify", verifyData);

    window.localStorage.setItem("token", resVerify.data.access_token);

    const resMe = await axiosInstance.get("/auth/me");
    authStore.setAuth(resMe.data);

    window.location.href = "/";
  } catch (error) {
    console.error("OTP verification error:", error);
    isOtpInserted.value = false;
  }
};

const onOtpFinish = () => {
  handleOtpVerification();
};

const goBackToLogin = () => {
  showVerification.value = false;
  otp.value = "";
  isOtpInserted.value = false;
  switchToLogin();
};

// Validation computed properties
const isLoginFormValid = computed(() => {
  return form.value.login && form.value.password;
});

const isRegisterFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^0\d{0,10}$/;

  return (
    registerForm.value.name &&
    registerForm.value.email &&
    registerForm.value.phone &&
    registerForm.value.password &&
    registerForm.value.confirmPassword &&
    emailRegex.test(registerForm.value.email) &&
    phoneRegex.test(registerForm.value.phone) &&
    registerForm.value.password.length >= 6 &&
    registerForm.value.password === registerForm.value.confirmPassword
  );
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::: WATCH
watch(
  form,
  (newValue) => {
    console.log("Login form updated:", newValue);
  },
  { deep: true }
);

watch(
  registerForm,
  (newValue) => {
    console.log("Register form updated:", newValue);
  },
  { deep: true }
);

// Watch route changes to update view state
watch(
  () => route.query.view,
  (newView) => {
    if (newView === "verify") {
      showVerification.value = true;
    } else {
      showVerification.value = false;
    }
  }
);
</script>

<template>
  <!-- Login Form -->
  <div
    class="auth-wrapper d-flex align-center justify-center pa-4"
    v-if="currentView === 'login' && !showVerification"
  >
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        min-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <VImg src="/logo.png" width="120" />
          </VCardTitle>
        </VCardItem>

        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">
            Welcome to
            <span class="text-capitalize">{{ themeConfig.app.title }}</span
            >! 👋🏻
          </h4>
          <p class="mb-0">Please sign-in to your account</p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.login"
                  autofocus
                  label="Email or Username"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- login button -->
                <VBtn
                  class="mt-4"
                  block
                  type="submit"
                  :loading="isLoading"
                  :disabled="!isLoginFormValid"
                >
                  Login
                </VBtn>
              </VCol>

              <!-- Register link -->
              <!-- <VCol cols="12" class="text-center">
                <p class="mb-0">
                  New to our platform?
                  <VBtn
                    variant="text"
                    class="text-primary pa-0"
                    @click="switchToRegister"
                  >
                    Create an account
                  </VBtn>
                </p>
              </VCol> -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>

  <!-- Register Form -->
  <div
    class="auth-wrapper d-flex align-center justify-center pa-4"
    v-else-if="currentView === 'register' && !showVerification"
  >
    <div class="position-relative my-sm-16">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <!-- 👉 Register Card -->
      <VCard
        class="auth-card"
        max-width="460"
        min-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <VImg src="/logo.png" width="120" />
          </VCardTitle>
        </VCardItem>

        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">Adventure starts here 🚀</h4>
          <p class="mb-0">Make your app management easy and fun!</p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleRegister">
            <VRow>
              <!-- Name -->
              <VCol cols="12">
                <VTextField
                  v-model="registerForm.name"
                  :rules="[requiredValidator]"
                  autofocus
                  label="Name"
                />
              </VCol>

              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="registerForm.email"
                  :rules="[requiredValidator]"
                  label="Email"
                  type="email"
                />
              </VCol>

              <!-- phone -->
              <VCol cols="12">
                <VTextField
                  v-model="registerForm.phone"
                  :rules="[requiredValidator]"
                  label="Phone Number"
                  type="tel"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="registerForm.password"
                  label="Password"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- confirm password -->
              <VCol cols="12">
                <VTextField
                  v-model="registerForm.confirmPassword"
                  label="Confirm Password"
                  :rules="[requiredValidator]"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="
                    isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :error="
                    registerForm.password !== registerForm.confirmPassword &&
                    registerForm.confirmPassword.length > 0
                  "
                  :error-messages="
                    registerForm.password !== registerForm.confirmPassword &&
                    registerForm.confirmPassword.length > 0
                      ? 'Passwords do not match'
                      : ''
                  "
                  @click:append-inner="
                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                  "
                />

                <!-- register button -->
                <VBtn
                  class="mt-4"
                  block
                  type="submit"
                  :loading="isRegisterLoading"
                  :disabled="!isRegisterFormValid"
                >
                  Sign up
                </VBtn>
              </VCol>

              <!-- Login link -->
              <VCol cols="12" class="text-center">
                <p class="mb-0">
                  Already have an account?
                  <VBtn
                    variant="text"
                    class="text-primary pa-0"
                    @click="switchToLogin"
                  >
                    Sign in instead
                  </VBtn>
                </p>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>

  <!-- OTP Verification -->
  <div
    v-else-if="showVerification || currentView === 'verify'"
    class="auth-wrapper d-flex align-center justify-center pa-4"
  >
    <div class="position-relative my-sm-16">
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="text-primary auth-v1-bottom-shape d-none d-sm-block"
      />

      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <VCardTitle>
            <VImg src="/logo.png" width="120" />
          </VCardTitle>
        </VCardItem>

        <VCardText class="text-center">
          <h4 class="text-h4 mb-1">Two Step Verification 💬</h4>
          <p class="mb-1">
            We sent a verification code to your mobile. Enter the code from the
            mobile in the field below.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleOtpVerification">
            <VRow>
              <VCol cols="12">
                <h6 class="text-body-1">Type your 6 digit security code</h6>
                <VOtpInput
                  v-model="otp"
                  :disabled="isOtpInserted"
                  type="number"
                  class="pa-0"
                  @finish="onOtpFinish"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  :loading="isOtpInserted"
                  :disabled="isOtpInserted || otp.length !== 6"
                  block
                  type="submit"
                >
                  Verify my account
                </VBtn>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-center align-center">
                  <VBtn
                    variant="text"
                    :disabled="isOtpInserted"
                    @click="goBackToLogin"
                  >
                    Back to Login
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
