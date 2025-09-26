<script>
export default {
  props: ["hash", "stagedStory"],
  data() {
    return {
      storyPoints: null,
      story: "",
      timerEnabled: false,
      timerMinutesInput: 1,
      timerSecondsInput: 0,
      timerSeconds: 60,
    };
  },

  methods: {
    addStory() {
      if (this.story.trim() === "") {
        this.showToast("Please enter a story", "warning");
        return;
      }
      this.$socketConnect.addStory(this.story, this.hash);
      this.story = "";
      this.showToast("Story added to backlog", "success");
    },
    startRound() {
      if (this.$socketConnect.roundStarted) {
        this.showToast("The round has already started", "warning");
      } else if (!this.$socketConnect.stagedStory) {
        this.showToast("Please select a story first", "warning");
      } else {
        this.$socketConnect.startRound(
          this.hash,
          this.timerEnabled,
          this.timerSeconds
        );
        this.showToast("Round has started", "success");
      }
    },
    endRound() {
      if (!this.storyPoints) {
        this.showToast("Please select story points", "warning");
        return;
      }

      this.$socketConnect.endRound(
        this.hash,
        this.storyPoints,
        this.$socketConnect.stagedStory
      );
      this.storyPoints = null;
      this.showToast("Round has ended", "success");
    },
    startDiscussion() {
      if (this.$socketConnect.roundStarted) {
        this.$socketConnect.startDiscussion(this.hash);
        this.showToast("Discussion has started", "success");
      } else {
        this.showToast("Please start one round first", "warning");
      }
    },
    showToast(message, type = "info") {
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white font-medium z-50 transition-opacity duration-300 ${
        type === "success"
          ? "bg-green-500"
          : type === "warning"
          ? "bg-yellow-500"
          : "bg-blue-500"
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    },
  },
  watch: {
    timerMinutesInput(newVal) {
      this.timerSeconds = newVal * 60 + this.timerSecondsInput;
    },
    timerSecondsInput(newVal) {
      this.timerSeconds = this.timerMinutesInput * 60 + newVal;
    },
    timerSeconds(newVal) {
      this.timerMinutesInput = Math.floor(newVal / 60);
      this.timerSecondsInput = newVal % 60;
    },
  },
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
    <h2 class="text-lg font-bold text-green-800 mb-3 text-center">
      Scrum Master Tools
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-green-600"
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
          Backlog
        </h3>

        <div class="flex space-x-2">
          <input
            class="flex-grow placeholder:text-black text-black text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
            type="text"
            placeholder="Neue Story hinzufügen..."
            v-model="story"
            @keyup.enter="addStory"
            :class="
              story
                ? 'bg-green-100 border-green-400'
                : 'bg-white border-gray-300'
            "
          />

          <button
            @click="addStory"
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap min-w-[80px]"
            title="Story hinzufügen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Timer
        </h3>
        <div class="flex items-center space-x-2 mb-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="timerEnabled"
              class="sr-only peer"
            />
            <div
              class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"
            ></div>
          </label>
          <span class="text-xs font-medium text-gray-700">Activate</span>

          <input
            v-if="timerEnabled"
            type="number"
            v-model.number="timerMinutesInput"
            min="0"
            max="60"
            placeholder="Min"
            class="flex-grow placeholder:text-black text-black text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
          />

          <span v-if="timerEnabled" class="text-xs font-medium">:</span>

          <input
            v-if="timerEnabled"
            type="number"
            v-model.number="timerSecondsInput"
            min="0"
            max="59"
            step="5"
            placeholder="Sek"
            class="flex-grow placeholder:text-black text-black text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div v-if="timerEnabled" class="flex items-center space-x-2">
          <input
            type="range"
            v-model.number="timerSeconds"
            min="30"
            max="300"
            step="30"
            class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span
            class="text-xs font-medium text-green-700 min-w-[40px] text-center bg-green-50 px-1 py-0.5 rounded"
            >{{ Math.floor(timerSeconds / 60) }}:{{
              (timerSeconds % 60).toString().padStart(2, "0")
            }}</span
          >
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-2 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
        Roundcontroller
      </h3>

      <div class="flex flex-wrap gap-2 justify-center">
        <button
          @click="startRound"
          :disabled="$socketConnect.roundStarted"
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center min-w-[100px] justify-center"
          title="Neue Runde starten"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Start
        </button>

        <button
          @click="startDiscussion"
          :disabled="!$socketConnect.roundStarted"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center min-w-[100px] justify-center"
          title="Diskussion starten"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Discussion
        </button>

        <button
          @click="endRound"
          :disabled="!$socketConnect.roundStarted"
          class="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center min-w-[100px] justify-center"
          title="Runde beenden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
          Finish
        </button>
      </div>
    </div>

    <div
      v-if="this.$socketConnect.discussionPhase"
      class="mt-4 pt-3 border-t border-gray-200"
    >
      <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-2 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        Story Points
      </h3>

      <div class="grid grid-cols-3 md:grid-cols-6 gap-1 mb-3">
        <button
          v-for="point in [1, 2, 3, 5, 8, 13]"
          :key="point"
          @click="storyPoints = point"
          :class="[
            'py-2 px-2 rounded-lg font-bold transition-all duration-200 border text-xs',
            storyPoints === point
              ? 'bg-green-500 text-white border-green-600 scale-105 shadow-md'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:scale-102',
          ]"
        >
          {{ point }}
        </button>
      </div>

      <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
        <span class="font-medium">Aktuelle Story:</span>
        <span class="text-green-700 font-semibold ml-1">{{
          stagedStory?.name || "Keine Story ausgewählt"
        }}</span>
      </div>
    </div>
  </div>
</template>
