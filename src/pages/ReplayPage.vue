<template>
  <div class="replayOverlay">
    <div class="replayOverlay__progressBar" @click="updateProgressOnClick">
      <div class="replayOverlay__progressBar-progress"></div>
      <div
        class="replayOverlay__progressBar-event"
        :style="`left: ${eventMarkerPosition}px;`"
        v-for="eventMarkerPosition in eventMarkers"
        :key="eventMarkerPosition"
      ></div>
    </div>

    <Transition name="fade">
      <div class="replayOverlay__replayBar" v-if="!isAnnotating">
        <q-btn
          class="iconButton"
          flat
          :icon="isPlaying ? 'pause_circle' : 'play_circle'"
          @click="isPlaying = !isPlaying"
        >
          <q-tooltip class="bg-accent">
            {{ isPlaying ? stopReplayString : replayTaskString }}</q-tooltip
          >
        </q-btn>

        <router-link
          :to="`/task/${workedTask?.metaData.taskMetaData.taskId}/${workedTask?.logId}`"
        >
          <q-btn flat icon="arrow_outward" class="iconButton">
            <q-tooltip class="bg-accent"> {{ resumeTaskString }}</q-tooltip>
          </q-btn>
        </router-link>

        <q-btn
          flat
          icon="add_comment"
          @click="isAnnotating = !isAnnotating"
          class="iconButton"
        >
          <q-tooltip class="bg-accent"> {{ annotateReplayString }}</q-tooltip>
        </q-btn>

        <q-btn flat icon="share" class="iconButton">
          <q-tooltip class="bg-accent"> {{ shareTaskString }}</q-tooltip>
        </q-btn>

        <q-btn-dropdown flat icon="settings">
          <!-- <q-tooltip class="bg-accent"> {{ replaySettingsString }}</q-tooltip> -->
          <q-list class="replaySettings">
            <q-item class="replaySettings__option" clickable>
              <q-item-section class="replaySettings__option-item">
                <q-icon name="fast_forward" size="md" color="black"></q-icon>
                <q-tooltip class="bg-accent">
                  {{ fastForwardEventlessSectionsString }}</q-tooltip
                >
                <!-- <q-item-label></q-item-label> -->
                <q-toggle v-model="fastForwardEventlessSections" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </Transition>
  </div>

  <Transition name="fade">
    <div class="annotationBar" v-if="isAnnotating">
      <q-btn
        flat
        icon="cancel"
        @click="isAnnotating = !isAnnotating"
        class="iconButton"
      >
        <q-tooltip class="bg-accent"> {{ endAnnotationString }}</q-tooltip>
      </q-btn>

      <q-btn
        flat
        icon="add_comment"
        @click="isElementAnnotating = !isElementAnnotating"
        class="iconButton"
      >
        <q-tooltip class="bg-accent"> {{ addAnnotationString }}</q-tooltip>
      </q-btn>
    </div>
  </Transition>

  <Transition name="fade">
    <LoadingSpinner class="loadingOverlay" v-if="isLoading" />
  </Transition>

  <div class="task">
    <LOOM
      :key="currentNode"
      :currentNodeId="currentNode"
      :storeObject="taskStore"
      :layoutSize
      :showControlBar="false"
      :showMiniMap="false"
      :grid
      :darkMode
      @update:darkMode="applicationStore.toggleDarkMode()"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  watch,
  onBeforeMount,
  ref,
  unref,
  Ref,
  onMounted,
} from "vue";
import LoadingSpinner from "src/components/LoadingSpinner.vue";
import { LOOM } from "carpet-component-library";
import { useTaskGraphStore } from "src/stores/taskGraphStore";
import { useApplicationStore } from "src/stores/applicationStore";
import { useTaskOverviewStore } from "src/stores/taskOverviewStore";
import type { WorkedTask } from "src/stores/userStore";
import { useI18n } from "vue-i18n";
import { EventCause, StoreSetterPayload } from "carpet-component-library";
import { useRoute } from "vue-router";
import { findClosest } from "src/Util/HelperFunctions";

let isLoading = ref(false);

