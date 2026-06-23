<script setup>
import Task from './components/Task.vue'
import { ref, computed } from 'vue'

const priorityOptions = ['Critical', 'High', 'Medium', 'Low', 'Optional']

function generateTaskId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createTask(overrides = {}) {
  const { id, ...rest } = overrides

  return {
    id: id ?? generateTaskId(),
    name: '',
    description: '',
    deadline: '',
    priority: '',
    completed: false,
    ...rest,
  }
}

function normalizeTask(task) {
  if (Array.isArray(task)) {
    return createTask({
      name: task[0] ?? '',
      description: task[1] ?? '',
      deadline: task[2] ?? '',
      priority: task[3] ?? '',
      completed: Boolean(task[4]),
    })
  }

  if (task && typeof task === 'object') {
    return createTask({
      id: typeof task.id === 'string' && task.id.trim() ? task.id : undefined,
      name: typeof task.name === 'string' ? task.name : '',
      description: typeof task.description === 'string' ? task.description : '',
      deadline: typeof task.deadline === 'string' ? task.deadline : '',
      priority: typeof task.priority === 'string' ? task.priority : '',
      completed: Boolean(task.completed),
    })
  }

  return createTask()
}

function loadTasks() {
  const rawTasks = localStorage.getItem('tasks')

  if (rawTasks === null) {
    return [createTask()]
  }

  try {
    const parsedTasks = JSON.parse(rawTasks)

    if (!Array.isArray(parsedTasks)) {
      return [createTask()]
    }

    const normalizedTasks = parsedTasks.map(normalizeTask)
    normalizedTasks.sort((a, b) => Number(b.completed) - Number(a.completed))
    return normalizedTasks
  } catch {
    return [createTask()]
  }
}

const tasks = ref(loadTasks())

// Helpers to parse YYYY-MM-DD into a local Date at midnight.
// We parse into a local Date using `new Date(year, month-1, day)` to avoid
// timezone offsets that can occur when using `new Date('YYYY-MM-DD')`.
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
    priorityOptions.includes(task.priority)
  )
}

// Determines styling of task border based on completion status
function getTaskBorderClass(task) {
  if (!isTaskValid(task)) return 'border-amber-500'
  return task.completed ? 'border-green-500' : 'border-red-500'
}

// Number of tasks marked completed / incomplete.
// These are `computed` so the template updates reactively when `tasks` change.
const completedCount = computed(() => tasks.value.filter((t) => t.completed).length)
const incompleteCount = computed(() => tasks.value.length - completedCount.value)
const invalidTaskCount = computed(() => tasks.value.filter((task) => !isTaskValid(task)).length)
const canSaveAll = computed(() => invalidTaskCount.value === 0)

// Count tasks whose deadline is today (local date).
// The `reduce` uses `acc` (accumulator) as the running count of matching tasks;
// it starts from 0 and is incremented when a task's date matches the target.
const dueTodayCount = computed(() => {
  const now = new Date()
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t.deadline)
    if (!d) return acc
    if (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    ) {
      // `acc + 1` increments the running total when this task is due today
      return acc + 1
    }
    return acc
  }, 0)
})

// Count tasks whose deadline is exactly tomorrow (local date).
// `acc` is the running count passed through each reduce iteration.
const dueTomorrowCount = computed(() => {
  const now = new Date()
  const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t.deadline)
    if (!d) return acc
    if (
      d.getFullYear() === tmr.getFullYear() &&
      d.getMonth() === tmr.getMonth() &&
      d.getDate() === tmr.getDate()
    ) {
      // increment accumulator when deadline matches tomorrow
      return acc + 1
    }
    return acc
  }, 0)
})

// Count tasks due within the next 7 days (including today).
// Uses local-midnight comparisons to avoid timezone-related off-by-one issues.
// `acc` is the running count; it begins at 0 and increments for each matching task.
const dueNextWeekCount = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // today at local midnight
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // 7-day window including today
  return tasks.value.reduce((acc, t) => {
    const d = toLocalDate(t.deadline)
    if (!d) return acc
    const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (dMid >= start && dMid <= end) return acc + 1
    return acc
  }, 0)
})

// Functions for user button tools
function addTask() {
  tasks.value.push(createTask())
}

function deleteTask(taskId) {
  const taskIndex = tasks.value.findIndex((task) => task.id === taskId)
  if (taskIndex !== -1) {
    tasks.value.splice(taskIndex, 1)
  }
}

function updateTaskName(taskId, newName) {
  const task = tasks.value.find((entry) => entry.id === taskId)
  if (task) {
    task.name = newName
  }
}

function updateTaskDescription(taskId, newDescription) {
  const task = tasks.value.find((entry) => entry.id === taskId)
  if (task) {
    task.description = newDescription
  }
}

