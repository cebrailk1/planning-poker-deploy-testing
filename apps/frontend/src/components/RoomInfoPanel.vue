<script>
export default{
    props:['existingUser','hash'],
    data(){
        return{}
    },
    methods:{
      saveToClipboard(){
        navigator.clipboard.writeText(`http://localhost:5173/room/${this.hash}`)
      }
    }
}
</script>
<template>
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
       <img 
        src="../assets/checklist.png" 
        alt="Clipboard Icon"
        class="w-6 h-6 cursor-pointer inline-block"
        @click="saveToClipboard"
      />
    </div>
  </div>
</template>
