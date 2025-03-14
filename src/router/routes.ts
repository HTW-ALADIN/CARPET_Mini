import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("pages/IndexPage.vue"),
  },
  {
    path: "/tasks",
    component: () => import("pages/TaskOverview.vue"),
  },
  {
    path: "/task/:taskName/:logId?",
    name: "Task",

    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "task" */ "pages/TaskPage.vue"),
  },
  {
    path: "/workedTasks",
    component: () => import("pages/WorkedTaskOverview.vue"),
  },
  {
    path: "/workedTask/:id",
    name: "WorkedTask",

    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "workedTask" */ "pages/ReplayPage.vue"),
  },
  {
    path: "/settings",
    component: () => import("pages/Settings.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
