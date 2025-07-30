<script>export default{
   /*  props:['hash','user'], */
   props:{hash:String},
    data(){
        return{
            hasUsername:false
        }
    },
    methods:{
        checkHash(){
            if(this.hash){
                console.log(this.$route.meta)
                console.log("joining.......",this.user)
                this.$socketConnect.joinRoom(this.hash)
            }
        },
        getUsernameForRoom(){
           const savedRooms =  JSON.parse(localStorage.getItem("rooms"))
           console.log(savedRooms[this.hash])
            if(savedRooms[this.hash]){
                this.hasUsername = true
            }

        }   
    },
    mounted(){
        console.log("fhahsfh")
        this.getUsernameForRoom()
        this.checkHash()
    }
}</script>
<template>
    <div v-if="!this.hasUsername">
        <input type="text" placeholder="username">
    </div>
    <div v-else id="game-board">Du bist im Spiel
        <p>{{ this.hash }}</p>
    </div>
</template>
<style scoped></style>