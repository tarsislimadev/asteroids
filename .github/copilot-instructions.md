# Asteroids Game - AI Agent Instructions

## Code Style

- **Language**: Modern JavaScript (ES6+) with modules using `import`/`export`
- **Formatting**: ESLint enforced via `npx eslint --fix`
- **Class Pattern**: Extend Three.js classes (`THREE.Mesh`, `THREE.Scene`, `THREE.Camera`, etc.) or native `EventTarget` for game logic
- **Method Names**: Use camelCase with descriptive verbs (e.g., `startRotateLeft()`, `moveForward()`, `removeAsteroid()`)
- **Comments**: Code is self-documenting; add comments only for non-obvious game physics or collision logic
- **Example Style**: See [meshes/player.mesh.js](meshes/player.mesh.js#L1) for Three.js mesh pattern

## Architecture

**Core Game Loop**: [game.js](game.js) extends `EventTarget` and manages:
- Scene graph with Three.js (camera, lights, meshes)
- Keyboard input handling (arrow keys, space for shooting)
- Event-driven gameplay (asteroid creation, collisions, game over)
- Score/lives tracking via [models/score.model.js](models/score.model.js)

**Component Organization**:
- **Meshes** (`meshes/`): 3D geometry—player, asteroids, bullets. Extend `THREE.Mesh`, handle physics
- **Events** (`events/`): Custom event classes dispatched via game's EventTarget (collision detection, boundary checks)
- **Models** (`models/`): Game state (score, lives). Extend base [Model](models/model.js), render to DOM
- **Config** (`config/`): Constants (asteroid speed, radius, colors)
- **Cameras/Lights/Renderers**: THREE.js wrappers for perspective view and WebGL rendering
- **Neural Network** (`neural.network.js`): Stub class—intended for AI agent training (future feature)

**Data Flow**:
1. Keyboard/window events → Player state
2. Game loop (60 FPS) → Update all meshes
3. Physics checks → Collision/boundary events
4. Events → Score updates, entity removal, game state changes

## Build and Test

```bash
npm install          # Install ESLint dev dependencies
npm start            # Start http-server on current directory (visit http://localhost:8080)
npm run lint         # Fix linting issues
```

- No build step—pure ES6 modules in modern browsers
- Test manually in browser; all files are read as-is
- ESLint config: [eslint.config.mjs](eslint.config.mjs)

## Project Conventions

1. **Event Driven Architecture**: All major state changes dispatch events (see [events/](events/) folder). Example: `PlayerShotEvent.NAME` triggers bullet addition
2. **Constructor Patterns**: Meshes accept `group` parameter to self-add to scene. Models create DOM elements in constructor
3. **State Management**: Player uses `state` object for key bindings; Game maintains `asteroids[]` array
4. **Physics**: Linear movement on 2D plane, wrap-around world (tested via `AsteroidOutsideEvent`, `BulletOutsideEvent`)
5. **Collision Model**: Bullet-asteroid detected in game, player-asteroid triggers damage
6. **60 FPS Intervals**: Use `setInterval(..., 1e3 / 60)` for physics updates (see [meshes/player.mesh.js](meshes/player.mesh.js#L25))

## Integration Points

- **Three.js CDN**: Imported via `import * as THREE from 'three'` (uses browser ES module resolution)
- **DOM Renderer**: Game adds renderer canvas and score display to `document.body`
- **CSV Export** (TODO): Future feature for AI training data—integrate export logic into event system
- **Neural Network** (TODO): Class stub ready for supervised learning on game actions

## Future AI Features

- Export game state snapshots (player pos/rot, asteroid positions, bullet trajectories) to CSV on each game tick
- Train [NeuralNetwork](neural.network.js) class on recorded game sessions
- Implement agent-controlled player mesh for reinforcement learning
- Reference score/lives tracking as reward signals

---

**Last Updated**: February 2026