const { t } = useI18n();
const resumeTaskString = computed(() => t("resumeTask"));
const replayTaskString = computed(() => t("replayTask"));
const stopReplayString = computed(() => t("stopReplay"));
const shareTaskString = computed(() => t("shareTask"));
const annotateReplayString = computed(() => t("annotateReplay"));
const addAnnotationString = computed(() => t("addAnnotation"));
const endAnnotationString = computed(() => t("endAnnotation"));
const fastForwardEventlessSectionsString = computed(() =>
  t("fastForwardEventlessSections"),
);

let fastForwardEventlessSections = ref(false);
interface EvenlessSections {
  eventlessSectionBeginnings: Array<number>;
  eventlessSectionEndings: { [key: number]: number };
}
const eventlessSections: Ref<EvenlessSections> = ref({
  eventlessSectionBeginnings: [],
  eventlessSectionEndings: {},
});
const EVENTLESS_SECTION_TIMESPAN = 5000;

const isAnnotating = ref(false);
const isElementAnnotating = ref(false);

const route = useRoute();

const taskStore = useTaskGraphStore();
const layoutSize = taskStore.getLayoutSize;
const { getProperty, setProperty } = taskStore;

const currentNode = computed(() => getProperty("$.currentNode"));

const applicationStore = useApplicationStore();
const grid = computed(() => applicationStore.SNAP_GRID);
const darkMode = computed(() => applicationStore.darkMode);

const taskOverviewStore = useTaskOverviewStore();

const UPDATE_RATE = 50;

const workedTask: Ref<WorkedTask | null> = ref(null);
let isPlaying = ref(false);
let progress = ref(0);
const timespan = ref(0);
const pageWidth = window.innerWidth;
const stepSize = ref(0);

interface EventTimeStampMap {
  [timestamp: number]: Array<StoreSetterPayload>;
}

const eventsPerTimestamp: Ref<EventTimeStampMap> = ref({});
const eventMarkers: Ref<Set<number>> = ref(new Set());
let timeStampOfLastAppliedEvent = ref(0);

// TODO: Split up into smaller functions (if necessary after integrating backend)
onBeforeMount(async () => {
  taskStore.toggleLoading();

  /**
   * TODO: Inspect why this operation takes so much longer when performed after using a router-link in comparison to reloading the page
   */
  const workedTaskId = route.params.id as string;
  if (taskOverviewStore.workedTasks.hasOwnProperty(workedTaskId)) {
    workedTask.value = taskOverviewStore.workedTasks[workedTaskId];

    const [start, end] = (<WorkedTask>unref(workedTask)).metaData.date;
    timespan.value = end - start;

    stepSize.value = pageWidth / (timespan.value / UPDATE_RATE);

    let previousEventTimestamp = 0;

    let prev = true;
    const events = (<WorkedTask>unref(workedTask)).eventLog.interactionEvents;
    for (const event of events) {
      if (event.payload.metadata?.cause === EventCause.Store && prev) {
        const payload = {
          ...event.payload,
          metadata: {
            ...event.payload.metadata,
            store: false,
          },
        };
        setProperty(payload);
      } else {
        const relativeTimeStamp =
          (<WorkedTask>unref(workedTask)).metaData.date[1] - event.timestamp;

        // Create a map of events per timestamp
        if (eventsPerTimestamp.value.hasOwnProperty(relativeTimeStamp)) {
          eventsPerTimestamp.value[relativeTimeStamp].push(event.payload);
        } else {
          eventsPerTimestamp.value[relativeTimeStamp] = [event.payload];
        }

        const positionInPx = (relativeTimeStamp / unref(timespan)) * pageWidth;

        // create a set of event markers
        // only add event markers if they are not caused by EventCause.Store
        if (event.payload.metadata?.cause !== EventCause.Store) {
          eventMarkers.value.add(Math.round(positionInPx));
        }

        // a section is considered eventless if the time between two events is greater than EVENTLESS_SECTION_TIMESPAN
        if (
          relativeTimeStamp - previousEventTimestamp >
          EVENTLESS_SECTION_TIMESPAN
        ) {
          eventlessSections.value.eventlessSectionBeginnings.push(
            previousEventTimestamp,
          );
          eventlessSections.value.eventlessSectionEndings[
            previousEventTimestamp
          ] = relativeTimeStamp;

          previousEventTimestamp = relativeTimeStamp;
        }
      }
    }
  }

  taskStore.toggleLoading();
});

