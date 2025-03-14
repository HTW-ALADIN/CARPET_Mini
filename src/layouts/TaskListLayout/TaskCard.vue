<template>
  <q-card class="taskCard rounded-borders" flat bordered>
    <q-card-section class="taskCard__body" horizontal>
      <q-card-section class="taskCard__body-description q-pt-xs">
        <div class="text-overline">{{ props.taskCategory }}</div>
        <div class="text-h5 q-mt-sm q-mb-xs">{{ props.taskName }}</div>
        <div class="text-caption text-grey">
          {{ props.taskDescription }}
        </div>
      </q-card-section>

      <q-card-section
        class="taskCard__body-image col-5 flex flex-center"
        v-if="props.taskImage"
      >
        <q-img class="rounded-borders" :src="props.taskImage" />
      </q-card-section>
    </q-card-section>

    <q-separator />

    <TaskCardFooter :buttons="props.buttons"> </TaskCardFooter>
  </q-card>
</template>

<script setup lang="ts">
import type { TaskMetaData } from "src/stores/taskGraphStore";
import type { TaskGridButton } from "src/layouts/TaskListLayout/CardButton";
import TaskCardFooter from "src/layouts/TaskListLayout/TaskCardFooter.vue";

export interface TaskCard extends TaskMetaData {
  id: string;
  buttons: Array<TaskGridButton>;
}

const props = defineProps<TaskCard>();
</script>

<style scoped>
.taskCard {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 300px;
}
.taskCard__body {
  height: 250px;
}
.taskCard__body-description {
}
.taskCard__body-image {
}
</style>
