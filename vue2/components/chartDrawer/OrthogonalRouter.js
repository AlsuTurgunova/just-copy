import { Point } from "./math";

export class OrthogonalRouter {
  constructor(grid) {
    this.grid = grid;
    this.directions = [
      [0, 1],  // Право
      [1, 0],  // Вниз
      [0, -1], // Влево
      [-1, 0]  // Вверх
    ];

  }

  /**
   * Добавляет "препятствие" для расчётов путей
   * @param {Rectangle} rect
   */
  addObstacle(rect) {
    for (let y = rect.y; y < rect.y + rect.height(); y++) {
      for (let x = rect.x; x < rect.x + rect.width(); x++) {
        if (this.isInBounds(new Point(x, y))) {
          this.grid[x][y] = 1;
        }
      }
    }
  }

  isInBounds(p) {
    return p.x >= 0 && p.y >= 0 && p.x < this.grid.length && p.y < this.grid[0].length;
  }

  walkCost(p) {
    if(!this.isInBounds(p)) {
      return 1;
    }
    return this.grid[p.x][p.y];
  }

  heuristic(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  /**
   * A* алгоритм
   * @param {Point} start
   * @param {Point} goal
   * @returns {null|Point[]}
   */
  aStar(start, goal) {
    const priorityQueue = [];
    const cameFrom = {};
    const costSoFar = {};
    const serialize = (point) => `${point.x},${point.y}`;

    priorityQueue.push({ cost: 0, position: start });
    cameFrom[serialize(start)] = null;
    costSoFar[serialize(start)] = 0;

    while (priorityQueue.length > 0) {
      priorityQueue.sort((a, b) => a.cost - b.cost);
      const current = priorityQueue.shift().position;

      if (current.eq(goal)) {
        const path = [];
        let currentPoint = current;
        while (currentPoint) {
          path.push(currentPoint);
          this.grid[currentPoint.x][currentPoint.y] += 0.5;
          currentPoint = cameFrom[serialize(currentPoint)];
        }
        return path.reverse();
      }

      for (const [dx, dy] of this.directions) {
        const next = new Point(current.x + dx, current.y + dy);

        let walkCost = this.walkCost(next);
        if (walkCost >= 1) continue;

        const newCost = costSoFar[serialize(current)] + 1 + walkCost;
        const serializedNext = serialize(next);

        if (!(serializedNext in costSoFar) || newCost < costSoFar[serializedNext]) {
          costSoFar[serializedNext] = newCost;
          const priority = newCost + this.heuristic(next, goal);
          priorityQueue.push({ cost: priority, position: next });
          cameFrom[serializedNext] = current;
        }
      }
    }

    return null;
  }
}