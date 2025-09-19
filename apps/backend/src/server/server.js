import WebSocket, { WebSocketServer } from "ws";
import { sendToEveryClient } from "../utils/sendToClients.js";
import { exportGameData } from "../utils/exportData.js";
import {
  roomHasher,
  checkUserExists,
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
      const { roomId, storyPoints, story } = JSON.parse(data);

      if (rooms[roomId].timerInterval) {
        clearInterval(rooms[roomId].timerInterval);
        rooms[roomId].timerInterval = null;
      }

      resetRoomVariableAfterFinishedRound(rooms, roomId);

      sendToEveryClient(roomId, { type: "timer-update", timerValue: 0 }, rooms);

      let discussedStoryIndex = rooms[roomId].stories.findIndex(
        (ele) => ele.name === story.name
      );

      if (discussedStoryIndex !== -1) {
        rooms[roomId].stories[discussedStoryIndex].points = storyPoints;
        rooms[roomId].discussedStories.push(
          rooms[roomId].stories[discussedStoryIndex]
        );
        rooms[roomId].stories.splice(discussedStoryIndex, 1);
      }

      rooms[roomId].players.forEach((player) => (player.card = null));

      let payload = {
        type: "estimate-chosen",
        stories: rooms[roomId].stories,
        discussedStories: rooms[roomId].discussedStories,
      };
      sendToEveryClient(roomId, payload, rooms);
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
      const { roomId, user } = JSON.parse(data);

      const leavingUser = rooms[roomId].players.findIndex(
        (player) => player.name === user.toLowerCase()
      );

      const isScrumMaster = checkUserRole(leavingUser, rooms[roomId].players);

      if (isScrumMaster) {
        let payload = { type: "left" };
        sendToEveryClient(roomId, payload, rooms);
        delete rooms[roomId];
        return;
      }

      rooms[roomId].players.splice(leavingUser, 1);

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
        ws.send(JSON.stringify({ type: "left" }));
      } else {
        ws.send(JSON.stringify({ type: "left" }));
        rooms[roomId].players.forEach((player) => {
          if (
            player.socket !== ws &&
            player.socket.readyState === WebSocket.OPEN
          ) {
            player.socket.send(
              JSON.stringify({ type: "user-left", room: rooms[roomId] })
            );
          }
        });
      }
    }

    if (type === "copy stories") {
      handleCopyStories(ws,data,rooms)
    }

    if (type === "change-name") {
      handleChangeName(ws,data,rooms)
    }
  });
});
