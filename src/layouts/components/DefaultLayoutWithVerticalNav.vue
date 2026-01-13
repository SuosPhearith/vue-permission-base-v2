<script setup>
import navItems from "@/navigation/vertical";
import { themeConfig } from "@themeConfig";

// Components
import NavbarThemeSwitcher from "@/layouts/components/NavbarThemeSwitcher.vue";
import UserProfile from "@/layouts/components/UserProfile.vue";

// @layouts plugin
import { VerticalNavLayout } from "@layouts";
import SwitchLanguage from "./SwitchLanguage.vue";
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center justify-between">
        <div>
          <IconBtn
            id="vertical-nav-toggle-btn"
            class="ms-n3 d-lg-none"
            @click="toggleVerticalOverlayNavActive(true)"
          >
            <VIcon size="26" icon="tabler-menu-2" />
          </IconBtn>
        </div>

        <div class="flex justify-center items-center gap-2">
          <CustomNotificationNav class="me-2" />
          <NavbarThemeSwitcher class="me-2" />
          <SwitchLanguage class="me-2" />
          <UserProfile />
        </div>
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />
  </VerticalNavLayout>
</template>
