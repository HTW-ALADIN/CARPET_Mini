import { defineStore } from "pinia";
import { ref } from "vue";
import { UUID } from "crypto";
import { EventLog } from "./taskGraphStore";

import serialisedTaskSchema from "src/schemas/zodSchemas/SerialisedTaskSchema";
import { TaskMetaData } from "src/stores/taskGraphStore";

/**
 * TODO: Dynamically load the tasks from the backend, once the interface is defined.
 */
import ExampleTask from "src/SerialisedTasks/Example.carpet.json";
// Testing purposes only
const staticTasks = {
  Example: serialisedTaskSchema.parse(ExampleTask),
  Example1: serialisedTaskSchema.parse(ExampleTask),
  Example2: serialisedTaskSchema.parse(ExampleTask),
  Example3: serialisedTaskSchema.parse(ExampleTask),
  Example4: serialisedTaskSchema.parse(ExampleTask),
  Example5: serialisedTaskSchema.parse(ExampleTask),
  Example6: serialisedTaskSchema.parse(ExampleTask),
  Example7: serialisedTaskSchema.parse(ExampleTask),
  Example8: serialisedTaskSchema.parse(ExampleTask),
  Example9: serialisedTaskSchema.parse(ExampleTask),
  Example10: serialisedTaskSchema.parse(ExampleTask),
  Example11: serialisedTaskSchema.parse(ExampleTask),
  Example12: serialisedTaskSchema.parse(ExampleTask),
  Example13: serialisedTaskSchema.parse(ExampleTask),
  Example14: serialisedTaskSchema.parse(ExampleTask),
};

export interface WorkedTask {
  metaData: {
    taskStatus: Array<
      | "started"
      | "completed"
      | "annotated"
      | "replayed"
      | "shared"
      | "corrected"
    >;
    sucessStatus: "correct" | "incorrect";
    sharedWith: Array<UUID>;
    date: [number, number]; // [timestamp - started, timestamp - last interaction]
    taskMetaData: TaskMetaData;
  };
  eventLog: EventLog;
}

/**
 * The available tasks in the current application.
 */
export type AvailableTasks = keyof typeof staticTasks;

export const useTaskOverviewStore = defineStore("taskOverviewStore", () => {
  /**
   * (Mocked) Getter for reading all serialised tasks from the file system.
   * @returns A dictionary of tasks, where the key is the task name and the value is the serialised task.
   */
  const tasks = ref(staticTasks);

  /**
   * (Mocked) Getter for the task categories.
   * @returns An array of task categories.
   */
  const taskCategories = ref(["SQL", "Production", "Data Analysis"]);

  return {
    tasks,
    taskCategories,
  };
});
