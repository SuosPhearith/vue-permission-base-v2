import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();

//:::::::::::::::::::::::::::::::: RETURN NAVIGATOR
export default authStore.navigator;
