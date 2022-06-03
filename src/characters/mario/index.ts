import { applyVelocity, Renderable, Size, Vector2 } from '../../sprite'
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
		ctx.drawImage(
			this.image,
			this.spriteOffset.x,
			this.spriteOffset.y,
			this.spriteSize.width,
			this.spriteSize.height,
			this.position.x,
			this.position.y,
			this.size.width,
			this.size.height,
		)
	}

	tick(delta: number, game: Game): void {
		applyVelocity(this.position, this.velocity)
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

	constructor(public relPosition: Vector2) {
		super(
			ImageLoader.load('/assets/mario.png'),
			{
				width: 245,
				height: 364.25,
			},
			projectSizeByHeight(
				{
					width: 135,
					height: 225,
				},
				100,
			),
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

	nextFrame() {
		if (++this.currentFrameIndex >= this.currentFrames.length) {
			this.currentFrameIndex = 0
		}
		const frame = this.currentFrames[this.currentFrameIndex]!
		this.selectSprite(frame.x, frame.y)
		this.lastFrameRenderedSince = 0
	}

	tick(delta: number, game: Game) {
		if (game.monitor.isPressed(KeyboardKey.Up)) {
			this.currentFrameIndex = 0
			this.currentFrames = this.jumpingFrames
			this.velocity = { x: 1, y: 1 }
		}

		if (this.lastFrameRenderedSince + delta > this.timeBetweenFrames) {
			this.nextFrame()
		} else {
			this.lastFrameRenderedSince += delta
		}

		this.position = {
			x: this.imageScale.x === -1 ? -this.size.width : 0,
			y: this.relPosition.y - this.size.height,
		}
		super.tick(delta, game)
	}

	render(game: Game, ctx: CanvasRenderingContext2D) {
		ctx.save()
		ctx.scale(this.imageScale.x, this.imageScale.y)
		super.render(game, ctx)
		ctx.restore()
	}
}