function saveTasks() {
  if (!canSaveAll.value) return
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

function sortByCompletion() {
  tasks.value.sort((a, b) => Number(b.completed) - Number(a.completed))
}

function sortByDeadline() {
  const deadlineTime = (deadline) => {
    const parsed = toLocalDate(deadline)
    return parsed ? parsed.getTime() : Number.POSITIVE_INFINITY
  }

  tasks.value.sort((a, b) => deadlineTime(a.deadline) - deadlineTime(b.deadline))
}

function sortAlphabetically() {
  tasks.value.sort((a, b) => a.name.localeCompare(b.name))
}

function sortByPriority() {
  const priorityRank = (priority) => {
    const rank = priorityOptions.indexOf(priority)
    return rank === -1 ? priorityOptions.length : rank
  }

  tasks.value.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
}

function clearAll() {
  tasks.value = []
}

// Stores the current filter. 'all' means to show every task.
const activeFilter = ref('all')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

function isVisibleTask(task) {
  if (activeFilter.value === 'active') return !task.completed
  if (activeFilter.value === 'completed') return task.completed
  return true
}

const filteredTasks = computed(() => {
  return tasks.value.filter(isVisibleTask)
})

function getFilterButtonClass(option) {
  return option === activeFilter.value ? 'filter-pill filter-pill--active' : 'filter-pill'
}

function getTaskStatusLabel(task) {
  return task.completed ? 'Finished task' : 'Unfinished task'
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <p class="app-eyebrow">Task manager</p>
      <h1 class="app-title">Plan, prioritize, and finish your day with less friction</h1>
      <p class="app-description">
        Create tasks, add deadlines and priority levels, then sort everything to match how you want
        to work.
      </p>
    </header>

    <div id="summary" class="summary">
      <p class="app-eyebrow">Summary</p>
      <p class="bullet">Completed: {{ completedCount }}</p>
      <p class="bullet">Not finished yet: {{ incompleteCount }}</p>
      <p class="bullet">Due today: {{ dueTodayCount }}</p>
      <p class="bullet">Due tomorrow: {{ dueTomorrowCount }}</p>
      <p class="bullet">Due this week: {{ dueNextWeekCount }}</p>
    </div>

    <div id="menu" class="toolbar">
      <button @click="addTask">Add new task</button>
      <button @click="saveTasks" :disabled="!canSaveAll">Save All</button>
      <button @click="sortByCompletion">Sort by completion</button>
      <button @click="sortByDeadline">Sort by deadline</button>
      <button @click="sortAlphabetically">Sort alphabetically</button>
      <button @click="sortByPriority">Sort by priority</button>
      <button @click="clearAll">Clear All</button>
    </div>

    <section class="filter-bar" aria-label="Task filters">
      <p class="app-eyebrow">Filter</p>
      <div class="filter-group">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          :class="getFilterButtonClass(option.value)"
          :aria-pressed="activeFilter === option.value"
          @click="activeFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <p v-if="!canSaveAll" class="validation-note" role="status">
      Fill in the task name, deadline, and priority for every task before saving.
    </p>

    <div v-if="filteredTasks.length === 0" class="summary">
      <p class="bullet">No tasks match this filter.</p>
    </div>

    <div v-else class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card bg-white shadow-md rounded-lg p-4 w-full box-border border-2"
        :class="getTaskBorderClass(task)"
      >
        <h3 :class="task.completed ? 'text-green-600' : 'text-red-600'" class="font-bold mb-2">
          {{ getTaskStatusLabel(task) }}
        </h3>

        <Task
          :taskName="task.name"
          @update:taskName="(newName) => updateTaskName(task.id, newName)"
          :taskDescription="task.description"
          @update:taskDescription="(newDesc) => updateTaskDescription(task.id, newDesc)"
        />

        <div>
          <label style="display: inline-block">Deadline:</label>
          <input type="date" v-model="task.deadline" required />
        </div>

        <div>
          <label style="display: inline-block">Priority:</label>
          <select v-model="task.priority" required>
            <option disabled value="">Select priority</option>
            <option v-for="option in priorityOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div style="display: inline-block">
          <input type="checkbox" :id="`done-${task.id}`" v-model="task.completed" />
          <label :for="`done-${task.id}`">Mark as Done</label>
        </div>

        <br />
        <button @click="deleteTask(task.id)" class="delete-btn">Delete Task</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
input {
  display: block;
  margin: 5px 0;
}

.delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  margin-top: 10px;
}

button {
  margin: 10px 0;
  padding: 10px 15px;
  cursor: pointer;
}

.toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

.validation-note {
  margin: -12px 0 24px;
  color: #b45309;
  font-weight: 600;
}

</style>
