<template>
  <div class="taskGrid q-pa-md row items-start q-gutter-md">
    <div v-for="card in props.cards" :key="card.id">
      <slot name="card" v-bind="card"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskCard } from "src/layouts/TaskListLayout/TaskCard.vue";
import type { WorkedTaskCard } from "src/layouts/TaskListLayout/WorkedTaskCard.vue";

export interface TaskGridProps {
  cards: Array<TaskCard | WorkedTaskCard>;
}

const props = defineProps<TaskGridProps>();
</script>

<style scoped>
.taskGrid {
  display: flex;
  /* align-items: center; */
  justify-content: space-evenly;
  height: 100%;
  width: 100%;
}
</style>
