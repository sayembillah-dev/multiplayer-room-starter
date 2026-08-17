# 🎮 multiplayer-room-template

A starterpack for **real-time multiplayer browser games**: rooms with shareable invite links, a live lobby, and a server-authoritative game loop — bring your own game.

Built with **Next.js + Socket.IO** running in a single Node process. No database, no accounts — rooms live in memory and die when empty.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

1. **Create a room** → you get a random link like `/room/k7x2qm`
2. **Share the link** (there's a copy button in the lobby)
3. Anyone opening the link is **asked for a name**, then joins the same room
4. The player list updates **in real-time** as people join / leave
5. **Start game** → everyone switches to the game screen (a placeholder — yours goes there)
6. **End game** → everyone lands back in the lobby, ready for another round

> Friends on the same network can join via your LAN IP, e.g. `http://192.168.x.x:3000/room/k7x2qm` (whitelisted automatically in dev — see `next.config.mjs`).

## Use it as a GitHub template

Push this folder to a repo, then in the repo settings tick **☑ Template repository**. Every new game = **Use this template → create repository** → clone → `npm install` → build your game.

## What's inside

| Piece | File | Role |
| --- | --- | --- |
| Custom server | `server.js` | Next.js + Socket.IO in one process; room state in memory (server-authoritative). **GAME HOOK section is where your game logic goes.** |
| Home | `app/page.jsx` | Create room (random id) or join by pasted link/code |
| Room page | `app/room/[id]/page.jsx` | Server component wrapper |
| Lobby UI | `components/Room.jsx` | Name prompt → socket join → live player list + copy-link + start button |
| Game screen | `components/Game.jsx` | 🚧 **Placeholder** — rendered whenever `game-state.phase !== 'lobby'`. Replace with your game. |
| Socket singleton | `lib/socket.js` | One client connection, auto-reconnect, re-joins on reconnect |
| Room ids | `lib/roomId.js` | URL-safe random ids (no ambiguous characters) |
| Smoke test | `scripts/smoke-test.mjs` | E2E: join, see each other, game start/end, leave, 9th player rejected |

## Events (socket.io)

| Event | Direction | Payload |
| --- | --- | --- |
| `join-room` | client → server (ack) | `{ roomId, name }` → `{ ok, you, room }` or `{ ok: false, error }` |
| `leave-room` | client → server | — (also handled automatically on disconnect) |
| `room-state` | server → room | `{ id, createdAt, maxPlayers, players[] }` |
| `start-game` | client → server | — (needs ≥ `MIN_PLAYERS` in the room) |
| `end-game` | client → server | — (template placeholder; your game decides when it's over) |
| `game-state` | server → room | your serialized game, or `null` when in the lobby |

Rules: rooms are created implicitly by the first join, capped at `MAX_PLAYERS` (8), and deleted when empty. Each player gets a (mostly) unique emoji avatar.

## Build your game (5 steps)

1. **State** — in `server.js` → `createGame(room)`: return your initial authoritative state (turn order, positions, scores, seed…).
2. **Serialization** — `serializeGame(room)`: control exactly what clients receive (hide other players' hands, etc.).
3. **Actions** — register handlers next to the `GAME HOOK` comment, e.g.
   ```js
   socket.on('action', (payload) => {
     const room = rooms.get(socket.data.roomId);
     // validate → mutate room.game → broadcastGame(room.id)
   });
   ```
4. **UI** — replace `components/Game.jsx`. It receives `gs` (latest game-state) and `myId`. Emit actions with `getSocket().emit(...)`.
5. **Game over** — set `room.game = null` and call `broadcastGame(room.id)`; clients automatically return to the lobby, ready to start again.

Config knobs at the top of `server.js`: `MAX_PLAYERS`, `MIN_PLAYERS` (set to `1` to test solo), `EMOJIS`, `ROOM_ID_RE`.

## Scripts

```bash
npm run dev     # dev server with HMR + sockets
npm run build   # production build
npm start       # production server (Linux/Mac; on Windows set NODE_ENV=production first)
npm run smoke   # e2e test (server must be running)
```

## Deploying

Needs a **persistent Node server** (websockets + in-memory rooms) — not serverless platforms like Vercel. Railway, Render, Fly.io, or any VPS works: `npm run build` then `npm start`. Scale beyond one instance by moving room state to Redis (`socket.io-redis` adapter).

## License

MIT — clone it, ship games with it.