onMounted(() => {
  // Ignore user input on task interface
  (<HTMLElement>document.querySelector(".task")).style.pointerEvents = "none";
});

const updateProgressBar = () => {
  const progressBar = <HTMLElement>(
    document.querySelector(".replayOverlay__progressBar-progress")
  );
  progressBar.style.width = `${progress.value}px`;
};

const asyncWait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const updateProgressStepWise = async () => {
  while (unref(isPlaying)) {
    await asyncWait(UPDATE_RATE);

    progress.value += unref(stepSize);

    if (unref(progress) >= unref(timespan)) {
      isPlaying.value = false;
    }
  }
};

const calcRelativeProgressTimeStamp = (currentProgress: number) => {
  const progressPercentage = currentProgress / pageWidth;
  return progressPercentage * timespan.value;
};

const filterTimeStampsToApply = (relativeProgressTimeStamp: number) => {
  return Object.keys(unref(eventsPerTimestamp)).filter(
    (eventTimestamp) =>
      parseInt(eventTimestamp) > unref(timeStampOfLastAppliedEvent) &&
      parseInt(eventTimestamp) <= relativeProgressTimeStamp,
  );
};

const updateProgressOnClick = async (event: MouseEvent) => {
  isLoading.value = true;

  // Stop the replay while applying events, then resume it afterwards
  const isPlayingState = unref(isPlaying);
  isPlaying.value = false;

  const progressBarPosition = event.clientX;

  const relativeProgressTimeStamp =
    calcRelativeProgressTimeStamp(progressBarPosition);
  const eventTimeStampsToApply = filterTimeStampsToApply(
    relativeProgressTimeStamp,
  );

  // TODO: Fix bug when dragging progress bar back

  // reset progress if the user drags the progress bar back
  if (relativeProgressTimeStamp < unref(timeStampOfLastAppliedEvent)) {
    timeStampOfLastAppliedEvent.value = 0;
  }

  // chunk the progress application into steps of the given UPDATE_RATE, so that the UI is not blocked
  if (eventTimeStampsToApply) {
    for (const timestamp of eventTimeStampsToApply) {
      progress.value = (parseInt(timestamp) / timespan.value) * stepSize.value;
      await asyncWait(1);
    }
    progress.value = progressBarPosition;
  }

  isPlaying.value = isPlayingState;

  isLoading.value = false;
};

const applyEvents = (currentProgress: number) => {
  const relativeProgressTimeStamp =
    calcRelativeProgressTimeStamp(currentProgress);

  const eventTimeStampsToApply = filterTimeStampsToApply(
    relativeProgressTimeStamp,
  );

  // TODO: Can and should be heavily optimized
  eventTimeStampsToApply.sort().forEach((timestamp) => {
    const events = unref(eventsPerTimestamp)[parseInt(timestamp)];
    events.forEach((event) => {
      setProperty(event);
    });
    timeStampOfLastAppliedEvent.value = relativeProgressTimeStamp;
  });
};

// TODO: Fix this function
const isEventlessSection = (progress: number) => {
  //
  if (progress > 0)
    return {
      isEventless: true,
      skipTo: progress,
    };

  const lowerBoundary = findClosest(
    unref(eventlessSections).eventlessSectionBeginnings,
    progress,
  );

  const upperBoundary =
    unref(eventlessSections).eventlessSectionEndings[lowerBoundary];

  const relativeProgressTimeStamp = calcRelativeProgressTimeStamp(progress);
  return {
    isEventless:
      lowerBoundary < relativeProgressTimeStamp &&
      relativeProgressTimeStamp < upperBoundary,
    skipTo:
      // TODO: Fix this calculation
      (upperBoundary / timespan.value) * stepSize.value -
      EVENTLESS_SECTION_TIMESPAN,
  };
};

