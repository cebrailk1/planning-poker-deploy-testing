<script>
import DoneStories from "./DoneStories.vue";
import GameCards from "./GameCards.vue";
import OpponentCard from "./OpponentCard.vue";
import ScrumMasterTools from "./ScrumMasterTools.vue";
import StoryBoard from "./StoryBoard.vue";
import UserList from "./UserList.vue";
import RoomInfoPanel from "./RoomInfoPanel.vue";
import JoinRoom from "./JoinRoom.vue";
import RoomHeader from "./RoomHeader.vue";
import QrcodeVue from "qrcode.vue";

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
    JoinRoom,
    RoomHeader,
    QrcodeVue,
  },
  data() {
    return {
      hasUsername: false,
      username: "",
      existingUser: null,
      stagedStory: null,
      wantsVisitor: false,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      qrCodePopUp: false,
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
    UserJoinRoom(username, wantsVisitor) {
      this.username = username;
      this.wantsVisitor = wantsVisitor;
      this.$socketConnect.joinRoom(
        this.hash,
        this.username,
        this.wantsVisitor,
        (response) => {
          if (response.error === "user-exists") {
            alert("Dieser Benutzername existiert bereits im Raum!");
            return;
          }
          if (response.error === "room-not-exists") {
            this.showToast("Raum existiert nicht", "warning");
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
    showToast(message, type = "info") {
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-2 px-4 py-2 rounded-lg shadow-lg text-white font-medium z-50 transition-opacity duration-300 ${
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
    displayQr() {
      this.qrCodePopUp = !this.qrCodePopUp;
    },
  },
  computed: {
    isMobile() {
      if (this.screenWidth <= 760 || this.screenHeight <= 600) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    window.addEventListener("resize", () => {
      this.screenWidth = window.innerWidth;
    });
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
    <JoinRoom :username="username" @joinRoom="UserJoinRoom"></JoinRoom>
  </div>

  <div v-else class="relative h-screen bg-green-800 text-white overflow-hidden">
    <RoomHeader :hash="hash"></RoomHeader>
    <div
      v-if="qrCodePopUp"
      class="modal-backdrop"
      @click.self="qrCodePopUp = false"
    >
      <div class="modal">
        <div class="absolute top-px right-2" @click="this.displayQr()">
          <button class="cursor-pointer bg-red-600 rounded-lg w-8">X</button>
        </div>
        <QrcodeVue
          :value="`http://localhost:5173/room/${hash}`"
          :size="400"
          level="H"
        />
      </div>
    </div>
    <div class="flex space-x-4 mt-4 px-4">
      <RoomInfoPanel
        v-if="!isMobile"
        :existing-user="existingUser"
        :hash="hash"
        @qrcode="displayQr"
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
    <UserList v-if="!isMobile" />
    <StoryBoard
      v-if="!isMobile"
      :hash="hash"
      @stage-story="setStageStory"
    ></StoryBoard>
    <DoneStories v-if="!isMobile" />
    <OpponentCard :isMobile="isMobile" :existingUser="existingUser" />
    <GameCards
      v-if="
        $socketConnect.userRole !== 'Scrum Master' &&
        $socketConnect.userRole !== 'Visitor'
      "
      @card="setCard"
    />
  </div>
</template>
<style>
.modal-backdrop {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  /*  display: flex;
  justify-content: center;
  align-items: center; */
  transition: opacity 0.3s ease;
}

.modal {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>
