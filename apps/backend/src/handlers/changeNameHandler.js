export function handleChangeName(ws,data,rooms) {
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
