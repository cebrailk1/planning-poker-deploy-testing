<script>
export default{
    data(){
        return{}
    },
    computed:{
        doneList(){
            return this.$socketConnect.discussedStories
        }
    }
}
</script>
<template>

    <div class="border-2 border-solid p-2 w-auto rounded-xl shadow-lg bg-opacity-80 bg-green-900 border-yellow-200">
        <strong>Done</strong>
        <ul v-for="story in doneList">
            <li class="m-1 p-1">{{ story.name }}: {{ story.points }} ✅</li>
        </ul>
    </div> 

</template>