<template>
  <q-card class="taskCard rounded-borders" flat bordered>
    <q-card-section class="taskCard__body" horizontal>
      <q-card-section class="taskCard__body-description q-pt-xs">
        <div class="text-overline">
          {{ props.metaData.taskMetaData.taskCategory }}
        </div>
        <div class="text-h5 q-mt-sm q-mb-xs">
          {{ props.metaData.taskMetaData.taskName }}
        </div>
        <div class="text-caption text-grey">
          {{ props.metaData.taskMetaData.taskDescription }}
        </div>
      </q-card-section>

      <q-card-section
        class="taskCard__body-image col-5 flex flex-center"
        v-if="props.metaData.taskMetaData.taskImage"
      >
        <q-img
          class="rounded-borders"
          :src="props.metaData.taskMetaData.taskImage"
        />
      </q-card-section>
    </q-card-section>

    <q-separator />

    <div class="taskCard__badges q-gutter-md">
      <q-badge v-if="props.metaData.date">
        Started:
        {{ date.formatDate(props.metaData.date[0], "YYYY-MM-DD") }}
      </q-badge>
      <q-badge v-if="props.metaData.date">
        Last:
        {{ date.formatDate(props.metaData.date[1], "YYYY-MM-DD") }}
      </q-badge>

      <q-badge v-if="props.metaData.sucessStatus">
        <q-icon v-if="props.metaData.sucessStatus == 'correct'" name="check">
        </q-icon>
        <q-icon v-if="props.metaData.sucessStatus == 'incorrect'" name="close">
        </q-icon>
        <q-icon
          v-if="props.metaData.sucessStatus == 'incomplete'"
          name="pending"
        >
        </q-icon>
      </q-badge>
    </div>

    <q-separator />

    <TaskCardFooter :buttons="props.buttons"> </TaskCardFooter>
  </q-card>
</template>

<script setup lang="ts">
import { UUID } from "crypto";
import type { WorkedTaskMetaData } from "src/stores/userStore";
import type { TaskGridButton } from "src/layouts/TaskListLayout/CardButton";
import TaskCardFooter from "src/layouts/TaskListLayout/TaskCardFooter.vue";
import { date } from "quasar";

export interface WorkedTaskCard {
  id: UUID | string;
  buttons: Array<TaskGridButton>;
  metaData: WorkedTaskMetaData;
}

const props = defineProps<WorkedTaskCard>();
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

.taskCard__badges {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}
</style>
