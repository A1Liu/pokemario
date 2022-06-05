import { Renderable, Sprite, Position } from './sprite'
import { Landscape } from './sky'
import { InteractionMonitor, KeyboardKey } from './interaction-monitor'
import { MarioCharacter } from './characters/mario'
import { clamp } from './utils'

export class Camera {
	locked: boolean = true
	position: Position = { x: 0, y: 0 }
	width: number = 20
	height: number = 25
	worldToPixel: number = 10

	constructor() {}

	tick(delta: number, game: Game): void {
		if (!this.locked) return

		// TODO implement camera locking on mario
		// const pos = game.player.position;

		// this.position = { x: clamp(pos.x  - 20, 0, game.height), y: clamp(pos.y - 1, 0, game.width) };
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
	//  1 |      C    ^
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
	//   . |     o
	//  90 |    -^-
	// 100 |C    ^
	//   0 |------------------------
	//     0  1  2  3  . . .  9 10 X
	screenSpaceCoordinates(position: Position): Position {
		const posXInCameraSpace = position.x - this.position.x
		const posYInCameraSpace = position.y - this.position.y

		const posXInCanvasSpace = posXInCameraSpace * this.worldToPixel
		const posYInCanvasSpace =
			(this.height - posYInCameraSpace) * this.worldToPixel
		return { x: posXInCanvasSpace, y: posYInCanvasSpace }
	}

	screenSpaceDimensions(
		width: number,
		height: number,
	): { width: number; height: number } {
		return {
			width: width * this.worldToPixel,
			height: height * this.worldToPixel,
		}
	}

	screenDimensions(): { width: number; height: number } {
		return {
			width: this.width * this.worldToPixel,
			height: this.height * this.worldToPixel,
		}
	}

	getScreenBoundingBox(
		position: Position,
		width: number,
		height: number,
	): { x: number; y: number; width: number; height: number } {
		const coords = this.screenSpaceCoordinates(position)
		const screenHeight = height * this.worldToPixel

		return {
			x: coords.x,
			y: coords.y - screenHeight,
			width: width * this.worldToPixel,
			height: screenHeight,
		}
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
		this.camera = new Camera()

		this.camera.width = canvas.width / this.camera.worldToPixel
		this.camera.height = canvas.height / this.camera.worldToPixel

		this.landscape = new Landscape(this)
		this.player = new MarioCharacter()

		this.renderables.push(this.landscape, this.player)
	}

	destroy() {
		this.monitor.destroy()
	}

	tick(canvas: HTMLCanvasElement, delta: number): void {
		this.width = canvas.width
		this.height = canvas.height

		this.camera.width = canvas.width / this.camera.worldToPixel
		this.camera.height = canvas.height / this.camera.worldToPixel

		this.timeElapsed += delta
		for (const renderable of this.renderables) {
			renderable.tick(delta, this)
		}

		this.camera.tick(delta, this)
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, this.width, this.height)

		for (const renderable of this.renderables) {
			renderable.render(this, ctx)
		}
	}
}
