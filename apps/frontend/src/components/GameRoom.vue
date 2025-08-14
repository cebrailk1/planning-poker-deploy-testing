<script>
import DoneStories from "./DoneStories.vue";
import GameCards from "./GameCards.vue";
import OpponentCard from "./OpponentCard.vue";
import ScrumMasterTools from "./ScrumMasterTools.vue";
import StoryBoard from "./StoryBoard.vue";
export default {
  props: { hash: String },
  components: {
    GameCards,
    OpponentCard,
    StoryBoard,
    DoneStories,
    ScrumMasterTools,
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
      if (savedRooms[this.hash] && savedRooms.createdRoom === false) {
        this.existingUser = savedRooms[this.hash];
        this.$socketConnect.rejoin(this.existingUser, this.hash);
        this.hasUsername = true;
      }
      this.initialJoin();
    },
    UserJoinRoom() {
      this.$socketConnect.joinRoom(this.hash, this.username, (response) => {
        if (response.error === "user-exists") {
          alert("Dieser Benutzername existiert bereits im Raum!");
          return;
        }

        localStorage.setItem(
          "rooms",
          JSON.stringify({ [this.hash]: this.username })
        );
        this.initialJoin();
      });
    },
    initialJoin() {
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      savedRooms.createdRoom = false;
      localStorage.setItem(
        "rooms",
        JSON.stringify({
          [this.hash]: savedRooms[this.hash],
          createdRoom: savedRooms.createdRoom,
        })
      );
      if (savedRooms[this.hash]) {
        this.existingUser = savedRooms[this.hash];
        this.hasUsername = true;
      }
    },

    setCard(card) {
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      this.$socketConnect.setCard(card, savedRooms[this.hash], this.hash);
    },
    setStageStory(story) {
      this.stagedStory = story;
      this.$socketConnect.stageStory(this.stagedStory, this.hash);
    },
  },
  computed: {
    userList() {
      return this.$socketConnect.userList;
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
    </header>

    <ScrumMasterTools
      :hash="this.hash"
      :stagedStory="this.stagedStory"
    ></ScrumMasterTools>

    <StoryBoard :hash="this.hash" @stage-story="setStageStory"></StoryBoard>

    <DoneStories></DoneStories>

    <!--Info-Panel oben rechts-->
    <div
      class="absolute top-25 right-3 bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3 text-sm"
    >
      <h2 class="text-lg font-bold text-yellow-300">🧾 Spielinformationen</h2>
      <div class="font-semibold">
        <span class="font-semibold">Benutzername:</span><br />
        {{ this.existingUser }}
      </div>

      <div>
        <span class="font-semibold">Raum-Link: </span><br />
        <p class="text-blue-200 underline break-all">
          http://localhost:5173/room/{{ this.hash }}
        </p>
      </div>
    </div>

    <!--Oben links-->
    <div
      class="absolute top-25 left-4 text-sm bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3"
    >
      <div>
        <h2 class="text-2xl font-semibold mb-2">Spieler im Raum:</h2>
        <ul class="list-none list-inside space-y-1 text-lg text-white">
          <li v-for="user in userList" :key="user">
            {{ user.name.toUpperCase() }} ({{ user.role }})
          </li>
        </ul>
      </div>
    </div>

    <OpponentCard :existingUser="existingUser"></OpponentCard>

    <GameCards
      v-if="this.$socketConnect.userRole !== 'Scrum Master'"
      @card="setCard"
    ></GameCards>
  </div>
</template>
