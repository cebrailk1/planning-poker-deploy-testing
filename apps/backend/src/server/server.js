import WebSocket, { WebSocketServer } from "ws";
import { sendToEveryClient } from "../utils/sendToClients.js";
import { exportGameData } from "../utils/exportData.js";
import {
  roomHasher,
  checkUserExists,
  checkUserRole,
} from "../utils/roomUtils.js";

const wss = new WebSocketServer({ port: 8080 });
let rooms = {}; // Struktur {hash:{players:[], roundStarted:bool, timerActive, timerValue, timerInterval, ...}}
const userNameWhiteList = /^[A-Za-z0-9]+$/;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    const { username, type } = JSON.parse(data);

    if (type === "create room") {
      if (!username.match(userNameWhiteList)) {
        ws.send(JSON.stringify({ type: "wrong-format" }));
        return;
      }

      const roomId = roomHasher();
      rooms[roomId] = {
        players: [],
        roundStarted: false,
        stories: [],
        stagedStory: "",
        discussion: false,
        discussedStories: [],
        timerActive: false,
        timerValue: 0,
        timerInterval: null,
      };

      rooms[roomId].players.push({
        name: username.toLowerCase(),
        role: "Scrum Master",
        socket: ws,
        card: null,
      });

      ws.send(
        JSON.stringify({
          type: "room-created",
          roomId,
          room: rooms[roomId],
          card: null,
        })
      );
    }

    if (type === "join room") {
      const { roomId, user, wantsVisitor } = JSON.parse(data);

      if (!user.match(userNameWhiteList)) {
        ws.send(JSON.stringify({ type: "wrong-format" }));
        return;
      }

      const userLower = user.toLowerCase();

      if (!rooms[roomId]) {
        ws.send(
          JSON.stringify({ type: "room-joined", error: "Raum nicht gefunden" })
        );
        return;
      }

      if (checkUserExists(rooms[roomId], userLower)) {
        ws.send(
          JSON.stringify({
            type: "user-exists",
            message: "User already exists",
          })
        );
        return;
      }

      rooms[roomId].players.push({
        name: userLower,
        role: wantsVisitor ? "Visitor" : "Player",
        socket: ws,
        card: null,
      });

      console.log("das ist role", rooms[roomId].players.role);

      const joinedUserIdx = rooms[roomId].players.findIndex(
        (ele) => ele.name === userLower
      );

      ws.send(
        JSON.stringify({
          type: "room-joined",
          message: "User angelegt",
          room: rooms[roomId],
          card: null,
          stories: rooms[roomId].stories,
          stagedStory: rooms[roomId].stagedStory,
          discussedStories: rooms[roomId].discussedStories,
          role: rooms[roomId].players[joinedUserIdx].role,
        })
      );

      rooms[roomId].players.forEach((player) => {
        if (
          player.socket !== ws &&
          player.socket.readyState === WebSocket.OPEN
        ) {
          player.socket.send(
            JSON.stringify({
              type: "user-joined",
              name: userLower,
              role: rooms[roomId].players[joinedUserIdx].role,
              card: null,
            })
          );
        }
      });
    }

    if (type === "rejoin") {
      const { user, roomId } = JSON.parse(data);
      const userLower = user.toLowerCase();
      const rejoinedPlayer = rooms[roomId].players.find(
        (player) => player.name === userLower
      );
      if (rejoinedPlayer) {
        rejoinedPlayer.socket = ws;
        ws.send(
          JSON.stringify({
            type: "user-rejoined",
            room: rooms[roomId],
            role: rejoinedPlayer.role,
            stories: rooms[roomId].stories,
            stagedStory: rooms[roomId].stagedStory,
            discussedStories: rooms[roomId].discussedStories,
          })
        );
      }
    }

    if (type === "set card") {
      const { card, user, roomId } = JSON.parse(data);
      rooms[roomId].players.forEach((player) => {
        if (player.name === user.toLowerCase()) {
          player.card = card === null ? null : card;
        }
      });

      let payload = {
        type: "set-card",
        name: user.toLowerCase(),
        card: card,
      };
      sendToEveryClient(roomId, payload, rooms);
    }

    if (type === "start round") {
      const { roomId, timerActive, timerValue } = JSON.parse(data);

      rooms[roomId].roundStarted = true;
      rooms[roomId].timerActive = timerActive;
      rooms[roomId].timerValue = timerActive ? timerValue : 0;

      rooms[roomId].players.forEach((player) => (player.card = null));

      if (rooms[roomId].timerInterval) {
        clearInterval(rooms[roomId].timerInterval);
      }

      if (rooms[roomId].timerActive) {
        rooms[roomId].timerInterval = setInterval(() => {
          if (rooms[roomId].timerValue > 0) {
            rooms[roomId].timerValue--;
            let payload = {
              type: "timer-update",
              timerValue: rooms[roomId].timerValue,
            };
            sendToEveryClient(roomId, payload, rooms);
          } else {
            clearInterval(rooms[roomId].timerInterval);
            rooms[roomId].timerInterval = null;

            rooms[roomId].discussion = true;
            let discussionPayload = {
              type: "discussion-started",
              discussion: true,
            };
            sendToEveryClient(roomId, discussionPayload, rooms);
          }
        }, 1000);
      }

      let payload = {
        type: "started-round",
        roundStarted: rooms[roomId].roundStarted,
        room: rooms[roomId].players,
      };
      sendToEveryClient(roomId, payload, rooms);
    }

    if (type === "end round") {
      const { roomId, storyPoints, story } = JSON.parse(data);

      if (rooms[roomId].timerInterval) {
        clearInterval(rooms[roomId].timerInterval);
        rooms[roomId].timerInterval = null;
      }
      rooms[roomId].roundStarted = false;
      rooms[roomId].discussion = false;
      rooms[roomId].stagedStory = "";
      rooms[roomId].timerValue = 0;
      sendToEveryClient(roomId, { type: "timer-update", timerValue: 0 }, rooms);

      let discussedStoryIndex = rooms[roomId].stories.findIndex(
        (ele) => ele.name === story.name
      );
      rooms[roomId].stories[discussedStoryIndex].points = storyPoints;
      rooms[roomId].discussedStories.push(
        rooms[roomId].stories[discussedStoryIndex]
      );
      rooms[roomId].stories.splice(discussedStoryIndex, 1);

      let payload = {
        type: "ended-round",
        roundEnded: rooms[roomId].roundStarted,
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
      rooms[roomId].stagedStory = story;

      let payload = { type: "story-staged", story: rooms[roomId].stagedStory };
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
