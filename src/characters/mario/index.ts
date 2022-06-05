import { applyVelocity, Renderable, Size, Vector2 } from '../../sprite'
import { clamp } from '../../utils'
import { Game } from '../../game'
import { ImageLoader } from '../../image-loader'
import { projectSizeByHeight } from '../../utils'
import { KeyboardKey } from '../../interaction-monitor'

class SpriteSheet implements Renderable {
	spriteOffset: Vector2 = { x: 0, y: 0 }
	position: Vector2 = { x: 0, y: 0 }
	velocity: Vector2 = { x: 0, y: 0 }

	constructor(
		public image: HTMLImageElement,
		public spriteSize: Size,
		public size: Size,
	) {}

	selectSprite(x: number, y: number) {
		this.spriteOffset = {
			x: x * this.spriteSize.width,
			y: y * this.spriteSize.height,
		}
	}

	render(game: Game, ctx: CanvasRenderingContext2D): void {
		const position = { ...this.position }

		const bbox = game.camera.getScreenBoundingBox(
			position,
			this.size.width,
			this.size.height,
		)

		console.log({ bbox })

		if (this.imageScale.x < 0) {
			bbox.x = -(bbox.x + bbox.width)
		}

		console.log({
			spriteOffset: this.spriteOffset,
			spriteSize: this.spriteSize,
			bbox,
		})

		ctx.drawImage(
			this.image,
			this.spriteOffset.x,
			this.spriteOffset.y,
			this.spriteSize.width,
			this.spriteSize.height,
			bbox.x,
			bbox.y,
			bbox.width,
			bbox.height,
		)
	}
}

export class MarioCharacter extends SpriteSheet {
	readonly standingFrames: Vector2[] = [{ x: 0, y: 0 }]
	readonly runningFrames: Vector2[] = [
		{ x: 1, y: 0 },
		{ x: 2, y: 0 },
		{ x: 3, y: 0 },
		{ x: 4, y: 0 },
	]
	readonly jumpingFrames: Vector2[] = [{ x: 5, y: 0 }]
	readonly timeBetweenFrames = 70

	currentFrameIndex = 0
	currentFrames: Vector2[] = this.standingFrames
	imageScale: Vector2 = { x: -1, y: 1 }
	lastFrameRenderedSince = 0
	isAirborne: boolean = false

	constructor() {
		super(
			ImageLoader.load('/assets/mario.png'),
			{
				width: 245,
				height: 364.25,
			},
			{
				width: 13, // width: 135,
				height: 22, // height: 225,
			},
		)
	}

	startRunning(direction: 'left' | 'right') {
		this.currentFrameIndex = 0
		this.currentFrames = this.runningFrames
		this.imageScale = direction === 'left' ? { x: 1, y: 1 } : { x: -1, y: 1 }
	}

	stopRunning() {
		this.currentFrameIndex = 0
		this.currentFrames = this.standingFrames
	}

	isLeft(): boolean {
		return this.imageScale.x > 0
	}

	nextFrame() {
		if (++this.currentFrameIndex >= this.currentFrames.length) {
			this.currentFrameIndex = 0
		}
		const frame = this.currentFrames[this.currentFrameIndex]!
		this.selectSprite(frame.x, frame.y)
		this.lastFrameRenderedSince = 0
	}

	tick(delta: number, game: Game) {
		if (game.monitor.isPressed(KeyboardKey.Up) && !this.isAirborne) {
			this.currentFrameIndex = 0
			this.currentFrames = this.jumpingFrames

			const dir = this.isLeft() ? -1 : 1
			this.velocity = { x: dir * 15, y: 30 }
			this.isAirborne = true
		}

		if (this.lastFrameRenderedSince + delta > this.timeBetweenFrames) {
			this.nextFrame()
		} else {
			this.lastFrameRenderedSince += delta
		}

		applyVelocity(delta, this.position, this.velocity)
		this.velocity.y -= 0.2 * delta

		// applies a friction force when mario hits the ground.
		if (!this.isAirborne && this.velocity.x !== 0) {
			// Friction is applied in the opposite direction of velocity
			const dir = this.velocity.x < 0 ? 1 : -1
			let friction = dir * 0.05 * delta

			// You cannot gain speed in the opposite direction from friction
			this.velocity.x = clamp(this.velocity.x + friction, 0, Infinity)
		}

		const groundY = game.landscape.ground.position.y

		if (this.position.y < groundY) {
			if (this.isAirborne) {
				this.isAirborne = false
				this.currentFrameIndex = 0
				this.currentFrames = this.standingFrames
			}

			this.position.y = groundY
			this.velocity.y = 0
		}
	}

	render(game: Game, ctx: CanvasRenderingContext2D) {
		ctx.save()
		ctx.scale(this.imageScale.x, this.imageScale.y)
		super.render(game, ctx)
		ctx.restore()
	}
}
