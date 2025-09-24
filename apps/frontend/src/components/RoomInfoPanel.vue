<template>
  <div
    class="absolute top-25 right-3 bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3 text-sm"
  >
    <h2 class="text-lg font-bold text-yellow-300">🧾 Game informations</h2>

    <div class="font-semibold flex items-center space-x-2">
      <span>Username:</span>
      <span v-if="!editMode">{{ existingUser }}</span>
      <transition name="fade-slide">
        <input
          v-if="editMode"
          v-model="username"
          placeholder="Neuer Name"
          class="bg-transparent border-b border-yellow-300 focus:outline-none transition-all duration-300"
          ref="nameInput"
          @keyup.enter="nameChange"
        />
      </transition>
      <button
        @click="startEdit"
        class="text-yellow-400 hover:scale-110 transition-transform duration-300"
        :class="{ 'animate-wiggle': wigglePen }"
      >
        ✏️
      </button>
    </div>
    <div>
      <QrcodeVue
        :value="`http://localhost:5173/room/${hash}`"
        :size="80"
        level="H"
      ></QrcodeVue>
    </div>

    <div>
      <span class="font-semibold">Room-Link: </span><br />
      <div class="relative inline-block">
        <img
          src="../assets/checklist.png"
          alt="Clipboard Icon"
          class="w-6 h-6 cursor-pointer inline-block transition-all duration-300"
          :class="{
            'animate-pulse bg-yellow-300 rounded-full p-1 shadow-lg':
              clipboardGlow,
            'hover:scale-110': !clipboardGlow,
          }"
          @click="saveToClipboard"
        />

        <transition name="notification">
          <div
            v-if="showNotification"
            class="absolute -top-12 -left-16 bg-green-600 text-white px-3 py-1 rounded-md text-xs whitespace-nowrap shadow-lg border border-green-400"
          >
            ✓ Copy in Clipboard!
            <div
              class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"
            ></div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from "qrcode.vue";
export default {
  props: ["existingUser", "hash"],
  components: {
    QrcodeVue,
  },
  data() {
    return {
      username: "",
      editMode: false,
      wigglePen: false,
      clipboardGlow: false,
      showNotification: false,
    };
  },
  methods: {
    async saveToClipboard() {
      try {
        this.clipboardGlow = true;

        await navigator.clipboard.writeText(
          `http://localhost:5173/room/${this.hash}`
        );

        this.showNotification = true;

        setTimeout(() => {
          this.clipboardGlow = false;
        }, 800);

        setTimeout(() => {
          this.showNotification = false;
        }, 3000);
      } catch (err) {
        console.error("Fehler beim Kopieren:", err);
        this.fallbackCopyTextToClipboard(
          `http://localhost:5173/room/${this.hash}`
        );
      }
    },

    nameChange() {
      if (!this.username.trim()) return;
      const oldName = this.existingUser;
      const newName = this.username.trim();
      const savedRooms = JSON.parse(localStorage.getItem("rooms"));
      savedRooms[this.hash] = newName;
      localStorage.setItem("rooms", JSON.stringify(savedRooms));
      this.$socketConnect.changeName(this.hash, oldName, newName);
      this.$emit("name-updated", newName);
      this.editMode = false;
    },

    startEdit() {
      this.wigglePen = true;
      setTimeout(() => {
        this.wigglePen = false;
        this.editMode = true;
        this.username = this.existingUser;
        this.$nextTick(() => {
          this.$refs.nameInput.focus();
        });
      }, 400);
    },
  },
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.notification-leave-active {
  transition: all 0.3s ease-in;
}
.notification-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}
.notification-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}
.animate-wiggle {
  animation: wiggle 0.6s ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
.animate-pulse {
  animation: pulse 0.8s ease-in-out;
}
</style>
