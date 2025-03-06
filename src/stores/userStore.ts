import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("userStore", () => {
  /**
   * (Mocked) Getter for reading all serialised tasks from the file system.
   * @returns A dictionary of tasks, where the key is the task name and the value is the serialised task.
   */
  const tasks = ref("workedTasks");

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
