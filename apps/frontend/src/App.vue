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

  },
}
</script>

<template>
<div><RouterView></RouterView></div>
</template>

<style scoped>
</style>
