<script>
export default {
  props: ["existingUser", "hash"],
  data() {
    return {
      username: "",
      editMode: false,
      wigglePen: false,
    };
  },
  methods: {
    saveToClipboard() {
      navigator.clipboard.writeText(`http://localhost:5173/room/${this.hash}`);
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

<template>
  <div
    class="absolute top-25 right-3 bg-green-900 bg-opacity-80 p-4 rounded-lg shadow-lg w-80 space-y-3 text-sm"
  >
    <h2 class="text-lg font-bold text-yellow-300">🧾 Spielinformationen</h2>

    <div class="font-semibold flex items-center space-x-2">
      <span>Benutzername:</span>

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
      <span class="font-semibold">Raum-Link: </span><br />
      <p class="text-blue-200 underline break-all">
        http://localhost:5173/room/{{ hash }}
      </p>
      <img
        src="../assets/checklist.png"
        alt="Clipboard Icon"
        class="w-6 h-6 cursor-pointer inline-block"
        @click="saveToClipboard"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(8deg);
  }
}
.animate-wiggle {
  animation: wiggle 0.4s ease-in-out;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
