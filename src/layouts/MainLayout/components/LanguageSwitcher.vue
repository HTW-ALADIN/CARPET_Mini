<template>
  <q-select
    outlined
    filled
    color="dark"
    bg-color="secondary"
    v-model="locale"
    :options="localeOptions"
    :label="languageString"
    borderless
    emit-value
    map-options
    style="min-width: 150px"
  />
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LocaleOptions from "src/i18n/index";

const { locale, t } = useI18n({ useScope: "global" });
const languageString = computed(() => t("language"));

const localeOptions = Object.keys(LocaleOptions).map((key) => ({
  value: key,
  label: key,
}));
</script>
