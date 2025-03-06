import { defineStore } from "pinia";
import type { StateTree } from "pinia";
import { useTaskOverviewStore } from "src/stores/taskOverviewStore";
import type { AvailableTasks } from "src/stores/taskOverviewStore";

import { JSONPath } from "jsonpath-plus";

import type {
  SerialisedComponents,
  StoreAPI,
  JSONPathExpression,
  StoreSetterPayload,
} from "carpet-component-library";
import { EventCause } from "carpet-component-library";

import type { Base64 } from "src/Util/Types";

import type { Layout, LayoutSizes, Layouts } from "carpet-component-library";

export type CARPETLayoutSizes = LayoutSizes & ("phone" | "tablet" | "desktop");

export type CARPETLayouts = Layouts & {
  [layoutSize in LayoutSizes]: Layout;
};

export interface TaskData {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Hints {
  active: boolean;
  current: number;
  descriptions: Array<string>;
}

export interface Modal {
  trigger: {
    type: "success";
  };
  content: {
    header: string;
    body: string;
    footer: {
      buttons: Array<{
        type: "close" | "route";
        label: string;
        parameters?: {
          route: string;
        };
      }>;
    };
  };
}
export type Modals = Array<Modal>;

export interface NodeState {
  isValid: boolean;
  isCorrect: boolean;
}

export interface SerialisedNode {
  layouts: CARPETLayouts;
  components: SerialisedComponents;
  state: NodeState;
  hints?: Hints;
  modal?: Modals;
  isValid?: boolean;
  isCorrect?: boolean;
}
export interface SerialisedNodes {
  [id: number]: SerialisedNode;
}

export interface TaskMetaData {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskImage?: Base64;
  taskCategory?: string;
  taskTags?: Array<string>;
}

export interface SerialisedTask {
  nodes: SerialisedNodes;
  edges: {
    [nodeId: number]: Array<number>;
  };
  metaData: TaskMetaData;
  feedbackLevel?:
    | "none"
    | "validity"
    | "correctness"
    | "unpromptedHints"
    | "unpromptedFeedback";
  layoutSize: LayoutSizes;
  rootNode?: number;
  taskData?: TaskData;
}

export interface CARPETStoreAPI extends StoreAPI {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface LoggedInteractionEvent {
  timestamp: number;
  payload: StoreSetterPayload;
}

export interface LoggedMouseEvent {
  timestamp: number;
  event: Event | MouseEvent;
}

export interface EventLog {
  interactionEvents: Array<LoggedInteractionEvent>;
  mouseEvents: Array<LoggedMouseEvent>;
}

export interface TaskGraphState extends SerialisedTask {
  currentTask: string | null;
  isLoading: boolean;
  currentNode: number | null;
  previousNode: number | null;
  eventLog: EventLog;
}

export type TaskGraphStateKey = keyof TaskGraphState;

/**
 * The taskGraphStore has to be defined with the Options-API, as `this.$state` is not available for actions in the Setup-API.
 * Acces to `this.$state` is required to manipulate the store state via `setProperty` from any component.
 */
export const useTaskGraphStore = defineStore("taskGraphStore", {
  state: (): TaskGraphState => ({
    /**
     * Tracked properties. (Set via setProperty)
     */
    currentTask: null,
    isLoading: false,
    currentNode: null,
    previousNode: null,
    metaData: {
      taskId: "",
      taskName: "",
      taskDescription: "",
    },
    taskData: {},
    feedbackLevel: "none",
    layoutSize: "desktop",
    rootNode: 0,
    nodes: {},
    edges: {},
    /**
     * Untracked properties.
     */
    eventLog: {
      interactionEvents: [],
      mouseEvents: [],
    },
  }),
  getters: {
    getPropertyFromPath: (state) => (path: JSONPathExpression) => {
      if (typeof path !== "string") {
        throw new Error(`Path is not a string: ${path}`);
      }
      const result = JSONPath({ path: path, json: state });
      if (result.length === 1) return result[0];
      else return result;
    },
    getCurrentNode: (state) => {
      return state.nodes[state.currentNode as number];
    },
    getLayoutSize: (state) => {
      return <LayoutSizes>state.layoutSize;
    },
  },
  actions: {
    setCurrentTask(taskName: string) {
      this.currentTask = taskName;
    },
    setProperty(payload: StoreSetterPayload) {
      const { path, value } = payload;
      const splitPath = JSONPath.toPathArray(path).slice(1);
      let subState = this.$state as StateTree;
      for (let depth = 0; depth < splitPath.length; depth++) {
        if (depth === splitPath.length - 1) {
          // only update the value if it is different
          if (subState[splitPath[depth]] != value) {
            subState[splitPath[depth]] = value;

            // Sideeffect: Log the state change in the current event log of the user
            this.eventLog.interactionEvents.push({
              timestamp: new Date().getTime(),
              payload,
            });

            /**
             * Log the state change in development mode.
             */
            process.env.NODE_ENV === "development" && console.log(path, value);
          }
        } else {
          subState = subState[splitPath[depth]];
        }
      }
    },
    /**
     * Required helper functions, as it is not possible to define getters that receive arguments.
     * This is due to getters being simply computed properties.
     * By returning a function from a getter, we can achieve the same functionality, but at the cost of not being able to cache the computed properties.
     * See https://pinia.vuejs.org/core-concepts/getters.html#Passing-arguments-to-getters.
     * @param path JSONPathExpression
     * @returns ComputedRef<any>
     */
    getProperty(path: JSONPathExpression) {
      return this.getPropertyFromPath(path);
    },
    fetchTaskGraph() {
      const taskOverviewStore = useTaskOverviewStore();
      const tasks = taskOverviewStore.tasks;
      const currentTask = tasks[this.currentTask as AvailableTasks];
      /**
       * Set properites of currentTask via setProperty to include them in the EventLog.
       */
      for (const [key, value] of Object.entries(currentTask)) {
        this.setProperty({
          path: `$.${key}`,
          value: value,
          metadata: { cause: EventCause.Store },
        });
      }
      this.setProperty({
        path: "$.currentNode",
        value: currentTask.rootNode,
        metadata: { cause: EventCause.Store },
      });
    },

    toggleLoading() {
      this.isLoading = !this.isLoading;
    },

    trackMouse(payload: { event: Event; timestamp: number }) {
      this.eventLog.mouseEvents.push(payload);
    },
  },
});
