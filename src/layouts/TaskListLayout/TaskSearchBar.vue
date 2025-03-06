<template>
  <div class="taskSearchBar">
    <q-input :modelValue="''" filled type="search" :label="searchLabelString">
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-select
      filled
      :modelValue="''"
      use-input
      input-debounce="0"
      :label="categoryFilterLabelString"
      :options="options"
      @filter="filterTasks('category')"
      style="width: 250px"
      behavior="menu"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- <div
      class="customFilter"
      v-for="filter in props.filters"
      :key="filter.label"
    >
      <q-select
        filled
        :modelValue="''"
        use-input
        input-debounce="0"
        :label="filter.label"
        :options="options"
        @filter="filterTasks(filter.filterAttribute)"
        style="width: 250px"
        behavior="menu"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

export interface TaskFilter {
  label: string;
  filterAttribute: string;
}
export interface TaskGridSearchBarProps {
  filters: Array<TaskFilter>;
}

// const props = defineProps<TaskGridSearchBarProps>();

const { t } = useI18n();
const searchLabelString = computed(() => t("taskGridSearch"));
const categoryFilterLabelString = computed(() => t("taskGridFilter"));

const options = [""];
// TODO: Implement filterTasks function
const filterTasks = (filterAttribute: string) => (inputValue: string) => {
  console.log(filterAttribute, inputValue);
};
</script>

<style scoped>
.taskSearchBar {
  display: flex;
  min-height: 100px;
  width: 100%;
  padding: 0 16px;
  margin-bottom: 16px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  align-items: center;
}

.taskSearchBar > * {
  margin-right: 50px;
}
</style>
