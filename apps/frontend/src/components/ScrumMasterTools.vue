<script>
export default {
  props: ["hash", "stagedStory"],
  data() {
    return {
      storyPoints: null,
      story: "",
      timerEnabled: false,
      timerSeconds: 60,
    };
  },
  methods: {
    addStory() {
      this.$socketConnect.addStory(this.story, this.hash);
      this.story = "";
    },
    startRound() {
      if (this.$socketConnect.roundStarted) {
        alert("Your Round already started");
      } else if (this.$socketConnect.stagedStory === "") {
        alert("Choose a Story to start a new Round");
      } else {
        this.$socketConnect.startRound(
          this.hash,
          this.timerEnabled,
          this.timerSeconds
        );
      }
    },
    endRound() {
      if (this.$socketConnect.roundStarted && this.storyPoints) {
        this.$socketConnect.endRound(
          this.hash,
          this.storyPoints,
          this.stagedStory
        );
      }
    },
    startDiscussion() {
      if (this.$socketConnect.roundStarted) {
        this.$socketConnect.startDiscussion(this.hash);
      } else {
        alert("First start a Round");
      }
    },
  },
};
</script>

<template>
  <div
    v-if="this.$socketConnect.userRole === 'Scrum Master'"
    class="absolute top-60 m-10 w-full max-w-5xl"
  >
    <div class="flex items-center space-x-4">
      <div class="w-24 text-lg font-semibold whitespace-nowrap">Backlog</div>

      <input
        class="flex-grow placeholder:text-slate-400 text-sm border border-slate-200 rounded-md px-3 py-2"
        type="text"
        placeholder="Story..."
        @change="addStory"
        v-model="story"
      />

      <div class="flex flex-col items-end space-y-1 min-w-[200px]">
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="timerEnabled" />
          <span>Timer aktivieren</span>
        </label>

        <input
          v-if="timerEnabled"
          type="number"
          v-model.number="timerSeconds"
          min="10"
          max="600"
          placeholder="Zeit in Sekunden"
          class="border p-1 rounded w-full"
        />
      </div>

      <div class="flex space-x-2">
        <button
          class="bg-yellow-200 p-2 rounded-2xl text-black whitespace-nowrap"
          @click="startRound"
          title="Start new Game"
        >
          Start new Game
        </button>
        <button
          class="bg-red-400 p-2 rounded-2xl text-black whitespace-nowrap"
          @click="endRound"
          title="End Round"
        >
          End Round
        </button>
        <button
          class="p-2 rounded-2xl bg-gray-400 text-black whitespace-nowrap"
          @click="startDiscussion"
          title="Start Discussion"
        >
          Start Discussion
        </button>
      </div>
    </div>

    <select
      v-if="this.$socketConnect.discussionPhase"
      v-model="this.storyPoints"
      class="w-full mt-4 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow cursor-pointer appearance-none"
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="8">8</option>
      <option value="13">13</option>
    </select>
  </div>
</template>
