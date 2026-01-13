import { defineStore } from "pinia";

export const useTranslateStore = defineStore("translate", {
  state: () => ({
    locale: localStorage.getItem("lang") || "kh",
    translates: {
      kh: {
        title: "ខ្មែរ",
        flag: "seed/cambodia-flag.svg",
        data: {
          hello: "សួស្តី",
          welcome: "សូមស្វាគមន៍",
        },
      },
      en: {
        title: "English",
        flag: "seed/english-flag.svg",
        data: {
          hello: "Hello",
          welcome: "Welcome",
        },
      },
    },
  }),

  actions: {
    setLang(lang) {
      this.locale = lang;
      localStorage.setItem("lang", lang);
    },

    setTranslates(data) {
      this.translates = data;
    },

    t(key, defaultValue = null, forceLang = null) {
      const lang = forceLang || this.locale;
      const current = this.translates[lang];

      if (!current || !current.data || !(key in current.data)) {
        const kh = this.translates["kh"];
        if (kh && kh.data && key in kh.data) {
          return kh.data[key];
        }
        return defaultValue ?? key;
      }

      return current.data[key];
    },
  },
});
