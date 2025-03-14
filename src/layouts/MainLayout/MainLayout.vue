<template>
  <q-layout class="mainLayout" view="hHh lpR fFf">
    <MainHeader> </MainHeader>

    <LeftDrawer> </LeftDrawer>

    <q-page-container class="mainLayout__body">
      <q-page v-if="isLoading">
        <LoadingSpinner />
      </q-page>

      <q-page class="mainLayout__body" v-else>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import LeftDrawer from "./LeftDrawer.vue";
import MainHeader from "./MainHeader.vue";
import { useTaskGraphStore } from "src/stores/taskGraphStore";
import { computed } from "vue";

import LoadingSpinner from "src/components/LoadingSpinner.vue";

const taskStore = useTaskGraphStore();

const isLoading = computed(() => taskStore.isLoading);
</script>

<style scoped>
.mainLayout__body {
  height: 100%;
  width: 100%;
}

.mainLayout {
  height: 100vh;
  height: 100vh;
}
</style>
