import { sendToEveryClient } from "../utils/sendToClients.js";
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
