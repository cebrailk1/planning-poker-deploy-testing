<script>
export default{
    data(){
        return{
            fibonacciCards:[1,2,3,5,8,13]
        }
    },
    methods:{
        selectCard(card){
            this.$emit("card",card)
        }
    }
}
</script>
<template>
    <div>
        <div v-for="(card) in this.fibonacciCards" @click="selectCard(card)">{{ card }}</div>
    </div>
</template>
<style></style>