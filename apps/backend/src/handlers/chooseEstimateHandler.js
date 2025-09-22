import { sendToEveryClient } from "../utils/sendToClients.js";
import { resetRoomVariableAfterFinishedRound } from "../utils/roomUtils.js";

export function handleEstimate(ws, data, rooms) {
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
