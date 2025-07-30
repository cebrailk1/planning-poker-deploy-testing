<script>
import HelloWorld from './components/HelloWorld.vue'
import GameRoom from './components/GameRoom.vue'
export default {
  data(){
    return{
      socket:null,
      authenticated:false
    }
  },
  components: {
    HelloWorld,
    GameRoom
  },
  methods: {
   /*  createNewRoom(user) {
      console.log("Room created",user)
      this.socket = new WebSocket("ws://localhost:8080")
      this.socket.onopen =()=>{
        this.socket.send(JSON.stringify({type:"create room",username:user}))
        this.socket.onmessage=(message)=>{
          console.log("message:",message.data)
          const mes = JSON.parse(message.data)
          console.log(mes)
          if(mes.type==="error"){
            console.log(message.type)
          }
          if(mes.type==="success"){
            console.log("success")
            this.authenticated = true
          }
        }
      }
    }, */

    createNewRoom(username){
       this.$socketConnect.createRoom(username, (roomHash) => {
    this.$router.push({ name: 'GameRoom', params: { hash: roomHash } }) 
  })
    }
  },
}
</script>

<template>
  <!-- <div v-if="authenticated">
    <GameRoom></GameRoom>
  </div>
  <div v-else>  
    <HelloWorld @new-room="createNewRoom" />
</div> -->
<div><RouterView></RouterView></div>
</template>

<style scoped>
</style>
