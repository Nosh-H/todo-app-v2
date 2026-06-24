<script setup>
import { computed } from 'vue'
import Task from './Task.vue'

defineOptions({
  name: 'TaskCard',
})

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  priorityOptions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'update:taskName',
  'update:taskDescription',
  'update:deadline',
  'update:priority',
  'update:completed',
  'delete',
])

function toLocalDate(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function isTaskValid(task) {
  return (
    typeof task.name === 'string' &&
    task.name.trim().length > 0 &&
    toLocalDate(task.deadline) !== null &&
    props.priorityOptions.includes(task.priority)
  )
}

const taskBorderClass = computed(() => {
  if (!isTaskValid(props.task)) return 'border-amber-500'
  return props.task.completed ? 'border-green-500' : 'border-red-500'
})

const taskStatusClass = computed(() => {
  return props.task.completed ? 'text-green-600' : 'text-red-600'
})

const taskStatusLabel = computed(() => {
  return props.task.completed ? 'Finished task' : 'Unfinished task'
})

const deadlineModel = computed({
  get: () => props.task.deadline,
  set: (value) => emit('update:deadline', value),
})

const priorityModel = computed({
  get: () => props.task.priority,
  set: (value) => emit('update:priority', value),
})

const completedModel = computed({
  get: () => props.task.completed,
  set: (value) => emit('update:completed', value),
})
</script>

<template>
  <article
    class="task-card w-full box-border rounded-lg border-2 bg-white p-4 shadow-md"
    :class="taskBorderClass"
  >
    <h3 class="mb-2 font-bold" :class="taskStatusClass">
      {{ taskStatusLabel }}
    </h3>

    <Task
      :taskName="task.name"
      :taskDescription="task.description"
      @update:taskName="(newName) => emit('update:taskName', newName)"
      @update:taskDescription="(newDescription) => emit('update:taskDescription', newDescription)"
    />

    <div class="mt-3">
      <label class="mb-1 block font-medium" :for="`deadline-${task.id}`">Deadline</label>
      <input
        :id="`deadline-${task.id}`"
        v-model="deadlineModel"
        class="task-field"
        type="date"
        required
      />
    </div>

    <div class="mt-3">
      <label class="mb-1 block font-medium" :for="`priority-${task.id}`">Priority</label>
      <select
        :id="`priority-${task.id}`"
        v-model="priorityModel"
        class="task-field"
        required
      >
        <option disabled value="">Select priority</option>
        <option v-for="option in priorityOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <input :id="`done-${task.id}`" v-model="completedModel" type="checkbox" />
      <label :for="`done-${task.id}`">Mark as Done</label>
    </div>

    <button type="button" class="delete-btn mt-4" @click="emit('delete')">
      Delete Task
    </button>
  </article>
</template>

<style scoped>
.task-field {
  display: block;
  width: 100%;
  max-width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgb(203 213 225);
  padding: 0.625rem 0.75rem;
  background: white;
}

.task-field:focus {
  outline: 2px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

.delete-btn {
  border: none;
  border-radius: 0.5rem;
  background-color: #ef4444;
  color: white;
  padding: 0.625rem 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #dc2626;
}
</style>
