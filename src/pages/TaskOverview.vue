<template>
  <q-page class="taskPage row items-center justify-evenly">
    <TaskListLayout v-bind="{ grid: { cards: taskCards } }">
      <template #card="card">
        <TaskCard v-bind="<TaskCardProps>card"></TaskCard>
      </template>
    </TaskListLayout>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskOverviewStore } from "src/stores/taskOverviewStore";
import { useI18n } from "vue-i18n";
import type { TaskGridButton } from "src/layouts/TaskListLayout/CardButton";
import TaskCard from "src/layouts/TaskListLayout/TaskCard.vue";
import type { TaskCard as TaskCardProps } from "src/layouts/TaskListLayout/TaskCard.vue";

import TaskListLayout from "src/layouts/TaskListLayout/TaskListLayout.vue";

const taskOverviewStore = useTaskOverviewStore();

const { t } = useI18n();
const startTaskString = computed(() => t("startTask"));

const { tasks } = taskOverviewStore;
const taskCards = Object.entries(tasks).map(([taskId, taskSpec]) => {
  const { metaData } = taskSpec;
  const buttons: Array<TaskGridButton> = [
    {
      route: `/task/${taskId}`,
      tooltip: startTaskString,
      icon: "arrow_outward",
    },
  ];
  return { taskId, buttons, ...metaData };
});
</script>

<style scoped></style>
