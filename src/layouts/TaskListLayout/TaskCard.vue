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

    <q-card-actions class="taskCard__footer">
      <div v-for="(button, i) in props.buttons" :key="i">
        <router-link :to="button.route">
          <q-btn flat color="primary" :icon="button.icon">
            {{ button.label }}
          </q-btn>
        </router-link>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { ComputedRef } from "vue";
import type { TaskMetaData } from "src/stores/taskGraphStore";

export interface TaskCard extends TaskMetaData {
  taskId: string;
  buttons: Array<TaskGridButton>;
}

export interface TaskGridButton {
  route: string;
  label: string | ComputedRef<string>;
  icon?: string;
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

.taskCard__footer {
  display: flex;
  justify-content: start;
  align-items: center;
}
</style>
