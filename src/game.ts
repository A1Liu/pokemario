import { Renderable, Sprite, Position } from './sprite'
import { Landscape } from './sky'
import { InteractionMonitor, KeyboardKey } from './interaction-monitor'
import { MarioCharacter } from './characters/mario'
import { clamp } from './utils';

// camera algo
// x: clamp(mario.pos.x, 0, map.width) -> -20meters -> transform to image space
// y: clamp(mario.pos.y + 5, 0, map.width) -> - 5meters -> transform to image space

// 1 s

export class Camera {
	locked: boolean = true;
	position: Position = { x: 0, y: 0};
	width: number = 20
	height: number = 10
	worldToPixel: number = 10

	constructor() {
	}

	tick(delta: number, game: Game): void {
		if (!this.locked) return;

		const pos = game.player.position;

		this.position = { x: clamp(pos.x  - 20, 0, game.height), y: clamp(pos.y - 1, 0, game.width) };
	}

	// World-space: (C is bottom-left of camera)
	// Y  |
	// 10 |
	//  9 |
	//  . |
	//  . |
	//  . |
	//  3 |           o
	//  2 |          -^-
	//  1 |       C   ^
	//  0 |------------------------
	//    0  1  2  3  . . .  9 10 X
	//
	// canvas-space:
	//  Y  |
	//   0 |
	//  10 |
	//  20 |
	//   . |
	//   . |
	//   . |    o
	//  90 |   -^-
	// 100 |C   ^
	//    0 |------------------------
	//     0  1  2  3  . . .  9 10 X
	screenSpaceCoordinates(position: Position): Position {
		const cameraX = position.x - this.position.x;
		const cameraY = position.y - this.position.y;

		const canvasX = cameraX * this.worldToPixel	;
		const canvasY = (this.height - cameraY) * this.worldToPixel;
		return {x: canvasX, y: canvasY}
	}
}

export class Game {
	score: number = 0
	timeElapsed = 0
	renderables: Renderable[] = []
	monitor = new InteractionMonitor()

	landscape: Landscape
	// TODO: Make this a super class
	player: MarioCharacter
	camera: Camera

	// TODO: move this into main player
	lives: number = 3

	constructor(public width: number, public height: number) {
		this.landscape = new Landscape(this)
		this.player = new MarioCharacter(this.landscape.ground.position)

		this.renderables.push(this.landscape, this.player)
		this.camera = new Camera()
	}

	destroy() {
		this.monitor.destroy()
	}

	tick(canvas: HTMLCanvasElement, delta: number): void {
		this.width = canvas.width
		this.height = canvas.height

		this.timeElapsed += delta
		for (const renderable of this.renderables) {
			renderable.tick(delta, this)
		}

		this.camera.tick(delta, this);
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, this.width, this.height)

		for (const renderable of this.renderables) {
			renderable.render(this, ctx)
		}
	}
}
