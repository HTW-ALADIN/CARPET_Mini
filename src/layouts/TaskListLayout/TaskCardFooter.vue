<template>
  <q-card-actions class="taskCard__footer">
    <div v-for="(button, i) in props.buttons" :key="i">
      <div v-if="isRouteButton(button)">
        <router-link :to="button.route">
          <q-btn flat color="primary" :icon="button.icon">
            <q-tooltip class="bg-accent"> {{ button.tooltip }}</q-tooltip>
          </q-btn>
        </router-link>
      </div>
      <div v-else-if="isModalButton(button)">
        <q-btn flat color="primary" :icon="button.icon">
          <q-tooltip class="bg-accent"> {{ button.tooltip }}</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card-actions>
</template>

<script setup lang="ts">
import type { TaskGridButton } from "src/layouts/TaskListLayout/CardButton";
import {
  isModalButton,
  isRouteButton,
} from "src/layouts/TaskListLayout/CardButton";

const props = defineProps<{ buttons: Array<TaskGridButton> }>();
</script>

<style scoped>
.taskCard__footer {
  display: flex;
  justify-content: start;
  align-items: center;
}
</style>
