import { sendToEveryClient } from "../utils/sendToClients.js";
import {exportGameData } from "../utils/exportData.js"
export function handleSetStory(ws, data, rooms) {
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

export function handleStageStory(ws, data, rooms) {
  const { story, roomId } = JSON.parse(data);

  const storyObj = rooms[roomId].stories.find((s) => s.name === story);
  if (!storyObj) return;

  rooms[roomId].stagedStory = storyObj;

  let payload = { type: "story-staged", story: storyObj };
  sendToEveryClient(roomId, payload, rooms);
}

export function handleCopyStories(ws, data, rooms) {
  const { roomId } = JSON.parse(data);
  let exportedData = exportGameData(rooms[roomId]);
  ws.send(JSON.stringify({ type: "exported-data", exportedData }));
}
