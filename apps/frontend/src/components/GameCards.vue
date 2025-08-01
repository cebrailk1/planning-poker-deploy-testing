<script>
export default{
    data(){
        return{
            fibonacciCards:[1,2,3,5,8,13]
        }
    }
}
</script>
<template>
    <div>
        <div v-for="(card) in this.fibonacciCards" @click="console.log(card)">{{ card }}</div>
    </div>
</template>
<style></style>