watch(isPlaying, async () => {
  if (unref(isPlaying)) {
    updateProgressStepWise();
  }
});

watch(progress, async () => {
  if (fastForwardEventlessSections.value) {
    const { isEventless, skipTo } = isEventlessSection(progress.value);
    if (isEventless) {
      skipTo;
      // progress.value = skipTo;
      // return;
    }
  }

  updateProgressBar();

  applyEvents(progress.value);
});

const highlightElement = (event: MouseEvent) => {
  const hoveredElement = <HTMLElement>event.target;
  hoveredElement.style.border = "2px solid red";
};
const dehighlightElement = (event: MouseEvent) => {
  const hoveredElement = <HTMLElement>event.target;
  hoveredElement.style.border = "none";
};

const addAnnotation = (event: MouseEvent) => {
  // TODO: Implement annotation logic
  // TODO: Add RDFA annotations to LOOM components
  //              => Enrichens the semantic information for feedback and analysis
  //              => Can be used to generate XAPI statements
  console.error(event.target);
  // document.querySelectorAll( ":hover" );
};

watch(isAnnotating, () => {
  if (unref(isAnnotating)) {
    isPlaying.value = false;
    (<HTMLElement>document.querySelector(".replayOverlay")).style.zIndex = "0";
    (<HTMLElement>document.querySelector(".task")).inert = true;
  } else {
    (<HTMLElement>document.querySelector(".replayOverlay")).style.zIndex =
      "1000";
  }
});

watch(isElementAnnotating, () => {
  if (unref(isElementAnnotating)) {
    (<HTMLElement>document.querySelector(".task")).inert = false;
    const loomNodes = document.querySelectorAll(".task .vue-flow__nodes > *");
    loomNodes.forEach((node) => {
      (<HTMLElement>node).style.zIndex = "1000";
      (<HTMLElement>node).addEventListener("mousemove", highlightElement);
      (<HTMLElement>node).addEventListener("mouseout", dehighlightElement);
      (<HTMLElement>node).addEventListener("click", addAnnotation);
    });
  } else {
    (<HTMLElement>document.querySelector(".task")).inert = true;
    const loomNodes = document.querySelectorAll(".task .vue-flow__nodes > *");
    loomNodes.forEach((node) => {
      (<HTMLElement>node).style.zIndex = "0";
    });
  }
});
</script>

<style scoped>
.annotationBar {
  position: absolute;
  z-index: 1000;
  left: 50px;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 400px;
  width: 75px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.replayOverlay {
  position: absolute;
  z-index: 1000;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.replayOverlay__replayBar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  z-index: 1000;
  height: 75px;
  width: 500px;
  color: white;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(51, 51, 51, 0.9);
  border-radius: 5px;
}
.iconButton {
  color: white;
  font-size: 1.5rem;
}

.replayOverlay__progressBar {
  position: absolute;
  z-index: 1000;
  height: 5px;
  width: 100%;
  max-width: 100%;
  bottom: 0;
  background-color: rgba(139, 139, 139, 0.9);
  transition: 0.3s;
}

.replayOverlay__progressBar:hover {
  height: 20px;
  transition: 0.3s;
  background-color: rgba(139, 139, 139, 0.7);
  cursor: pointer;
}

.replayOverlay__progressBar:hover > .replayOverlay__progressBar-event {
  height: 20px;
  transition: 0.3s;
}

.replayOverlay__progressBar-event {
  position: absolute;
  bottom: 0;
  width: 1px;
  height: 5px;
  transition: 0.3s;
  background-color: white;
}

.replayOverlay__progressBar-progress {
  width: 0%;
  height: 20px;
  transition: 0.2s;
  background-color: rgba(51, 51, 51, 0.9);
}

.task {
  height: 100%;
  width: 100%;
}

.loadingOverlay {
  position: absolute;
  background-color: whitesmoke;
  z-index: 500;
  height: 100%;
  width: 100%;
}

.replaySettings {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.replaySettings__option {
  width: 100%;
}

.replaySettings__option-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
