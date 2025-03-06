<template>
  <q-drawer
    v-model="applicationStore.leftDrawerOpen"
    side="left"
    overlay
    elevated
  >
    <div class="q-pa-md" style="max-width: 350px">
      <q-list bordered separator class="rounded-borders">
        <router-link :to="`/tasks`">
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon color="primary" name="description" />
            </q-item-section>
            <q-item-section>{{ taskString }}</q-item-section>
          </q-item>
        </router-link>

        <router-link :to="`/workedTasks`">
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon color="primary" name="task" />
            </q-item-section>
            <q-item-section>{{ workedTaskString }}</q-item-section>
          </q-item>
        </router-link>

        <router-link :to="`/settings`">
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon color="primary" name="settings" />
            </q-item-section>
            <q-item-section>{{ settingString }}</q-item-section>
          </q-item>
        </router-link>
      </q-list>
    </div>
  </q-drawer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useApplicationStore } from "src/stores/applicationStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const taskString = computed(() => t("task", 2));
const workedTaskString = computed(() => t("workedTask", 2));
const settingString = computed(() => t("settings"));

const applicationStore = useApplicationStore();
</script>

<style></style>
