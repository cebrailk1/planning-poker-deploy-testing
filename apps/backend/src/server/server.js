import WebSocket, { WebSocketServer } from "ws";
import { sendToEveryClient } from "../utils/sendToClients.js";
import {
  checkUserRole,
  resetRoomVariableAfterFinishedRound,
} from "../utils/roomUtils.js";
import { handleCreateRoom } from "../handlers/createRoomHandler.js";
import { handleJoinRoom } from "../handlers/joinRoomHandler.js";
import { handleRejoin } from "../handlers/rejoinHandler.js";
import { handleSetCard } from "../handlers/setCardHandler.js";
import { handleEndRound, handleStartRound } from "../handlers/roundHandler.js";
import { handleCopyStories, handleSetStory, handleStageStory } from "../handlers/storyHandler.js";
import { handleChangeName } from "../handlers/changeNameHandler.js";
import { handleDiscussion } from "../handlers/discussionHandler.js";
import { handleLeaveRoom } from "../handlers/leaveRoomHandler.js";
import { handleEstimate } from "../handlers/chooseEstimateHandler.js";
const wss = new WebSocketServer({ port: 8080 });
let rooms = {}; // Struktur {hash:{players:[], roundStarted:bool, timerActive, timerValue, timerInterval, ...}}    doppelteKarten

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    const { username, type } = JSON.parse(data);

    if (type === "create room") {
      handleCreateRoom(ws,username,rooms)
    }

    if (type === "join room") {
      handleJoinRoom(ws,data,rooms)
    }

    if (type === "rejoin") {
      handleRejoin(ws,data,rooms)
    }

    if (type === "set card") {
      handleSetCard(ws,data,rooms)
    }

    if (type === "start round") {
      handleStartRound(ws,data,rooms)
    }

    if (type === "end round") {
      handleEndRound(ws,data,rooms)
    }

    if (type === "choose estimate") {
      handleEstimate(ws,data,rooms)
    }

    if (type === "set story") {
      handleSetStory(ws,data,rooms)
    }

    if (type === "stage story") {
      handleStageStory(ws,data,rooms)
    }

    if (type === "start discussion") {
      handleDiscussion(ws,data,rooms)
    }

    if (type === "leave room") {
      handleLeaveRoom(ws,data,rooms)
    }

    if (type === "copy stories") {
      handleCopyStories(ws,data,rooms)
    }

    if (type === "change-name") {
      handleChangeName(ws,data,rooms)
    }
  });
});
