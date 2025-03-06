<template>
  <q-header elevated class="bg-primary text-white layoutHeader">
    <q-toolbar>
      <q-btn
        dense
        flat
        round
        icon="menu"
        @click="applicationStore.toggleLeftDrawer"
      />

      <q-toolbar-title>
        <router-link to="/"> CARPET </router-link>
        <q-avatar>
          <img src="/magicCarpet.png" />
        </q-avatar>
      </q-toolbar-title>
    </q-toolbar>

    <q-item> <LanguageSwitcher /> </q-item>
  </q-header>
</template>

<script lang="ts" setup>
import { useApplicationStore } from "src/stores/applicationStore";
import LanguageSwitcher from "src/layouts/MainLayout/components/LanguageSwitcher.vue";

const applicationStore = useApplicationStore();
</script>

<style scoped>
.layoutHeader {
  display: flex;
  flex-direction: row;
}
</style>
