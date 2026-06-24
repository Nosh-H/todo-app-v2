<script setup>
import TaskCard from './components/TaskCard.vue'
import { ref, computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

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

// Dark mode
const { isDark, toggleDark } = useDarkMode()
const fileInput = ref(null)

function triggerFileSelect() {
  if (fileInput.value) fileInput.value.click()
}

// Function to let user download task data as a JSON file
function saveFile() {
  // Convert data into JSON
  const data = JSON.stringify(tasks.value)

  // Save to file using Blob - https://stackoverflow.com/questions/48611671/vue-js-write-json-object-to-local-file
  const blob = new Blob([data], { type: 'text/plain' })
  const e = document.createEvent('MouseEvents'),
    a = document.createElement('a')
  a.download = 'test.json'
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

// Function to let user upload task(s) from a JSON file
function uploadTasks() {
  // Accept the FileList from the event (or from the `fileInput` ref).
  // The previous implementation treated `event.target.files[0]` as a FileList
  // and then inspected `.length` on it which is incorrect. Here we use
  // `event.target.files` (a FileList) and guard for its existence.
  const fileList = event?.target?.files ?? fileInput.value?.files
  if (!fileList || fileList.length === 0) return false

  // Grab the first selected file. This is a File object and must be
  // read asynchronously with a FileReader. A key bug before was trying
  // to read `fr.result` synchronously immediately after calling
  // `readAsText` — `FileReader` works via events/callbacks.
  const file = fileList[0]
  const fr = new FileReader()

  // `onload` fires once the file has been read. Do all parsing and
  // normalization inside this handler to ensure the data is available.
  fr.onload = (e) => {
    try {
      // Parse the uploaded file text as JSON. This can be either:
      //  - an array of tasks: [{...}, {...}]
      //  - a single task object: {...}
      //  - an envelope object with a `tasks` array: { tasks: [...] }
      // The previous code attempted to parse `fr.result` outside the
      // `onload` handler which meant `fr.result` was not yet set.
      const raw = JSON.parse(e.target.result)

      // Normalize the incoming shape into an array of task-like values
      // so the rest of the app can handle them uniformly.
      let parsedTasks
      if (Array.isArray(raw)) {
        parsedTasks = raw
      } else if (raw && typeof raw === 'object') {
        // Accept both `{ tasks: [...] }` and a single-task object
        if (Array.isArray(raw.tasks)) parsedTasks = raw.tasks
        else parsedTasks = [raw]
      } else {
        // Give a clear message to the user if the JSON is not usable.
        document.getElementById('result').innerText = 'Uploaded JSON is not an array or object.'
        return
      }

      // Convert each incoming item to the app's canonical task shape
      // using `normalizeTask`, then sort and append to the existing list.
      // Note: the original code used `foreach` (misspelled) which failed
      // silently; we use the correct `forEach` here.
      const normalizedTasks = parsedTasks.map(normalizeTask)
      normalizedTasks.sort((a, b) => Number(b.completed) - Number(a.completed))
      normalizedTasks.forEach((task) => {
        tasks.value.push(task)
      })

      // Show the normalized tasks to the user for confirmation.
      document.getElementById('result').innerText = "Upload good."
    } catch (err) {
      // Surface parsing errors to the user so they can correct the file.
      document.getElementById('result').innerText = `Error parsing JSON: ${err?.message ?? err}`
    }
  }

  // Kick off the asynchronous read. All work continues in `onload`.
  fr.readAsText(file)
}
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
      <button class="pill" @click="triggerFileSelect" id="import">Import JSON:
        <input
          type="file"
          id="selectfiles"
          @change="uploadTasks"
          ref="fileInput"
          name="Add from JSON"
        >
      </button>
      <pre id="result"></pre>

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
      <button class="pill" @click="saveFile">Download</button>

      <!--Dark Mode-->
      <div class="mt-3 flex items-center gap-2 pill">
        <label :for="dark - mode">Dark Mode?</label>
        <input :id="dark - mode" @click="toggleDark" type="checkbox" />
      </div>
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
