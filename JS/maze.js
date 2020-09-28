function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function drawLine(ctx, x, y, x2, y2, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawSquare(ctx, x, y, width, heigth, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, width, heigth);
}

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
  }

class MazeNode {
    visited = false;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Maze {

    constructor(posX, posY, width, height, pxWidth, pxHeight) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.pxWidth = pxWidth;
        this.pxHeight = pxHeight;

        this.vertAmount = width * height;
        this.grid = [];
        this.vertices = new Map()

        this.generateGrid();
    }

    addVertex(v) {
        this.vertices.set(v, []);
    }


    addEdge(a, b, posInArr) {
        this.vertices.get(a)[posInArr] = b;
    }

    removeWall(a, b) {
        var index = this.vertices.get(a).indexOf(b);
        if (index > -1) {
            this.vertices.get(a).splice(index, 1);
        }

        index = this.vertices.get(b).indexOf(a);
        if (index > -1) {
            this.vertices.get(b).splice(index, 1);
        }
    }

    hasWall(a, b) {
       
    }

    generateGrid() {
        // Generate nodes
        for (var x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (var y = 0; y < this.height; y++) {
                var node = new MazeNode(x, y);
                this.grid[x][y] = node;
                this.addVertex(node);
            }
        }

        // Set neighbours
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var node = this.grid[x][y];
                var neighbour;
                if (this.grid[x][y+1] != undefined) {
                    neighbour = this.grid[x][y+1];
                    this.addEdge(node, neighbour, 0);
                }
                if (this.grid[x+1] != undefined) {
                    neighbour = this.grid[x+1][y];
                    this.addEdge(node, neighbour, 1);
                }
                if (this.grid[x][y-1] != undefined) {
                    neighbour = this.grid[x][y-1];
                    this.addEdge(node, neighbour, 2);
                }
                if (this.grid[x-1] != undefined) {
                    neighbour = this.grid[x-1][y]
                    this.addEdge(node, neighbour, 3);
                }
            }
        }
    }

    generateMaze() {
        throw new Error('You have to implement the method!');
    }

    drawMaze(c, ctx) {
        // Find wall size and direction:
        
        var squarePosX = c.width / 10;
        var squarePosY = c.height / 10;
        var squareWidth = c.width - 2 * c.width / 10;
        var squareHeight = c.height - 2 * c.height / 10;
        var gridPosX = squarePosX;
        var gridPosY = squarePosY;

        // Wall width:
        var wallWidth = squareWidth / this.width;
        var wallHeight = squareHeight / this.height;

        // Draw edges:
        // Need egde position, need to know if vertical or horizontal base on 
        // Draw all edges for each node / cell (so only the walls from the cell get drawn, down worry about optimalisation)
        // North wall of a cell: x = nodePosX, y = nodePosY + wallHeight, x2 = ndoePosX + wallWidth, y2 = nodePosY + wallHeight
        // East wall of a cell: x = nodeposX + wallWidth, y = nodePosY, x2 = nodePosX + width, y2 = nodePosY + heigth
        // South wall of a cell: x = nodePosX, y = nodePosY, x2 = nodePosX + width, y2 = nodePosY
        // West wall of a cell: x = nodePosX, y = nodePosY, x2 = nodePosX, y2 = nodePosY + height
        // Check wether current node and neighbours NESW have a wall in common

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var node = this.grid[x][y]
                var neighbours = this.vertices.get(node);
                for (var i = 0; i < 4; i++) { // For loop to 4 because max 4 neighbours
                    if (neighbours[i] != undefined) {
                        switch (i) {
                            case 0:
                                drawLine(ctx, gridPosX + x * wallWidth, gridPosY + y * wallHeight + wallHeight, gridPosX + x * wallWidth + wallWidth, gridPosY + y * wallHeight + wallHeight);
                                break;
                            case 1:
                                drawLine(ctx, gridPosX + x * wallWidth + wallWidth, gridPosY + y * wallHeight, gridPosX + x * wallWidth + wallWidth, gridPosY + y * wallHeight + wallHeight);
                                break;
                            case 2:
                                drawLine(ctx, gridPosX + x * wallWidth, gridPosY + y * wallHeight, gridPosX + x * wallWidth + wallWidth, gridPosY + y * wallHeight);
                                break;
                            case 3:
                                drawLine(ctx, gridPosX + x * wallWidth, gridPosY + y * wallHeight, gridPosX + x * wallWidth, gridPosY + y * wallHeight + wallHeight);
                                break;
                            default:
                        }
                    }
                }
            }
        } 

        drawSquare(ctx, squarePosX, squarePosY, squareWidth, squareHeight, 'black');

    }
}

class DepthFirstMaze extends Maze {
    constructor(posX, posY, width, height, c, ctx) {
        super(posX, posY, width, height)
        this.c = c;
        this.ctx = ctx;
        // this.generateWalls();
    }

    generateMaze(x, y) {
        var currentNode = this.grid[x][y];
        currentNode.visited = true;
        console.log(currentNode);
        // While cell has any unvisited neighbour cells
            // Choose one of the unvisited cells randomly
            // Remove wall
            // Invoke recursively

        var neighbours = this.vertices.get(currentNode);
        var neighbourDirections = [];

        // Save the direction of the neighbours in an array
        for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i] != undefined && !neighbours[i].visited) {
                neighbourDirections.push(i);
            }
        }

        while (neighbourDirections.length > 0) {
            var nextCellDirection = neighbourDirections[getRandomInt(0, neighbourDirections.length)];
            neighbourDirections.splice(neighbourDirections.indexOf(nextCellDirection), 1);

            if (neighbours[nextCellDirection].visited) continue;
            // if (neighbours[neighbours.indexOf(nextCellDirection)].visited) continue;

            switch (nextCellDirection) {
                case 0: // North wall current node == South wall neighbour node
                    neighbours[0] = undefined;
                    this.vertices.get(this.grid[x][y+1])[2] = undefined;
                    this.generateMaze(x, y+1)
                    break;
                case 1: // East wall current node == West wall neighbour node
                    neighbours[1] = undefined;
                    this.vertices.get(this.grid[x+1][y])[3] = undefined;
                    this.generateMaze(x+1, y)
                    break;
                case 2: // South wall current node == North wall neighbour node
                    neighbours[2] = undefined;
                    this.vertices.get(this.grid[x][y-1])[0] = undefined;
                    this.generateMaze(x, y-1)
                    break;
                case 3: // West wall current node == East wall neighbour node
                    neighbours[3] = undefined;
                    this.vertices.get(this.grid[x-1][y])[1] = undefined;
                    this.generateMaze(x-1, y)
                    break;
                default:
            }
        }
    }
}

main = function() {
    var c = document.querySelector('canvas');
    var ctx = c.getContext("2d");
    // Math.seedrandom(134);
    const maze = new DepthFirstMaze(0, 0, 40, 40, c, ctx);
    maze.generateMaze(10, 10);
    maze.drawMaze(c, ctx);

    // var arr = [1, 2, 3, 4];
    // while(arr.length > 0 || arr == undefined) {
    //     console.log(num);
    //     var nextnum = arr[getRandomInt(0, arr.length)];
    //     arr.splice(arr.indexOf(nextnum), 1);
    // }

}

main();
