<script>
export default{
    props:['hash'],
    emits:["stage-story"],
    data(){
        return{
            story:''
        }
    },
    methods:{
        addStory(){
            this.$socketConnect.addStory(this.story,this.hash)
            this.story = ''
        },
        stageStory(story){
            if(this.$socketConnect.roundStarted){
                alert("Cant stage a story in an on going round")
            }else{
                this.$emit("stage-story",story)
            }
        }
    },
    computed:{
        storyList(){
            return this.$socketConnect.storyList
        }
    }
}
</script>
<template>
    <input v-if="this.$socketConnect.userRole==='Scrum Master'" class="placeholder:text-slate-400 text-sm border border-slate-200 rounded-md px-3 py-2" type="text" placeholder="Story..." @change="addStory" v-model="story"/>
    <div v-if="this.$socketConnect.userRole==='Scrum Master'" class="w-auto m-1 border-2 border-solid p-2 rounded-xl shadow-lg bg-opacity-80 bg-green-900 border-yellow-200">
        <strong>Backlog</strong>
        <ul v-for="story in storyList">
            <li v-if="story.points !==null" @click="stageStory(story)" class="cursor-pointer m-1 p-1" :class="{'text-blue-300':story.name===this.$socketConnect.stagedStory.name }">{{ story.name }} : {{ story.points }} points ✅   </li>
            <li v-else @click="stageStory(story)" class="cursor-pointer m-1 p-1" :class="{'text-blue-300':story.name===this.$socketConnect.stagedStory.name }">{{ story.name }}</li>

        </ul>
    </div>
    <div v-else class="border-2 border-solid p-2 w-auto rounded-xl shadow-lg bg-opacity-80 bg-green-900 border-yellow-200">
        <strong>Backlog</strong>
        <ul v-for="story in storyList">
            <li class="m-1 p-1" :class="{'text-blue-300':story.name===this.$socketConnect.stagedStory.name,'✅':story.points!==null}">{{ story.name }}</li>
        </ul>
    </div> 
</template>