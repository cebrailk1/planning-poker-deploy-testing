<script>export default{
    props:['hash'],
    data(){
        return{}
    },
    methods:{
        checkHash(){
            if(this.hash){
                console.log("joining.......")
                this.$socketConnect.joinRoom(this.hash)
            }
        }
    },
    mounted(){
        console.log("fhahsfh")
        this.checkHash()
    }
}</script>
<template>
    <div id="game-board">Du bist im Spiel</div>
</template>
<style scoped></style>