import { Game } from './game'

const canvas = document.getElementById(
	'canvas',
) as any as HTMLCanvasElement | null
const ctx = canvas?.getContext('2d')

if (!canvas || !ctx) {
	alert('Failed to load game.')
} else {
	const game = new Game(canvas.width, canvas.height)
	const render = (lastRenderedAt: number) => {
		canvas.width = canvas.getBoundingClientRect().width
		canvas.height = canvas.getBoundingClientRect().height

		const now = Date.now()
		game.tick(now - lastRenderedAt)
		game.render(canvas, ctx)
		requestAnimationFrame(() => render(now))
	}
	requestAnimationFrame(render.bind(null, Date.now()))
}
