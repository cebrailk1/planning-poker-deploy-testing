import { sendToEveryClient } from "../utils/sendToClients.js";
export function handleDiscussion(ws, data, rooms) {
  const { roomId } = JSON.parse(data);

  if (rooms[roomId].timerInterval) {
    clearInterval(rooms[roomId].timerInterval);
    rooms[roomId].timerInterval = null;
    rooms[roomId].timerValue = 0;
    sendToEveryClient(roomId, { type: "timer-update", timerValue: 0 }, rooms);
  }

  rooms[roomId].discussion = true;
  let payload = {
    type: "discussion-started",
    discussion: rooms[roomId].discussion,
  };
  sendToEveryClient(roomId, payload, rooms);
}
