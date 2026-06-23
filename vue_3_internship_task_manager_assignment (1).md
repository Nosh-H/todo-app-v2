# Vue 3 Internship Task Manager App

## Project Description

Using **Vue 3** and **Tailwind CSS**, build a task manager application that allows users to create and manage tasks.

The app should use **JavaScript**, along with the **Composition API** and **`<script setup>`**. Styling should be done with **Tailwind CSS**. Task data should persist across page reloads using **localStorage**.

The project should be version controlled with Git and submitted as a public GitHub repository.

---

## Getting Started

This project is intended for someone who may be building their first web app. Start by getting a basic Vue app running before adding task functionality.

### 1. Install the required tools

Before starting, make sure the following are installed:

- Node.js
- npm
- Git
- A code editor, such as Visual Studio Code

You can confirm Node, npm, and Git are installed by running:

```bash
node -v
npm -v
git --version
```

### 2. Create the Vue project

Create a new Vue 3 project using the official Vue project setup tool:

```bash
npm create vue@latest
```

When prompted, choose options that make sense for this project. Use **JavaScript**, not TypeScript.

After the project is created, move into the project folder:

```bash
cd your-project-name
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal to confirm the app is running.

### 3. Set up Tailwind CSS

Install and configure Tailwind CSS for the Vue project. Follow the official Tailwind CSS installation instructions for Vue/Vite.

After setup, confirm Tailwind is working by applying a few utility classes to the starter page.

### 4. Clean up the starter app

Before building the task manager, remove any starter content that is not needed.

Create a simple starting page with:

- A heading for the app.
- A short description.
- A placeholder area where the task list will go.

At this point, the app should still run without errors.

### 5. Initialize Git

If Git was not already initialized during project setup, initialize it:

```bash
git init
```

Create the first commit after the app is running and the starter files have been cleaned up.

### 6. Create a GitHub repository

Create a new public repository on GitHub, then connect the local project to that repository.

After connecting the repo, push the project to GitHub.

### 7. Work in phases

Build the app one phase at a time. Each phase should be committed separately so progress can be reviewed and tested.

Do not wait until the end to make one large commit.

---

## Required Functionality

Users should be able to:

- Add a new task.
- Edit an existing task.
- Mark a task as complete or incomplete.
- Delete a task.
- View saved tasks when the page is first loaded or reloaded.

Each task should include enough information to be useful to a user. At minimum, a task should have a title and completion status.

---

## Additional Features

In addition to the basic task actions, the app should include:

- A way to search or filter tasks.
- A way to organize tasks by priority, due date, status, or another useful field.
- A small summary showing the current state of the task list, such as total tasks, completed tasks, and remaining tasks.
- Basic input validation so users cannot save incomplete or invalid tasks.
- At least one bulk action, such as clearing completed tasks or marking all tasks complete.

The exact design and implementation of these features is up to you.

---

## Persistence

Tasks must persist across page reloads using **localStorage**.

The app should handle normal page reloads without losing user data.

---

## User Experience Expectations

The app should be clear and easy to use.

Please consider:

- What the user sees when there are no tasks.
- How completed tasks are visually different from active tasks.
- How the app works on both desktop and mobile screen sizes.
- How destructive actions, such as deleting tasks, should be handled.
- Whether the app is understandable without extra instructions.

---

## Technical Requirements

The app must use:

- Vue 3
- JavaScript
- Composition API
- `<script setup>`
- Tailwind CSS
- localStorage
- Git

You may choose how to structure the project, components, and state management. The following structure is recommended as a starting point:

```text
src/
  components/
    TaskForm.vue
    TaskList.vue
    TaskItem.vue
    TaskFilters.vue
    TaskSummary.vue
  App.vue
```

You may add, remove, or rename files if your implementation calls for it, but the project should still be organized in a way that is easy to understand and review.

---

## Stretch Goals

Optional additions for interns who finish early:

- Dark mode
- Drag-and-drop task reordering
- Categories or tags
- JSON export/import
- Automated tests
- Pinia for state management
- Vue Router with separate task views

---

## Evaluation Criteria

The project will be evaluated based on:

- Whether the required functionality works correctly.
- How well the app uses Vue 3, JavaScript, and `<script setup>`.
- How effectively Tailwind CSS is used for layout and styling.
- Whether task data persists after a reload.
- Code organization and readability.
- User experience and visual polish.
- Handling of edge cases.
- Git usage and commit history.
- Quality of the README.

---

## Development Phases

The project should be completed in phases. Each phase should be committed separately so the reviewer can inspect the Git history, test progress incrementally, and understand how the app evolved.

Each phase should result in a working version of the app. Avoid committing large groups of unrelated changes together.

### Phase 1: Project Setup

Set up the Vue 3 project and confirm the app runs locally.

This phase should include:

- Initial Vue 3 project setup.
- Basic cleanup of starter files.
- A simple starting layout for the app.
- README setup instructions.


### Phase 2: Basic Task Creation and Display

Add the ability to create tasks and display them in a list.

This phase should include:

- A form for adding tasks.
- Displaying added tasks on the page.
- Basic empty state when no tasks exist.


### Phase 3: Complete and Delete Tasks

Add core task actions.

This phase should include:

- Marking tasks complete or incomplete.
- Deleting individual tasks.
- Visual difference between completed and active tasks.


### Phase 4: Edit Tasks

Add the ability to update existing tasks.

This phase should include:

- Editing an existing task.
- Saving changes.
- Canceling an edit without changing the task.


### Phase 5: localStorage Persistence

Add persistent storage using localStorage.

This phase should include:

- Saving tasks to localStorage.
- Loading saved tasks when the app starts.
- Confirming tasks remain after a page reload.


### Phase 6: Search, Filter, or Organization Feature

Add a way for users to find or organize tasks.

This phase should include at least one of the following:

- Search
- Filtering
- Sorting
- Priority
- Due dates
- Categories or tags


### Phase 7: Summary and Bulk Action

Add a small summary and at least one bulk action.

This phase should include:

- A summary of the current task list.
- At least one bulk action, such as clearing completed tasks or marking all tasks complete.


### Phase 8: Polish and Final Review

Improve the user experience and prepare the project for submission.

This phase should include:

- Responsive layout improvements.
- User-friendly validation messages.
- Final README updates.
- General cleanup and polish.


---

## Submission Requirements

Submit:

- A public GitHub repository link.
- A `README.md` with setup instructions and a brief description of the app.

---

## Completion Criteria

The project is considered complete when:

- The required features are implemented.
- Tasks persist after reloading the page.
- The app uses Vue 3 with JavaScript and `<script setup>`.
- The app uses Tailwind CSS for styling.
- The project can be installed and run using the README instructions.
- The code is available in a public GitHub repository.

