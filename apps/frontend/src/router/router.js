import { createRouter, createWebHistory } from 'vue-router'

import GameRoom from '../components/GameRoom.vue'
import HelloWorld from '../components/HelloWorld.vue'
const routes = [
    {path:"/",component:HelloWorld,name:"WelcomePage"},
    {path:"/room/:hash",name:'GameRoom',component:GameRoom,props:true}
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})  
export default router;
