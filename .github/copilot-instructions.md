# Asteroids Game - AI Agent Guidelines

## Overview
This is a browser-based Asteroids game built with Three.js and PeerJS. The project is designed for training AI models and exports game data in CSV format. Players control a triangle to shoot asteroids while avoiding collisions.

## Code Style
- **JavaScript**: Modern ES6+ with modules. Use ES import/export syntax
- **Naming conventions**: camelCase for variables and functions, descriptive names for game entities
- **Inline styles**: Used for UI elements like score display and life counter (consider consolidating to CSS later)
- **File structure**: Keep game logic in `index.js`, controls in `controls.js`, with HTML in respective `.html` files

See [index.js](index.js) for the primary game logic and animation loop patterns.

## Architecture

### Core Components
1. **Three.js Scene** (`index.js`): Handles 3D rendering with camera, lighting, and game objects
   - `scene`: Main Three.js scene container
   - `group`: Holds all game objects including camera, lights, player, bullets, asteroids
   - `renderer`: WebGL renderer that updates on animation frames

2. **Game State** (`index.js`):
   ```javascript
   const state = { shot: false, score: 0, lives: 10 };
   ```
   - `shot`: Boolean flag for active bullet fire
   - `score`: Player score from asteroid collisions
   - `lives`: Player life counter (game over at 0)

3. **Player Entity**: Triangle mesh at `group`'s center
   - Position: `triangle.position` (x, y, z)
   - Rotation: `triangle.rotation.z` (z-axis rotation)
   - Movement: Controlled via `moves` object with `rotation` and `forward` values

4. **Animation System**: Three main loops in `animations` object
   - `move()`: Updates triangle position/rotation based on `moves` state
   - `bullet()`: Spawns bullets on spacebar, handles collision detection with asteroids
   - `asteroid()`: Spawns asteroids at random positions, checks collision with player

5. **Multiplayer (PeerJS)**: Peer-to-peer connection with QR code sharing
   - `peer`: Peer instance from PeerJS library
   - `toggleQRcode()`: Generates shareable control link via QR code

### Data Flow
```
User Input (keyboard) → moves/state → Animation Loops → 
Collision Detection → Score/Lives Update → Render
```

## Build and Test

### Install and Run
```bash
npm ci              # Install dependencies (http-server)
npm start           # Start local server at http://localhost:8080
```

Navigate to `http://localhost:8080` to play the main game.
Navigate to `http://localhost:8080/controls.html?peer=PEER_ID` for multiplayer controls.

### Development Notes
- The game uses ES modules with import maps in [index.html](index.html)
- Three.js, PeerJS, and dat.gui are loaded via CDN
- Collision detection uses distance calculations between meshes
- Asteroid and bullet lifecycle is managed with `setInterval()` and manual cleanup

## Project Conventions

### Geometry & Collision
- **Player**: BufferGeometry triangle with gradient colors
- **Bullets**: Small spheres (0.1 radius) with orange color
- **Asteroids**: Plane geometry (1.0x1.0) with gray color
- **Collision threshold**: Bullets-to-asteroids = 0.3 distance units, Asteroids-to-player = 0.5 distance units
- **Boundary**: Objects are removed when position exceeds ±100 on x or y axis

### Scoring System
- Hit asteroid: +1 point
- Hit by asteroid: -1 point (also loses 1 life)
- Game reset on 0 lives (alert displayed, score/lives reset)

### Event System
- Custom `EventTarget` (`ee`) dispatches events like `peer.open`
- Keyboard events handled via `keydown`/`keyup` listeners
- Window resize event updates camera aspect ratio and renderer size

### Game Loop
- `requestAnimationFrame()` drives the main animation loop
- `setInterval()` spawns asteroids every 1000ms
- Bullet and asteroid movement use `setInterval()` at 16ms and 500ms respectively

## Integration Points

### External Dependencies
- **Three.js (v0.182.0)**: 3D graphics and rendering
- **PeerJS (v1.5.5)**: WebRTC peer-to-peer connections for multiplayer
- **dat.gui (v0.7.9)**: UI controls (imported but not currently used)

### Network Communication
- PeerJS opens a connection and generates a unique peer ID
- Uses QR code API (`https://api.qrserver.com/v1/create-qr-code/`) to generate shareable links
- [controls.html](controls.html) uses URL query parameter `peer` to connect to a game instance

## Security
- QR codes expose the peer ID in the URL—consider this when sharing
- PeerJS handles WebRTC connections directly between peers
- No backend server—all game logic runs client-side

## Game Controls
- **Arrow Left/Right**: Rotate the triangle
- **Arrow Up/Down**: Move forward/backward
- **Spacebar**: Shoot bullet
- **Q**: Toggle QR code display
