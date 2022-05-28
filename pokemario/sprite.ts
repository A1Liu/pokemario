import { Game } from "./game";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export abstract class Sprite {
  image: HTMLImageElement | null = null;

  constructor(
    public position: Position,
    public size: Size,
    public assetPath: string
  ) {}

  getAssetImage() {
    if (this.image?.src !== this.assetPath) {
      const image = new Image();
      image.src = this.assetPath;
      this.image = image;
    }
    return this.image!;
  }

  abstract tick(delta: number, game: Game): void;

  // if the two things are juuuuuust about to collide, this will return a zero vector instead of returning undefined.
  collisionVector(other: Sprite): Vector2 | undefined {
    const { x: otherX1, y: otherY1 } = other.position;
    const otherX2 = other.position.x + other.size.width;
    const otherY2 = other.position.y + other.size.height;

    const { x: selfX1, y: selfY1 } = other.position;
    const selfX2 = other.position.x + other.size.width;
    const selfY2 = other.position.y + other.size.height;

    // other is too far left or far right to collide
    if (otherX1 > selfX2 || selfX1 > otherX1) return undefined;
    if (otherY1 > selfY2 || selfY1 > otherY1) return undefined;

    return {
      x: otherX1 - selfX1,
      y: otherY1 - selfY1,
    };
  }

  render(game: Game, ctx: CanvasRenderingContext2D) {
    const image = this.getAssetImage();
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  }
}

export class Enemy extends Sprite {
  private velocity: Vector2 = { x: 0, y: 0 };
  private anchoredOn: Sprite | undefined = undefined;
  private isWalkLeft: boolean = true;
  private walkSpeed: number = 1.0;

  constructor(position: Position, size: Size, assetPath: string) {
    super(position, size, assetPath);
  }

  tick(delta: number, game: Game): void {
    // Simulate walking or freefall
    if (this.anchoredOn) {
      this.position.x += delta * this.walkSpeed;
    } else {
      this.position.x += delta * this.velocity.x;
      this.position.y += delta * this.velocity.y;
    }

    // Check if we can still anchor
    if (this.anchoredOn) {
      // speed and direction!
      const vector = this.collisionVector(this.anchoredOn);
      if (!vector) {
        this.anchoredOn = undefined;
      } else {
        this.position.x += vector.x;
        this.position.y += vector.y;
      }
    }
  }

  render(game: Game, ctx: CanvasRenderingContext2D): void {}
}

export class PokeMan extends Sprite {
  constructor(position: Position, size: Size, assetPath: string) {
    super(position, size, assetPath);
  }

  tick(delta: number, game: Game): void {}

  render(game: Game, ctx: CanvasRenderingContext2D): void {}
}

export class Block extends Sprite {
  constructor(position: Position, size: Size, assetPath: string) {
    super(position, size, assetPath);
  }

  tick(delta: number, game: Game): void {
    // Do nothing
  }

  render(game: Game, ctx: CanvasRenderingContext2D): void {}
}
