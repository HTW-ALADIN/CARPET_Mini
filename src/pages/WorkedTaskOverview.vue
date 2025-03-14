<template>
  <q-page class="taskPage row items-center justify-evenly">
    <TaskListLayout v-bind="{ grid: { cards: workedTaskCards } }">
      <template #card="card">
        <WorkedTaskCard v-bind="<WorkedTaskCardProps>card"></WorkedTaskCard>
      </template>
    </TaskListLayout>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskOverviewStore } from "src/stores/taskOverviewStore";
import { useI18n } from "vue-i18n";
import type { TaskGridButton } from "src/layouts/TaskListLayout/CardButton";
import WorkedTaskCard from "src/layouts/TaskListLayout/WorkedTaskCard.vue";
import type { WorkedTaskCard as WorkedTaskCardProps } from "src/layouts/TaskListLayout/WorkedTaskCard.vue";

import TaskListLayout from "src/layouts/TaskListLayout/TaskListLayout.vue";
import { UUID } from "crypto";
import type { WorkedTaskMetaData } from "src/stores/userStore";

const taskOverviewStore = useTaskOverviewStore();

const { t } = useI18n();
const resumeTaskString = computed(() => t("resumeTask"));
const replayTaskString = computed(() => t("replayTask"));
const shareTaskString = computed(() => t("shareTask"));

const { workedTasks } = taskOverviewStore;
const workedTaskCards = Object.entries(workedTasks).map(
  ([workedTaskId, taskSpec]) => {
    const metaData: WorkedTaskMetaData = taskSpec.metaData;
    const buttons: Array<TaskGridButton> = [
      {
        route: `/task/${metaData.taskMetaData.taskId}/${workedTaskId}`,
        tooltip: resumeTaskString,
        icon: "arrow_outward",
      },
      {
        route: `/workedTask/${workedTaskId}`,
        tooltip: replayTaskString,
        icon: "visibility",
      },
      {
        modal: {},
        tooltip: shareTaskString,
        icon: "share",
      },
    ];
    return { id: workedTaskId as UUID, buttons, metaData: metaData };
  },
);
</script>

<style scoped></style>
