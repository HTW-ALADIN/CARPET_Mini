<template>
  <div class="task">
    <transition name="fade">
      <LoadingSpinner v-if="isLoading" />
    </transition>

    <NavigationComponent :storeObject="taskStore"> </NavigationComponent>
    <LOOM
      v-if="!isLoading"
      :key="currentNode"
      :currentNodeId="currentNode"
      :storeObject="taskStore"
      :layoutSize
      :showControlBar="true"
      :showMiniMap="true"
      :grid
      :darkMode
      @update:darkMode="applicationStore.toggleDarkMode()"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";
import { useRoute } from "vue-router";
import { LOOM } from "carpet-component-library";
import LoadingSpinner from "src/components/LoadingSpinner.vue";
import { useTaskGraphStore } from "src/stores/taskGraphStore";
import NavigationComponent from "src/components/NavigationComponent.vue";
import { useApplicationStore } from "src/stores/applicationStore";

const taskStore = useTaskGraphStore();
const layoutSize = taskStore.getLayoutSize;
const { getProperty } = taskStore;

const route = useRoute();
const currentNode = computed(() => getProperty("$.currentNode"));

const isLoading = computed(() => taskStore.isLoading);

const applicationStore = useApplicationStore();
const grid = computed(() => applicationStore.SNAP_GRID);
const darkMode = computed(() => applicationStore.darkMode);

/**
 * TODO: Implement generic actionHandler that attaches to a backend service according to a configuration
 */
//  const actionHandler = (event: Event, payload: object) => {
//   console.error(event);
//   console.error(payload);
// };

/**
 * Both onMounted and watch are required to either initialize or update the current taskName and load the task when the route changes.
 * This is due to the router not rerendering the component on the same route.
 * See: https://router.vuejs.org/guide/essentials/dynamic-matching.html#Reacting-to-Params-Changes
 */
onBeforeMount(() => {
  taskStore.setCurrentTask(route.params.taskName as string);
  taskStore.fetchTaskGraph();
});
watch(
  () => route.params.taskName,
  (newTaskName) => {
    taskStore.setCurrentTask(newTaskName as string);
    taskStore.fetchTaskGraph();
  },
);

const throttle = 50;
let last = new Date().getTime();
const trackMouse = (event: MouseEvent) => {
  event.preventDefault();
  const now = new Date().getTime();

  // update only every n milliseconds to not freeze the app
  if (now - last < throttle) return;

  taskStore.trackMouse({
    event: event,
    timestamp: now,
  });

  last = now;
};

onMounted(() => {
  document.addEventListener("mousemove", trackMouse);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", trackMouse);
});
</script>

<style scoped>
.task {
  height: calc(100vh - 50px);
  width: 100%;
}

.slidedown-enter-active,
.slidedown-leave-active {
  transition: max-height 0.3s ease-in-out;
}

.slidedown-enter-to,
.slidedown-leave-from {
  overflow: hidden;
  max-height: 100vh;
}

.slidedown-enter-from,
.slidedown-leave-to {
  overflow: hidden;
  max-height: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
