# Socket.IO Room Server

A relay server for multiplayer games using Socket.IO. Hosts create rooms, clients join, and actions flow through the host for consistent ordering.

## Architecture

```
┌─────────────────────────┐
│  Host                   │
│  - Creates room         │
│  - Provides state       │
│  - Orders actions       │
│  - Broadcasts to clients│
└───────────┬─────────────┘
            │
            ▼
┌───────────────────────────────────┐
│  Room Server (lobster.eecs...)   │
│  - Routes messages                │
│  - Manages room lifecycle         │
└───────────────────────────────────┘
            ▲
       ┌────┴────┐
       │         │
┌──────┴──────┐  ┌──────┴──────┐
│  Client A   │  │  Client B   │
│  - Joins    │  │  - Joins    │
│  - Requests │  │  - Submits  │
│    state    │  │    actions  │
└─────────────┘  └─────────────┘
```

## Events

### Host Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `create-room` | → server | Create a room, receive `{ roomId }` |
| `state-request` | ← server | Client requested state, respond via callback |
| `action-submitted` | ← server | Client submitted action `{ actionId, action, fromSocketId }` |
| `broadcast-action` | → server | Broadcast ordered action to all clients |

### Client Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | → server | Join a room by ID |
| `request-state` | → server | Request current state from host |
| `submit-action` | → server | Submit an action to host |
| `state` | ← server | Receive state from host |
| `action` | ← server | Receive broadcast action `{ actionId, action }` |
| `room-closed` | ← server | Room was closed by host |

## Usage with @repo/multiplayer

### Host

```typescript
import { createGameHost } from '@repo/multiplayer';

const host = await createGameHost({
  server: 'https://lobster.eecs.umich.edu',
  getState: () => game.getState(),
  onAction: (action, actionId) => {
    game.applyAction(action);
    host.broadcastAction(action, actionId);
  },
});

console.log(`Share this room code: ${host.roomId}`);
```

### Client

```typescript
import { joinGame } from '@repo/multiplayer';

const client = await joinGame({
  server: 'https://lobster.eecs.umich.edu',
  roomId: 'happy-tiger-42',
  onState: (state) => game.setState(state),
  onAction: (action) => game.applyAction(action),
});

await client.requestState();
client.submitAction({ type: 'guess', word: 'example' });
```

## Server Deployment

### Docker

```bash
docker build -t room-server .
docker run -d -p 3001:3001 --name rooms room-server
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CORS_ORIGIN` | `*` | Allowed origins |

### Caddy Configuration

```caddyfile
lobster.eecs.umich.edu {
    handle /socket.io/* {
        reverse_proxy localhost:3001
    }
}
```
