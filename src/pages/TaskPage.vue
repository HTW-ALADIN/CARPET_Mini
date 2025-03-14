<template>
  <div class="task">
    <NavigationComponent :storeObject="taskStore"> </NavigationComponent>
    <LOOM
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
import { useRoute, onBeforeRouteLeave } from "vue-router";
import { LOOM } from "carpet-component-library";
import { useTaskGraphStore } from "src/stores/taskGraphStore";
import { useApplicationStore } from "src/stores/applicationStore";
import { useUserStore } from "src/stores/userStore";
import NavigationComponent from "src/components/NavigationComponent.vue";

const taskStore = useTaskGraphStore();
const layoutSize = taskStore.getLayoutSize;
const { getProperty } = taskStore;

const route = useRoute();
const currentNode = computed(() => getProperty("$.currentNode"));

const applicationStore = useApplicationStore();
const grid = computed(() => applicationStore.SNAP_GRID);
const darkMode = computed(() => applicationStore.darkMode);

const userStore = useUserStore();

/**
 * TODO: Gradually save the task state to the backend. Only fallback to local storage if the backend is not available.
 */
onBeforeRouteLeave((from, to, next) => {
  userStore.saveWorkedTask();
  next();
});

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
  window.addEventListener("beforeunload", userStore.saveWorkedTask);

  taskStore.setCurrentTask(route.params.taskName as string);
  if (route.params.logId) {
    taskStore.rehydrate(<string>route.params.logId);
  } else {
    taskStore.fetchTaskGraph();
  }
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
  window.removeEventListener("beforeunload", userStore.saveWorkedTask);

  document.removeEventListener("mousemove", trackMouse);
});
</script>

<style scoped>
.task {
  height: 100%; /*calc(100vh - 50px);*/
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
