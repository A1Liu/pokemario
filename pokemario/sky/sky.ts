import {
  Position,
  Renderable,
  Size,
  Sprite,
  RenderableGroup,
  Vector2,
  applyVelocity,
} from "../sprite";
import { Game } from "../game";
import { ImageLoader } from "../image-loader";
import cloud from "./cloud.svg";
import { filterSet, pickOne, projectSizeByWidth, randInt } from "../utils";
import { applyTransition, Transitions } from "../transition";

const cloudWidths = [100, 150, 200, 250];
const minCloudsPerScreen = 1;
const maxCloudsPerScreen = 5;

class Cloud {
  opacity = 0;
  sprite: Sprite;
  velocity: Vector2 = { x: 0, y: 0 };
  position: Vector2 = { x: 0, y: 0 };
  size = { width: 0, height: 0 };

  constructor(position: Position) {
    this.opacity = 0;
    this.sprite = new Sprite(
      position,
      projectSizeByWidth(cloud, pickOne(cloudWidths)),
      ImageLoader.load(cloud.src)
    );
    this.position = this.sprite.position;
    this.size = this.sprite.size;
  }

  tick(delta: number, game: Game) {
    this.opacity = applyTransition(
      {
        initial: { opacity: 0 },
        target: { opacity: 1 },
        state: { opacity: this.opacity },
        transition: Transitions.linear(250),
      },
      delta
    ).opacity;
    applyVelocity(this.sprite.position, this.velocity);
    this.position = this.sprite.position;
    this.size = this.sprite.size;
  }

  render(game: Game, ctx: CanvasRenderingContext2D) {
    this.sprite.render(game, ctx);
  }
}

export class SkyBackground implements Renderable {
  velocity: Vector2 = { x: 0, y: 0 };
  size: Size = { width: 0, height: 0 };
  clouds: Set<Cloud> = new Set();

  constructor(public position: Position, game: Game) {
    this.size.width = game.width;
    this.size.height = game.height;
    this.createNewClouds(game);
  }

  createNewClouds(game: Game) {
    const targetCloudCount = randInt(minCloudsPerScreen, maxCloudsPerScreen);
    while (targetCloudCount > this.clouds.size) {
      this.clouds.add(
        new Cloud({
          x: randInt(0, game.width),
          y: randInt(0, Math.round((2 / 3) * game.height)),
        })
      );
    }
  }

  tick(delta: number, game: Game) {
    this.position.x += this.velocity.x;
    if (this.velocity.x < 0 && this.position.x < -this.size.width) {
      this.position.x = this.size.width;
    }
    if (this.velocity.x > 0 && this.position.x >= this.size.width) {
      this.position.x = -this.size.width;
    }

    // Check if any clouds are off-screen
    const numSpritesBefore = this.clouds.size;
    filterSet(this.clouds, (cloud) => {
      return (
        cloud.position.x + cloud.size.width >= 0 &&
        cloud.position.x <= game.width
      );
    });
    if (numSpritesBefore > this.clouds.size) {
      this.createNewClouds(game);
    }

    this.clouds.forEach((cloud) => {
      cloud.velocity = this.velocity;
      cloud.tick(delta, game);
    });
  }

  render(game: Game, ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
    gradient.addColorStop(0, "#5ac9ff");
    gradient.addColorStop(1, "white");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);

    this.clouds.forEach((cloud) => cloud.render(game, ctx));
  }
}
