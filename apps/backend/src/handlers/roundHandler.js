import { sendToEveryClient } from "../utils/sendToClients.js";
import {resetRoomVariableAfterFinishedRound} from "../utils/roomUtils.js"
export function handleStartRound(ws, data, rooms) {
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

export function handleEndRound(ws, data, rooms) {
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
  rooms[roomId].stories[discussedStoryIndex].points = storyPoints;
  rooms[roomId].discussedStories.push(
    rooms[roomId].stories[discussedStoryIndex]
  );
  rooms[roomId].stories.splice(discussedStoryIndex, 1);

  rooms[roomId].doppelteKarten = { 1: [], 2: [], 3: [], 5: [], 8: [], 13: [] };

  let payload = {
    type: "ended-round",
    roundEnded: false,
    stories: rooms[roomId].stories,
    discussedStories: rooms[roomId].discussedStories,
    doppelteKarten: rooms[roomId].doppelteKarten,
  };
  sendToEveryClient(roomId, payload, rooms);
}
