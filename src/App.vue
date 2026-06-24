<script setup>
import TaskCard from './components/TaskCard.vue'
import { ref, computed } from 'vue'

const priorityOptions = ['Critical', 'High', 'Medium', 'Low', 'Optional']
const sortOptions = [
  { value: 'completion', label: 'Completion' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'priority', label: 'Priority' },
]

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

function updateTaskDeadline(taskId, newDeadline) {
  const task = tasks.value.find((entry) => entry.id === taskId)
  if (task) {
    task.deadline = newDeadline
  }
}

function updateTaskPriority(taskId, newPriority) {
  const task = tasks.value.find((entry) => entry.id === taskId)
  if (task) {
    task.priority = newPriority
  }
}

function updateTaskCompleted(taskId, isCompleted) {
  const task = tasks.value.find((entry) => entry.id === taskId)
  if (task) {
    task.completed = isCompleted
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

const selectedSort = ref('')

function handleSortChange() {
  if (selectedSort.value === 'completion') {
    sortByCompletion()
  } else if (selectedSort.value === 'deadline') {
    sortByDeadline()
  } else if (selectedSort.value === 'alphabetical') {
    sortAlphabetically()
  } else if (selectedSort.value === 'priority') {
    sortByPriority()
  }
}

const selectedFilter = ref('all')

function handleFilterChange() {
  activeFilter.value = selectedFilter.value
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

</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <p class="app-eyebrow" id="top-title">Task manager</p>
      <h1 class="app-title">Plan, prioritize, and finish your day with less friction</h1>
      <p class="app-description">
        Create tasks, add deadlines and priority levels, then sort everything to match how you want
        to work.
      </p>
    </header>

    <div id="summary" class="summary">
      <p class="app-eyebrow" id="summary-title">Summary</p>
      <p class="bullet">Completed: {{ completedCount }}</p>
      <p class="bullet">Not finished yet: {{ incompleteCount }}</p>
      <p class="bullet">Due today: {{ dueTodayCount }}</p>
      <p class="bullet">Due tomorrow: {{ dueTomorrowCount }}</p>
      <p class="bullet">Due this week: {{ dueNextWeekCount }}</p>
    </div>

    <div id="menu" class="toolbar">
      <button class="pill" @click="addTask">Add new task</button>

      <label class="sort-control">
        <span class="sort-control__label">Sort by</span>
        <select v-model="selectedSort" class="sort-select" @change="handleSortChange">
          <option value="" disabled>Choose a sort</option>
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="sort-control">
        <span class="sort-control__label">Filter by</span>
        <select v-model="selectedFilter" class="sort-select" @change="handleFilterChange">
          <option value="" disabled>Choose a filter</option>
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <button class="pill" @click="saveTasks" :disabled="!canSaveAll">Save All</button>
      <button class="pill" @click="clearAll">Clear All</button>
    </div>

    <p v-if="!canSaveAll" class="validation-note" role="status">
      Fill in the task name, deadline, and priority for every task before saving.
    </p>

    <div v-if="filteredTasks.length === 0" class="summary">
      <p class="bullet">No tasks match this filter.</p>
    </div>

    <div v-else class="task-list">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        :priority-options="priorityOptions"
        @update:taskName="(newName) => updateTaskName(task.id, newName)"
        @update:taskDescription="(newDesc) => updateTaskDescription(task.id, newDesc)"
        @update:deadline="(newDeadline) => updateTaskDeadline(task.id, newDeadline)"
        @update:priority="(newPriority) => updateTaskPriority(task.id, newPriority)"
        @update:completed="(isCompleted) => updateTaskCompleted(task.id, isCompleted)"
        @delete="deleteTask(task.id)"
      />
    </div>
  </main>
</template>

<style scoped>
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
