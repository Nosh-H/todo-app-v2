// composables/useDarkMode.js
import { ref, onMounted } from 'vue';

export function useDarkMode() {
  const isDark = ref(false);

  const toggleDark = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('dark', isDark.value);
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  };

  onMounted(() => {
    // 1. Check local storage first
    const savedTheme = localStorage.getItem('theme');

    // 2. Check system preference if no saved theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDark.value = false;
      document.documentElement.classList.remove('dark');
    }
  });

  return {
    isDark,
    toggleDark
  };
}
