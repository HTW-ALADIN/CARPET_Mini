import { defineStore } from "pinia";
import { ref } from "vue";
import { useTaskGraphStore } from "./taskGraphStore";
import { UUID } from "crypto";
import { EventLog } from "./taskGraphStore";
import { TaskMetaData } from "src/stores/taskGraphStore";
import type { TaskGraphState } from "src/stores/taskGraphStore";

const randomUUID = (): UUID => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) as UUID;
};

export interface WorkedTaskMetaData {
  taskStatus: Array<
    "started" | "completed" | "annotated" | "replayed" | "shared" | "corrected"
  >;
  sucessStatus: ("correct" | "incorrect" | "incomplete") | string;
  sharedWith: Array<UUID | string>;
  date: [number, number] | Array<number>; // [timestamp - started, timestamp - last interaction]
  taskMetaData: TaskMetaData;
  userData: {
    id: UUID | string;
  };
}

export interface WorkedTask {
  metaData: WorkedTaskMetaData;
  logId: UUID | string;
  eventLog: EventLog;
  lastState: Omit<TaskGraphState, "eventLog">;
}

export const useUserStore = defineStore(
  "userStore",
  () => {
    /**
     * (Mocked) Getter for reading all serialised tasks from the file system.
     * @returns A dictionary of tasks, where the key is the task name and the value is the serialised task.
     */
    const workedTask = ref({} as WorkedTask);

    const taskStore = useTaskGraphStore();

    const userId = ref(randomUUID());

    const saveWorkedTask = () => {
      const { eventLog, ...lastState } = taskStore.$state;

      workedTask.value = {
        eventLog,
        logId: randomUUID(),
        metaData: {
          taskStatus: [],
          sucessStatus: "incomplete",
          sharedWith: [],
          date: [eventLog.interactionEvents[0].timestamp, Date.now()],
          taskMetaData: taskStore.getProperty("$.metaData"),
          userData: { id: userId.value },
        },
        lastState,
      };
    };

    /**
     * (Mocked) Getter for the task categories.
     * @returns An array of task categories.
     */
    const taskCategories = ref(["SQL", "Production", "Data Analysis"]);

    return {
      workedTask,
      taskCategories,
      saveWorkedTask,
    };
  },
  {
    persist: true,
  },
);
