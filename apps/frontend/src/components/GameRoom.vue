<script>
import DoneStories from "./DoneStories.vue";
import GameCards from "./GameCards.vue";
import OpponentCard from "./OpponentCard.vue";
import ScrumMasterTools from "./ScrumMasterTools.vue";
import StoryBoard from "./StoryBoard.vue";
import UserList from "./UserList.vue";
import RoomInfoPanel from "./RoomInfoPanel.vue";

export default {
  props: { hash: String },
  components: {
    GameCards,
    OpponentCard,
    StoryBoard,
    DoneStories,
    ScrumMasterTools,
    UserList,
    RoomInfoPanel,
  },
  data() {
    return {
      hasUsername: false,
      username: "",
      existingUser: null,
      stagedStory: null,
      wantsVisitor: false,
      copySuccess: false,
    };
  },
  methods: {
    getUsernameForRoom() {
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));

      if (savedRooms && savedRooms[this.hash]) {
        this.existingUser = savedRooms[this.hash];
        this.$socketConnect.rejoin(this.existingUser, this.hash);
        this.hasUsername = true;
      }
    },
    UserJoinRoom() {
      this.$socketConnect.joinRoom(
        this.hash,
        this.username,
        this.wantsVisitor,
        (response) => {
          if (response.error === "user-exists") {
            alert("Dieser Benutzername existiert bereits im Raum!");
            return;
          }

          localStorage.setItem(
            "rooms",
            JSON.stringify({ [this.hash]: this.username, createdRoom: false })
          );
          this.existingUser = this.username;
          this.hasUsername = true;
        }
      );
    },
    setCard(card) {
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      this.$socketConnect.setCard(card, savedRooms[this.hash], this.hash);
    },
    setStageStory(story) {
      this.stagedStory = story;
      this.$socketConnect.stageStory(story.name, this.hash);
    },
    leaveRoom() {
      this.hasUsername = false;
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      localStorage.removeItem("rooms");
      this.$socketConnect.leaveRoom(this.hash, savedRooms[this.hash]);
    },
    async exportData() {
      try {
        const data = await this.$socketConnect.exportRoomData(this.hash);
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        this.copySuccess = true;

        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      } catch (err) {
        console.error("Export fehlgeschlagen:", err);
      }
    },
  },
  computed: {
    formattedTimer() {
      const seconds = this.$socketConnect.timerValue || 0;
      const min = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${min}:${sec}`;
    },
  },
  watch: {
    "$socketConnect.gameLeft"(newVal) {
      if (newVal) {
        this.$router.push({ name: "WelcomePage" });
      }
    },
  },
  mounted() {
    this.getUsernameForRoom();
  },
};
</script>

<template>
  <div v-if="!hasUsername">
    <div
      class="relative flex items-center justify-center min-h-screen bg-green-900"
    >
      <div
        class="bg-white shadow-2xl rounded-xl opacity-90 p-20 transform transition duration-300 hover:scale-105"
      >
        <h1 class="text-3xl mb-8 text-center tracking-wide text-green-800">
          Beitritt zum Planning Poker Raum
        </h1>
        <p class="text-center text-gray-600 mb-6">
          Du wurdest eingeladen, einem Planning Poker Raum beizutreten.<br />
          Bitte gib deinen Namen ein, um fortzufahren.
        </p>

        <div class="mb-6">
          <input
            type="text"
            placeholder="Dein Benutzername"
            v-model="username"
            @keyup.enter="UserJoinRoom"
            class="w-full rounded-lg px-4 py-3 border border-gray-300 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
          />
        </div>

        <div class="flex items-center mb-6">
          <input
            v-model="wantsVisitor"
            type="checkbox"
            id="visitorCheckbox"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label for="visitorCheckbox" class="ml-2 block text-sm text-gray-700">
            Als Beobachter teilnehmen (kann nicht abstimmen)
          </label>
        </div>

        <button
          @click="UserJoinRoom"
          class="w-full rounded-lg px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white border-gray-300 shadow-sm hover:from-green-600 hover:to-green-800 transition duration-200 font-medium"
        >
          Raum beitreten
        </button>

        <p class="text-center text-gray-500 mt-6 text-sm">
          Plan together, work smarter.
        </p>
      </div>

      <p
        class="absolute bottom-4 right-4 text-gray-300 text-sm opacity-60 hover:opacity-100 transform hover:-translate-y-1 transition duration-300"
      >
        👥 By your Azubi-Team from Hamburg
      </p>
    </div>
  </div>

  <div
    v-else
    class="relative min-h-screen bg-green-800 text-white overflow-hidden"
  >
    <header
      class="flex justify-between items-center w-full py-4 px-4 bg-green-900 relative"
    >
      <div class="flex flex-col items-start">
        <button
          @click="exportData"
          class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm transition duration-200 text-sm"
        >
          Export Data
        </button>
        <span
          v-if="copySuccess"
          class="mt-1 bg-green-200 text-green-900 px-2 py-1 rounded-lg shadow text-xs animate-bounce"
        >
          ✅ Kopiert!
        </span>
      </div>

      <div class="text-center">
        <h1 class="text-xl font-bold text-white">
          Current Story:
          {{ $socketConnect.stagedStory?.name || "Keine Story ausgewählt" }}
        </h1>
        <p v-if="!this.$socketConnect.roundStarted" class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warten...</p>
        <p v-else-if="!$socketConnect.discussionPhase" class="mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Runde hat gestartet | Timer: {{ formattedTimer }}
        </p>
        <p v-else class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Diskussion</p>
      </div>

      <button
        class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition duration-200 text-sm"
        @click="leaveRoom"
      >
        Leave
      </button>
    </header>

    <div class="flex space-x-4 mt-4 px-4">
      <RoomInfoPanel
        :existing-user="existingUser"
        :hash="hash"
        class="flex-shrink-0"
        @name-updated="(newName) => (existingUser = newName)"
      />
      <ScrumMasterTools
        v-if="$socketConnect.userRole === 'Scrum Master'"
        :hash="hash"
        :stagedStory="stagedStory"
        style="margin-left: 575px"
      />
    </div>

    <UserList />
    <StoryBoard :hash="hash" @stage-story="setStageStory"></StoryBoard>
    <DoneStories />
    <OpponentCard :existingUser="existingUser" />
    <GameCards
      v-if="
        $socketConnect.userRole !== 'Scrum Master' &&
        $socketConnect.userRole !== 'Visitor'
      "
      @card="setCard"
    />
  </div>
</template>
