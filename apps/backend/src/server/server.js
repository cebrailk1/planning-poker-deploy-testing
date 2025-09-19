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
import { handleStartRound } from "../handlers/roundHandler.js";
const wss = new WebSocketServer({ port: 8080 });
let rooms = {}; // Struktur {hash:{players:[], roundStarted:bool, timerActive, timerValue, timerInterval, ...}}    doppelteKarten
const userNameWhiteList = /^[A-Za-z0-9]+$/;

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
      const { roomId, storyPoints, story } = JSON.parse(data);

      console.log("hello", JSON.parse(data));

      if (rooms[roomId].timerInterval) {
        clearInterval(rooms[roomId].timerInterval);
        rooms[roomId].timerInterval = null;
      }
      resetRoomVariableAfterFinishedRound(rooms, roomId);

      sendToEveryClient(roomId, { type: "timer-update", timerValue: 0 }, rooms);

      let discussedStoryIndex = rooms[roomId].stories.findIndex(
        (ele) => ele.name === story.name
      );
      rooms[roomId].stories[discussedStoryIndex].points = storyPoints;
      rooms[roomId].discussedStories.push(
        rooms[roomId].stories[discussedStoryIndex]
      );
      rooms[roomId].stories.splice(discussedStoryIndex, 1);

      rooms[roomId].doppelteKarten={ 1: [], 2: [], 3: [], 5: [], 8: [], 13: [] }

      let payload = {
        type: "ended-round",
        roundEnded: false,
        stories: rooms[roomId].stories,
        discussedStories: rooms[roomId].discussedStories,
        doppelteKarten: rooms[roomId].doppelteKarten
      };
      sendToEveryClient(roomId, payload, rooms);
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
      const { story, roomId } = JSON.parse(data);

      if (rooms[roomId].stories.find((ele) => ele.name === story)) {
        ws.send(JSON.stringify({ type: "story-exists" }));
        return;
      }

      rooms[roomId].stories.push({ name: story, points: null });
      let payload = {
        type: "set-new-story",
        stories: rooms[roomId].stories,
      };

      sendToEveryClient(roomId, payload, rooms);
    }

    if (type === "stage story") {
      const { story, roomId } = JSON.parse(data);

      const storyObj = rooms[roomId].stories.find((s) => s.name === story);
      if (!storyObj) return;

      rooms[roomId].stagedStory = storyObj;

      let payload = { type: "story-staged", story: storyObj };
      sendToEveryClient(roomId, payload, rooms);
    }

    if (type === "start discussion") {
      const { roomId } = JSON.parse(data);

      if (rooms[roomId].timerInterval) {
        clearInterval(rooms[roomId].timerInterval);
        rooms[roomId].timerInterval = null;
        rooms[roomId].timerValue = 0;
        sendToEveryClient(
          roomId,
          { type: "timer-update", timerValue: 0 },
          rooms
        );
      }

      rooms[roomId].discussion = true;
      let payload = {
        type: "discussion-started",
        discussion: rooms[roomId].discussion,
      };
      sendToEveryClient(roomId, payload, rooms);
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
      const { roomId } = JSON.parse(data);
      let exportedData = exportGameData(rooms[roomId]);
      ws.send(JSON.stringify({ type: "exported-data", exportedData }));
    }

    if (type === "change-name") {
      const { roomId, oldName, newName } = JSON.parse(data);

      const player = rooms[roomId]?.players.find((p) => p.name === oldName);
      if (!player) {
        ws.send(
          JSON.stringify({ type: "error", message: "Spieler nicht gefunden" })
        );
        return;
      }

      player.name = newName;

      rooms[roomId].players.forEach((p) => {
        if (p.socket.readyState === WebSocket.OPEN) {
          p.socket.send(
            JSON.stringify({
              type: "user-list-update",
              players: rooms[roomId].players.map((pl) => ({
                name: pl.name,
                role: pl.role,
                card: pl.card,
              })),
            })
          );
        }
      });
    }
  });
});
