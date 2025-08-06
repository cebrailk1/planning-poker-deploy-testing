<script>
import GameCards from "./GameCards.vue";
export default {
  props: { hash: String },
  components: { GameCards },
  data() {
    return {
      hasUsername: false,
      username: "",
      existingUser: null,
    };
  },
  methods: {
    getUsernameForRoom() {
      console.log("checking", this.$socketConnect.userList);
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      console.log(savedRooms.createdRoom === false);
      if (savedRooms[this.hash] && savedRooms.createdRoom === false) {
        localStorage.setItem;
        this.existingUser = savedRooms[this.hash];
        this.$socketConnect.rejoin(this.existingUser, this.hash);
        this.hasUsername = true;
      }
      this.initialJoin();
      //rejoin funk hier aufrufen
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
        //this.getUsernameForRoom();
      });
    }, //neue funktion aufrufen für initialjoin
    initialJoin() {
      console.log("joining for the first time");
      //console.log("checking",this.$socketConnect.userList)
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
  },
  computed: {
    //const structure = [{},{},{}]
    userList() {
      console.log("userliste wurde geupdated", this.$socketConnect.userList);
      return this.$socketConnect.userList;
    },
    userCardsList(){
      console.log("new card set")
    return this.$socketConnect.userList
      .filter(player => player.name !== this.existingUser)
      .map(player => player.card);
      
    }
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

    <!--Oben links     absolute top-4 left-4 bg-green-800 text-white rounded-xl p-6 w-full max-w-2xl shadow-xl space-y-4  -->
    <div
      class="absolute top-4 left-4 bg-green-900 text-sm bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3"
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
        <div
          v-for="userCard in userCardsList"
          class="w-16 h-24 bg-white rounded-md border-2 border-gray-300 flex items-center justify-center cursor-pointer text-2xl font-bold text-gray-800 relative transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md active:scale-95 m-3"
          :class="{
            'border-yellow-400 shadow-lg bg-yellow-50 z-10': userCard !== null,
          }"
        >
          {{ userCard }}
        </div>
      </div>
    </div>

    <!--karten von allen anderen usern-->
    <div>
      <div></div>
    </div>

    <div class="absolute w-full bottom-30">
      <div class="flex justify-center items-center">
        <GameCards @card="setCard"></GameCards>
        <!--vifuserrole!==scrum master-->
      </div>
    </div>
  </div>
</template>
<style scoped></style>
