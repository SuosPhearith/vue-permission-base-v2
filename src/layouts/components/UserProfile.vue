<template>
  <ConfirmDialog ref="dialogRef" />
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar class="cursor-pointer" color="" variant="tonal">
      <img
        :src="`${fileUrl}${authUser.avatar}`"
        alt="profile"
        v-if="authUser.avatar"
      />
      <v-icon v-else>tabler-user</v-icon>

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar color="" variant="tonal">
                    <img
                      :src="`${fileUrl}${authUser.avatar}`"
                      alt="profile"
                      v-if="authUser.avatar"
                    />
                    <v-icon v-else>tabler-user</v-icon>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ authUser.name || " " }}
            </VListItemTitle>
            <VListItemSubtitle>{{ authUser.email || " " }}</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link @click="navigate">
            <template #prepend>
              <VIcon class="me-2" icon="tabler-user" size="22" />
            </template>

            <VListItemTitle>Account</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <div class="flex mx-2">
            <VBtn
              class="w-full"
              @click="logoutUser(authUser?.id)"
              variant="outlined"
              color="primary"
            >
              <template #prepend>
                <VIcon class="me-2" icon="tabler-logout" size="22" />
              </template>
              Logout
            </VBtn>
          </div>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<script setup>
// Import VueJS
import { ref } from "vue";

// Import Assets
import ConfirmDialog from "@/components/customs/confirm/ConfirmDialog.vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { formTranslater } from "@/utils/formLang";

const router = useRouter();

const navigate = () => {
  router.push("/account");
};

const auth = useAuthStore();

const fileUrl = import.meta.env.VITE_FILE_URL;

const authUser = ref(auth.user);
const dialogRef = ref();

const logoutUser = async (userId) => {
  const confirm = await dialogRef.value.show({
    title: formTranslater("kh:បញ្ជាក់ការចាកចេញ;en:Confirm Logout"),
    message: formTranslater(
      "kh:តើអ្នកពិតជាចង់ចាកចេញពីគណនីអ្នកប្រើនេះមែនទេ?;en:Are you sure to logout this User?"
    ),
    type: "danger",
  });

  if (confirm) {
    try {
      await axiosInstance.post(`/auth/logout`);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
    }
  }
};
</script>
