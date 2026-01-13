import { useAuthStore } from "@/stores/auth";

export const hasPermission = (permission) => {
  const authStore = useAuthStore();
  return authStore.permissions.includes(permission);
};
