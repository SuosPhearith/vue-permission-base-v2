<script setup>
import { computed, defineExpose, ref } from "vue";

const dialog = ref(false);
const resolveFn = ref(null);
const title = ref("");
const message = ref("");
const type = ref("info"); // Default type

const show = (options) => {
  title.value =
    options.title ||
    (options.type === "danger" ? "Confirm Deletion" : "Confirmation");
  message.value =
    options.message ||
    (options.type === "danger"
      ? "Are you sure you want to delete this item?"
      : "Please confirm your action.");
  type.value = options.type || "info";
  dialog.value = true;

  return new Promise((resolve) => {
    resolveFn.value = resolve;
  });
};

const confirm = () => {
  dialog.value = false;
  resolveFn.value(true);
};

const cancel = () => {
  dialog.value = false;
  resolveFn.value(false);
};

// Computed properties for dynamic styling
const iconConfig = computed(() => {
  switch (type.value) {
    case "danger":
      return {
        icon: "tabler-question-mark",
        color: "#dc2626",
        bgColor: "rgba(220, 38, 38, 0.1)",
      };
    case "warning":
      return {
        icon: "tabler-question-mark",
        color: "#d97706",
        bgColor: "rgba(217, 119, 6, 0.1)",
      };
    case "success":
      return {
        icon: "tabler-question-mark",
        color: "#059669",
        bgColor: "rgba(5, 150, 105, 0.1)",
      };
    case "info":
    default:
      return {
        icon: "tabler-question-mark",
        color: "#2563eb",
        bgColor: "rgba(37, 99, 235, 0.1)",
      };
  }
});

const confirmButtonConfig = computed(() => {
  switch (type.value) {
    case "danger":
      return {
        text: "Delete",
        color: "#dc2626",
        bgColor: "rgba(220, 38, 38, 0.1)",
      };
    case "warning":
      return { text: "Continue", color: "#d97706", bgColor: "#d97706" };
    case "success":
      return { text: "Confirm", color: "#059669", bgColor: "#059669" };
    case "info":
    default:
      return { text: "Confirm", color: "#2563eb", bgColor: "#2563eb" };
  }
});

defineExpose({ show });
</script>

<template>
  <VDialog v-model="dialog" max-width="440" persistent>
    <VCard elevation="24">
      <VCardText>
        <div class="flex justify-center items-center flex-col mb-6">
          <div
            class="rounded-full w-[80px] h-[80px]"
            :style="{ backgroundColor: iconConfig.bgColor }"
          >
            <v-icon :color="iconConfig.color" size="78" class="icon">
              {{ iconConfig.icon }}
            </v-icon>
          </div>
          <h2 class="text-lg font-bold mt-2">
            {{ title }}
          </h2>
          <p class="dialog-message">
            {{ message }}
          </p>
        </div>
        <div class="flex justify-center gap-1">
          <VBtn class="w-1/2" variant="outlined" @click="cancel">
            <VIcon start size="24" icon="tabler-x" />Cancel
          </VBtn>
          <VBtn
            class="w-1/2"
            variant="flat"
            @click="confirm"
            :style="{
              backgroundColor: confirmButtonConfig.bgColor,
              color: 'white',
            }"
          >
            <VIcon start size="24" icon="tabler-check" />
            {{ confirmButtonConfig.text }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
