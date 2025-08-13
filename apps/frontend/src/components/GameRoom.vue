<script>
import DoneStories from "./DoneStories.vue";
import GameCards from "./GameCards.vue";
import OpponentCard from "./OpponentCard.vue";
import StoryBoard from "./StoryBoard.vue";
export default {
  props: { hash: String },
  components: { GameCards,OpponentCard,StoryBoard,DoneStories },
  data() {
    return {
      hasUsername: false,
      username: "",
      existingUser: null,
      stagedStory:null,
      storyPoints:null,
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

    startRound(){
      if(this.$socketConnect.roundStarted){
        alert("Your Round already started")
      }else if(this.$socketConnect.stagedStory===''){
        alert("Choose a Story to start a new Round")
      }else{
        this.$socketConnect.startRound(this.hash)
      }
    },
    endRound(){
      console.log(this.storyPoints)
      if(this.$socketConnect.roundStarted && this.storyPoints){
        console.log("ending round")
        this.$socketConnect.endRound(this.hash,this.storyPoints,this.stagedStory)
      }
    },
    setStageStory(story){
      this.stagedStory = story
      this.$socketConnect.stageStory(this.stagedStory,this.hash)
    },
    startDiscussion(){
      this.$socketConnect.startDiscussion(this.hash)
    }
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
  <h1 class="text-xl font-bold text-white">Current Story: {{ this.$socketConnect.stagedStory.name }}</h1>
  <p v-if="this.$socketConnect.roundStarted" class="text-xl">Runde hat gestartet</p>
</header>

  <div v-if="this.$socketConnect.userRole === 'Scrum Master'" class="absolute top-60 m-10">
    <button class="bg-yellow-200 p-1.5 rounded-2xl text-black" @click="startRound">Start new Game</button>
    <button class="bg-red-400 p-1.5 rounded-2xl text-black" @click="endRound">End Round</button>
    <button class="p-1.5" @click="startDiscussion">Start Discussion</button>
    <select
    v-if="this.$socketConnect.discussionPhase"
    v-model="this.storyPoints"
        class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow cursor-pointer appearance-none">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="5">5</option>
        <option value="8">8</option>
        <option value="13">13</option>
    </select>
  </div>
  
  <!--Storyboard-->
  <div class="absolute top-80">
    <StoryBoard :hash="this.hash" @stage-story="setStageStory"></StoryBoard>
  </div>

  <div class="absolute top-80 right-1.5">
    <DoneStories></DoneStories>
  </div>


    <!--Info-Panel oben rechts-->
    <div
      class="absolute top-4 right-3 bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3 text-sm"
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
      class="absolute top-4 left-4 text-sm bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3"
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

    <div class="flex justify-center items-center h-screen">
      <div
        class="w-full max-w-6xl bg-green-700 border-[10px] border-yellow-400 rounded-full h-[500px] flex justify-center items-center"
      >
      <OpponentCard :existingUser="existingUser"></OpponentCard>
      </div>
    </div>

    <!--karten von allen anderen usern-->
    <div>
      <div></div>
    </div>

    <div class="absolute w-full bottom-30">
      <div class="flex justify-center items-center">
        <GameCards
          v-if="this.$socketConnect.userRole !== 'Scrum Master'"
          @card="setCard"
        ></GameCards>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
