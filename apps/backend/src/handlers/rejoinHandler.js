export function handleRejoin(ws, data, rooms) {
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
        room: {
          players: rooms[roomId].players.map((player) => ({
            name: player.name,
            role: player.role,
            card: player.card,
          })),
          roundStarted: rooms[roomId].roundStarted,
          discussion: rooms[roomId].discussion,
          doppelteKarten: rooms[roomId].doppelteKarten,
        },
        role: rejoinedPlayer.role,
        stories: rooms[roomId].stories,
        stagedStory: rooms[roomId].stagedStory,
        discussedStories: rooms[roomId].discussedStories,
      })
    );
  }
}
