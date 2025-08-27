import { createRouter, createWebHistory } from "vue-router";

import GameRoom from "../components/GameRoom.vue";
import CreateRoom from "../components/CreateRoom.vue";
const routes = [
  { path: "/", component: CreateRoom, name: "WelcomePage" },
  { path: "/room/:hash", name: "GameRoom", component: GameRoom, props: true },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
