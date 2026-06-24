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
      <select :id="`priority-${task.id}`" v-model="priorityModel" class="task-field" required>
        <option disabled value="">Select priority</option>
        <option v-for="option in priorityOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <label :for="`done-${task.id}`">Done?</label>
      <input :id="`done-${task.id}`" v-model="completedModel" type="checkbox" />
    </div>

    <button type="button" class="delete-btn mt-4" @click="emit('delete')">Delete Task</button>
  </article>
</template>

<style scoped>
/* Compact, single-line layout by default */
.task-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.5rem;
  height: 56px;
  overflow: hidden;
  white-space: nowrap;
  flex-wrap: nowrap;
}

.task-card > * {
  margin: 0;
}

.task-card h3 {
  margin: 0;
  font-weight: 700;
  flex: 0 0 120px;
  min-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Inputs inside Task.vue (name + description) */
#taskName,
#taskDescription {
  flex: 1 1 220px;
  min-width: 80px;
  height: 36px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid rgb(203 213 225);
  background: white;
  overflow: hidden;
  text-overflow: ellipsis;
}

#taskName {
  font-size: 16px;
}

.task-field {
  flex: 10 0 140px;
  height: 36px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid rgb(203 213 225);
  background: white;
}

.task-field:focus,
#taskName:focus,
#taskDescription:focus {
  outline: 2px solid rgba(37, 99, 235, 0.25);
  outline-offset: 2px;
}

/* Align the small controls inline */
.task-card > div {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
}

.task-card .mb-1.block.font-medium {
  /* hide only the field labels (Deadline / Priority) while keeping inline control labels visible */
  display: none;
}

.delete-btn {
  border: none;
  border-radius: 0.5rem;
  background-color: #ef4444;
  color: white;
  padding: 6px 8px;
  font-weight: 700;
  cursor: pointer;
  flex: 0 0 auto;
  margin-left: 6px;
}

.delete-btn:hover {
  background-color: #dc2626;
}

/* Responsive behavior */
@media (max-width: 640px) {
  .task-card {
    flex-wrap: wrap;
    align-items: flex-start;
    height: auto;
    white-space: normal;
  }

  /* task name takes ~40% width */
  .task-card h3 {
    flex: 0 0 40%;
    min-width: 40%;
    max-width: 40%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* stack inputs/selects below */
  #taskName,
  #taskDescription {
    flex: 1 1 100%;
    min-width: 100%;
    margin-top: 8px;
  }

  .task-field {
    flex: 1 1 calc(50% - 8px);
    min-width: calc(50% - 8px);
    margin-top: 8px;
  }
}
</style>
