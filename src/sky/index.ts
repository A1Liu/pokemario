import {
	Renderable,
	Sprite,
	RenderableGroup,
	Position,
	vec2equal,
	vec2mul,
	Vector2,
	Size,
} from '../sprite'
import { Game } from '../game'
import { SkyBackground } from './sky'
import { applyTransition, Transitions } from '../transition'
import { KeyboardKey } from '../interaction-monitor'

class Ground extends Renderable {
	velocity: Vector2 = { x: 0, y: 0 }
	position: Vector2 = { x: 0, y: 0 }

	render(game: Game, ctx: CanvasRenderingContext2D): void {
		const camera = game.camera
		const dirtHeight = Math.round(0.15 * camera.height)
		const grassHeight = Math.round(0.01 * camera.height)

		const dirtBox = camera.getScreenBoundingBox(
			{ x: 0, y: 0 },
			camera.width,
			dirtHeight,
		)
		const grassBox = camera.getScreenBoundingBox(
			{ x: 0, y: dirtHeight },
			camera.width,
			grassHeight,
		)

		ctx.fillStyle = `#8e0909`
		ctx.fillRect(dirtBox.x, dirtBox.y, dirtBox.width, dirtBox.height)

		// const grassHeight = Math.round(0.01 * game.height)
		ctx.fillStyle = `green`
		ctx.fillRect(grassBox.x, grassBox.y, grassBox.width, grassBox.height)

		this.position.y = dirtHeight + grassHeight

		const {height, width } = camera.  screenDimensions()
		ctx.textAlign = 'left'
		ctx.textBaseline = 'bottom'
		ctx.font = '24px monospace'
		ctx.fillStyle = '#fff'
		ctx.fillText(`score: ${game.score}`, 10, height - 10 - 24 - 10)

		ctx.textAlign = 'left'
		ctx.textBaseline = 'bottom'
		ctx.font = '24px monospace'
		ctx.fillStyle = '#fff'
		ctx.fillText(
			`time: ${Math.floor(game.timeElapsed / 1e3)}s`,
			10,
			height - 10,
		)

		ctx.textAlign = 'right'
		ctx.textBaseline = 'bottom'
		ctx.font = '24px monospace'
		ctx.fillStyle = '#fff'
		ctx.fillText(`lives: ${game.lives}`, width - 10, height - 10 - 24 - 10)

		ctx.textAlign = 'right'
		ctx.textBaseline = 'bottom'
		ctx.font = '24px monospace'
		ctx.fillStyle = '#fff'
		ctx.fillText(`fps: ${this.getFps()}`, width - 10, height - 10)
	}

	fpsSamples: number[] = []

	getFps() {
		return Math.floor(
			this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length,
		)
	}

	tick(delta: number, game: Game): void {
		this.fpsSamples.push(1e3 / delta)
		this.fpsSamples = this.fpsSamples.slice(0, 1000)
	}
}

export class Landscape extends RenderableGroup<
	Renderable & { velocity: Vector2 }
> {
	direction: 'left' | 'right' | null = null
	currentVelocity: Vector2 = { x: 0, y: 0 }
	walkVelocity: Vector2
	sprintVelocity: Vector2

	readonly ground = new Ground()

	constructor(game: Game) {
		super(
			new Set([
				new SkyBackground(
					{
						x: 0,
						y: 0,
					},
					game,
				),
				new SkyBackground(
					{
						x: game.camera.width,
						y: 0,
					},
					game,
				),
			]),
		)

		this.sprites.add(this.ground)
		this.walkVelocity = { x: 0.01 * game.camera.width, y: 0 }
		this.sprintVelocity = vec2mul(3, this.walkVelocity)
	}

	tick(delta: number, game: Game) {
		const currentDirection = game.monitor.isPressed(KeyboardKey.Right)
			? 'right'
			: game.monitor.isPressed(KeyboardKey.Left)
			? 'left'
			: null
		const velocity = currentDirection
			? game.monitor.isPressed(KeyboardKey.Shift)
				? this.sprintVelocity
				: this.walkVelocity
			: { x: 0, y: 0 }

		this.currentVelocity = applyTransition(
			{
				initial: vec2mul(
					this.direction === 'left' ? 1 : this.direction === 'right' ? -1 : 0,
					velocity,
				),
				target: vec2mul(
					currentDirection === 'left'
						? 1
						: currentDirection === 'right'
						? -1
						: 0,
					velocity,
				),
				state: this.currentVelocity,
				transition: Transitions.linear(250),
			},
			delta,
		)

		if (this.direction !== currentDirection) {
			if (currentDirection) {
				game.player.startRunning(currentDirection)
			} else {
				game.player.stopRunning()
			}
		}

		this.direction = currentDirection
		this.sprites.forEach((sprite) => {
			sprite.velocity = this.currentVelocity
		})

		super.tick(delta, game)
	}
}
