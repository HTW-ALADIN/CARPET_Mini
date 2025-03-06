<template>
  <div class="taskListLayout">
    <TaskSearchBar />
    <TaskGrid v-bind="props.grid">
      <template #card="card">
        <slot name="card" v-bind="card"></slot>
      </template>
    </TaskGrid>
  </div>
</template>

<script lang="ts" setup>
import TaskSearchBar from "src/layouts/TaskListLayout/TaskSearchBar.vue";
import TaskGrid from "src/layouts/TaskListLayout/TaskGrid.vue";
import type { TaskGridProps } from "src/layouts/TaskListLayout/TaskGrid.vue";

const props = defineProps<{
  grid: TaskGridProps;
}>();
</script>

<style scoped>
.taskListLayout {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}
</style>
