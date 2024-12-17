import { OrthogonalRouter } from "./OrthogonalRouter";
import { Point, Rectangle } from "./math";

export class ChartDrawer {
  constructor(canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // Масштаб, насколько сетка меньше размера canvas
    // 1 = не уменьшать сетку, влияет на производительность
    this.scale = 10;
    // Отступ соединений от фигур (с учётом масштаба)
    // Нужен для красоты, при расчётах путей, чтобы они шли на расстоянии от фигур
    this.figureMargin = 1;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    /** @type {Rectangle[]} */
    this.rectangles = [];
    /** @type {{start: Point, end: Point, path: Point[]}[]} */
    this.arrows = [];
    /** @type {Point|null} */
    this.startPoint = null;
    /** @type {Point|null} */
    this.endPoint = null;
    /** @type {Rectangle|null} */
    this.currentRectangle = null;
    this.isWorking = true;
    // Класс для расчётов путей
    this.router = new OrthogonalRouter(Array.from(
      { length: this.scaleDown(this.canvas.width) },
      () => Array(this.scaleDown(this.canvas.height)).fill(0)
    ));
    // Толщина пути
    this.pathThickness = 4;
    // Цвет пути
    this.pathColor = 'red';
    // Цвет фигур
    this.rectColor = 'rgb(0, 128, 255)';

    this.initEvents();
    this.render();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.isWorking = false;
  }

  onMouseDown = (event) => {
    const pos = this.getMousePosition(event);

    const clickedRect = this.rectangles.find(rect => rect.isInside(pos));

    if (clickedRect && !this.startPoint) {
      this.startPoint = this.getNearestEdgePoint(clickedRect, pos, true);
    } else {
      this.currentRectangle = Rectangle.fromSize(pos, 0, 0);
    }
  }

  onMouseMove = (event) => {
    const pos = this.getMousePosition(event);
    if (this.currentRectangle) {
      this.currentRectangle.w = pos.x - this.currentRectangle.x;
      this.currentRectangle.h = pos.y - this.currentRectangle.y;
    } else if (this.startPoint) {
      this.endPoint = pos;
    }
  }

  onMouseUp = (event) => {
    if (this.currentRectangle) {
      this.currentRectangle.normalize();
      this.rectangles.push(this.currentRectangle);
      this.router.addObstacle(this.currentRectangle.addMargin(this.figureMargin));
    } else if (this.startPoint) {
      const origEnd = this.getMousePosition(event);
      const origStart = this.startPoint;

      // Проверка чтобы конец пути находился в фигуре
      const endRectangle = this.rectangles.find(rect => rect.isInside(origEnd));
      const startRectangle = this.rectangles.find(rect => rect.isInside(origStart));

      if (endRectangle && startRectangle) {
        let endPoint = this.getNearestEdgePoint(endRectangle, origEnd);
        let startPoint = this.getNearestEdgePoint(startRectangle, origStart);

        let path = this.router.aStar(startPoint, endPoint);
        if (path) {
          this.arrows.push({ start: origStart, end: origEnd, path: path });
        }
      }
    }

    this.startPoint = null;
    this.endPoint = null;
    this.currentRectangle = null;
  }

  /**
   * Возвращает координату ближайшей к точке стороны фигуры
   * @param {Rectangle} rect фигура
   * @param {Point} point точка
   * @param skipMargin не учитывать отступ
   * @returns {Point}
   */
  getNearestEdgePoint(rect, point, skipMargin = false) {
    // Отступ точки начала или конца, если точка будет в фигуре. То рассчитать путь не получится
    let defMargin = skipMargin ? 0 : this.figureMargin + 1;
    let { minX, maxX, minY, maxY } = rect.bb();
    const distances = [
      { x: minX - defMargin, y: Math.min(Math.max(point.y, minY), maxY) }, // Левая сторона
      { x: maxX + defMargin, y: Math.min(Math.max(point.y, minY), maxY) }, // Правая сторона
      { x: Math.min(Math.max(point.x, minX), maxX), y: minY - defMargin }, // Верхняя сторона
      { x: Math.min(Math.max(point.x, minX), maxX), y: maxY + defMargin }, // Нижняя сторона
    ];

    // Находим ближайшую точку
    let closestPoint = distances[0];
    let minDistance = Math.hypot(point.x - distances[0].x, point.y - distances[0].y);
    for (let i = 1; i < distances.length; i++) {
      const dist = Math.hypot(point.x - distances[i].x, point.y - distances[i].y);
      if (dist < minDistance) {
        closestPoint = distances[i];
        minDistance = dist;
      }
    }

    return new Point(closestPoint.x, closestPoint.y);
  }

  scaleDown(coordinate) {
    return Math.floor(coordinate / this.scale);
  }

  scaleUp(coordinate) {
    return coordinate * this.scale;
  }

  getMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return new Point(event.clientX - rect.left, event.clientY - rect.top).div(this.scale);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Рендерим предпросмотр рисуемой фигуры
    if (this.currentRectangle) {
      this.ctx.strokeStyle = 'black';
      this.strokeRect(this.currentRectangle);
    }

    // Рендерим пути между фигурами
    this.arrows.forEach(arrow => {
      this.ctx.strokeStyle = this.pathColor;
      this.ctx.lineWidth = this.pathThickness;
      this.ctx.beginPath();
      this.moveTo(arrow.start);
      arrow.path.forEach((pos) => this.lineTo(pos));
      this.lineTo(arrow.end);
      this.ctx.stroke();
    });

    // Рендерим фигуры
    this.rectangles.forEach(rect => {
      this.ctx.fillStyle = this.rectColor;
      this.fillRect(rect);
    });

    // Рендерим предпросмотр пути
    if (this.startPoint && this.endPoint) {
      this.ctx.strokeStyle = this.pathColor;
      this.ctx.beginPath();
      this.moveTo(this.startPoint);
      this.lineTo(this.endPoint);
      this.ctx.stroke();
    }

    if (this.isWorking) {
      requestAnimationFrame(this.render.bind(this));
    }
  }

  fillRect(rect) {
    this.ctx.fillRect(
      this.scaleUp(rect.x),
      this.scaleUp(rect.y),
      this.scaleUp(rect.w),
      this.scaleUp(rect.h),
    );
  }

  strokeRect(rect) {
    this.ctx.strokeRect(
      this.scaleUp(rect.x),
      this.scaleUp(rect.y),
      this.scaleUp(rect.w),
      this.scaleUp(rect.h),
    );
  }

  moveTo(point) {
    this.ctx.moveTo(
      this.scaleUp(point.x),
      this.scaleUp(point.y),
    );
  }

  lineTo(point) {
    this.ctx.lineTo(
      this.scaleUp(point.x),
      this.scaleUp(point.y),
    );
  }
}