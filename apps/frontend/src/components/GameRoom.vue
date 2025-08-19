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
    RoomInfoPanel
  },
  data() {
    return {
      hasUsername: false,
      username: "",
      existingUser: null,
      stagedStory: null,
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
      this.$socketConnect.joinRoom(this.hash, this.username, (response) => {
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
      });
    },

    setCard(card) {
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      this.$socketConnect.setCard(card, savedRooms[this.hash], this.hash);
    },
    setStageStory(story) {
      this.stagedStory = story;
      this.$socketConnect.stageStory(this.stagedStory, this.hash);
    },
    leaveRoom() {
      this.hasUsername = false;
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      localStorage.removeItem("rooms");
      this.$socketConnect.leaveRoom(this.hash, savedRooms[this.hash]);
    },
  },

  watch: {
    "$socketConnect.gameLeft"(newVal) {
      if (newVal) {
        console.log("user is leaving");
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
  <div v-if="!this.hasUsername">
    <input type="text" placeholder="username" v-model="username" />
    <button @click="UserJoinRoom">Join Room</button>
  </div>
  <div
    v-else
    class="relative min-h-screen bg-green-800 text-white overflow-hidden"
  >
    <header class="flex justify-center items-center w-full py-4 bg-green-900">
      <h1 class="text-xl font-bold text-white">
        Current Story: {{ this.$socketConnect.stagedStory.name }}
      </h1>
      <p v-if="this.$socketConnect.roundStarted" class="text-xl">
        Runde hat gestartet
      </p>
      <button
        class="absolute rounded-lg right-1 p-3 shadow-sm bg-red-400 hover:bg-red-700 text-white transition-colors duration-200"
        @click="leaveRoom"
      >
        Leave
      </button>
    </header>

    <ScrumMasterTools
      :hash="this.hash"
      :stagedStory="this.stagedStory"
    ></ScrumMasterTools>

    <StoryBoard :hash="this.hash" @stage-story="setStageStory"></StoryBoard>

    <DoneStories></DoneStories>

    <RoomInfoPanel :existing-user="this.existingUser" :hash="this.hash"></RoomInfoPanel>

    <UserList></UserList>

    <OpponentCard :existingUser="existingUser"></OpponentCard>

    <GameCards
      v-if="this.$socketConnect.userRole !== 'Scrum Master'"
      @card="setCard"
    ></GameCards>
  </div>
</template>
