<script>
export default {
  data() {
    return {};
  },
  computed: {
    doneList() {
      return this.$socketConnect.discussedStories || [];
    },
  },
};
</script>

<template>
  <div
    class="absolute right-4"
    :style="{
      top: $socketConnect.userRole === 'Scrum Master' ? '550px' : '320px',
    }"
  >
    <div
      class="w-80 border-2 border-solid p-4 rounded-xl shadow-lg bg-opacity-90 bg-green-900 border-yellow-200 max-h-64 overflow-y-auto"
    >
      <h3 class="text-lg font-bold text-yellow-300 mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        Done Stories
      </h3>

      <div class="space-y-2">
        <div v-for="story in doneList" :key="story.name" class="story-item">
          <div
            class="p-3 rounded-lg transition-all duration-200 border border-green-700 bg-green-800 text-green-100"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1 text-sm font-medium">{{ story.name }}</span>
              <div class="flex items-center space-x-2">
                <span
                  class="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
                  >{{ story.points }} Points</span
                >
                <span class="text-green-400">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="doneList.length === 0" class="text-center py-4 text-gray-300">
        <p class="text-sm">No done stories</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-item {
  transition: all 0.2s ease-in-out;
}

.story-item:hover {
  transform: translateY(-1px);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
