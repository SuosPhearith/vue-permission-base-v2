<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    {{ data }}
    {{ auth.user.id }}
  </div>
</template>

<script setup>
import { io } from "socket.io-client";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTranslateStore } from "@/stores/translate";

// definePage({
//   meta: {
//     layout: "blank",
//     public: true,
//   },
// });

const auth = useAuthStore();
const t = useTranslateStore();

const socket = io("http://localhost:3001");

const loading = ref(false);
const data = ref(null);

const getData = async () => {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    data.value = "ABC";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  socket.on("new-signal", (message) => {
    if (
      Array.isArray(message.user_ids) &&
      message.user_ids.includes(auth.user.id)
    ) {
      getData();
      return;
    }
  });
});

onMounted(() => {
  getData();
});
</script>
