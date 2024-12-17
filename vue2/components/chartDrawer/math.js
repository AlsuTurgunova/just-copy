export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  div(scale) {
    return new Point(
      Math.floor(this.x / scale),
      Math.floor(this.y / scale)
    );
  }

  eq(point) {
    return this.x === point.x && this.y === point.y;
  }
}

export class Rectangle {
  x;
  y;
  w;
  h;

  static fromSize(point, w, h) {
    let rect = new Rectangle();
    rect.x = point.x;
    rect.y = point.y;
    rect.w = w;
    rect.h = h;
    return rect;
  }

  normalize() {
    if(this.w < 0) {
      this.x += this.w;
      this.w *= -1;
    }
    if(this.h < 0) {
      this.y += this.h;
      this.h *= -1;
    }
  }

  isInside(point) {
    return point.x >= this.x && point.x <= this.x + this.w &&
      point.y >= this.y && point.y <= this.y + this.h
  }

  addMargin(margin) {
    return Rectangle.fromSize(
      new Point(
        this.x - margin,
        this.y - margin
      ),
      this.w + 1 + margin * 2,
      this.h + 1 + margin * 2,
    )
  }

  width() {
    return this.w;
  }

  height() {
    return this.h;
  }

  bb() {
    return { minX: this.x, maxX: this.x + this.w, minY: this.y, maxY: this.y + this.h };
  }
}