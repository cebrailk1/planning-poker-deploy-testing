<script>
export default {
  props: ["hash"],
  emits: ["stage-story"],
  data() {
    return {
      story: "",
    };
  },
  methods: {
    addStory() {
      this.$socketConnect.addStory(this.story, this.hash);
      this.story = "";
    },
    stageStory(story) {
      if (this.$socketConnect.roundStarted) {
        alert("Cant stage a story in an on going round");
      } else {
        this.$emit("stage-story", story);
      }
    },
  },
  computed: {
    storyList() {
      return this.$socketConnect.storyList;
    },
    currentStagedStory() {
      return this.$socketConnect.stagedStory || {};
    },
  },
};
</script>

<template>
  <div
    class="absolute left-4"
    :style="{
      top: $socketConnect.userRole === 'Scrum Master' ? '550px' : '320px',
    }"
  >
    <div
      v-if="this.$socketConnect.userRole === 'Scrum Master'"
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Backlog Stories
      </h3>

      <div class="space-y-2">
        <div v-for="story in storyList" :key="story.name" class="story-item">
          <div
            v-if="story.points !== null"
            @click="stageStory(story)"
            class="cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-green-800 border border-green-700"
            :class="{
              'bg-blue-600 border-blue-500 text-white':
                story.name === currentStagedStory.name,
              'bg-green-800 text-green-100':
                story.name !== currentStagedStory.name,
            }"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1 text-sm font-medium">{{ story.name }}</span>
              <div class="flex items-center space-x-2">
                <span
                  class="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
                  >{{ story.points }} Punkte</span
                >
                <span class="text-green-400">✅</span>
              </div>
            </div>
          </div>

          <div
            v-else
            @click="stageStory(story)"
            class="cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-green-800 border border-green-700"
            :class="{
              'bg-blue-600 border-blue-500 text-white':
                story.name === currentStagedStory.name,
              'bg-green-800 text-green-100':
                story.name !== currentStagedStory.name,
            }"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1 text-sm font-medium">{{ story.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="storyList.length === 0" class="text-center py-4 text-gray-300">
        <p class="text-sm">Keine Stories im Backlog</p>
      </div>
    </div>

    <div
      v-else
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Backlog Stories
      </h3>

      <div class="space-y-2">
        <div v-for="story in storyList" :key="story.name" class="story-item">
          <div
            class="p-3 rounded-lg border border-green-700"
            :class="{
              'bg-blue-600 border-blue-500 text-white':
                story.name === currentStagedStory.name,
              'bg-green-800 text-green-100':
                story.name !== currentStagedStory.name,
            }"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1 text-sm font-medium">{{ story.name }}</span>
              <span
                v-if="story.points !== null"
                class="text-xs bg-green-500 text-white px-2 py-1 rounded-full"
              >
                {{ story.points }} Punkte ✅
              </span>
              <span v-else class="text-yellow-400 text-xs">Nicht bewertet</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="storyList.length === 0" class="text-center py-4 text-gray-300">
        <p class="text-sm">Keine Stories im Backlog</p>
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
