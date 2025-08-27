import crypto from "crypto";

export function roomHasher() {
  return crypto.randomUUID();
}

export function checkUserExists(room, user) {
  if (!room) return false;
  return room.players.some((e) => e.name === user);
}

export function checkUserRole(leavingUserIdx, players) {
  return players[leavingUserIdx]?.role === "Scrum Master";
}
