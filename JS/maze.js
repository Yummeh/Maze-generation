/**
 * @author Ralph de Horde <ralphdehorde@gmail.com>
 * 
 * This document is for the public domain.
 * 
 * Summary:
 * This Javascript file generates a maze on a canvas.
 * Link: https://en.wikipedia.org/wiki/Maze_generation_algorithm
 */


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

function drawSquare(ctx, x, y, width, height, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, width, height);
}

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
}

class MazeNode {
    visited = false;
}

class Maze {
    constructor(posX, posY, pxWidth, pxHeight, width, height, c, ctx) {
        this.posX = posX;
        this.posY = posY;
        this.pxWidth = pxWidth;
        this.pxHeight = pxHeight;
        this.width = width;
        this.height = height;
        this.c = c;
        this.ctx = ctx;

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

    generateGrid() {
        // Initialize nodes
        for (var x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (var y = 0; y < this.height; y++) {
                var node = new MazeNode(x, y);
                this.grid[x][y] = node;
                this.addVertex(node);
            }
        }

        // Set node neighbours
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var node = this.grid[x][y];
                if (this.grid[x][y+1] != undefined) {
                    this.addEdge(node, this.grid[x][y+1], 0);
                }
                if (this.grid[x+1] != undefined) {
                    this.addEdge(node, this.grid[x+1][y], 1);
                }
                if (this.grid[x][y-1] != undefined) {
                    this.addEdge(node, this.grid[x][y-1], 2);
                }
                if (this.grid[x-1] != undefined) {
                    this.addEdge(node, this.grid[x-1][y], 3);
                }
            }
        }
    }

    generateMaze() {
        throw new Error('You have to implement the method!');
    }

    drawMaze() {
        // Wall width and height:
        var wallWidth = this.pxWidth / this.width;
        var wallHeight = this.pxHeight /  this.height;

        // Draw a line for the side of the cell if where current cell and neighbour do not have eachother as available neighbours
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var neighbours = this.vertices.get(this.grid[x][y]);
                for (var i = 0; i < 4; i++) {   // For loop to 4 because max 4 neighbours
                    if (neighbours[i] != undefined) {
                        var cellPosX = this.posX + x * wallWidth;
                        var cellPosY = this.posY + y * wallHeight;

                        // Just to make sure lines dont get drawn twice
                        var neighboursNeighbours = this.vertices.get(neighbours[i]);

                        switch (i) {
                            case 0:
                                neighboursNeighbours[2] = undefined;
                                drawLine(this.ctx, cellPosX, cellPosY + wallHeight, cellPosX + wallWidth, cellPosY + wallHeight);
                                break;
                            case 1:
                                neighboursNeighbours[3] = undefined;
                                drawLine(this.ctx, cellPosX + wallWidth, cellPosY, cellPosX + wallWidth, cellPosY + wallHeight);
                                break;
                            case 2:
                                neighboursNeighbours[0] = undefined;
                                drawLine(this.ctx, cellPosX, cellPosY, cellPosX + wallWidth, cellPosY);
                                break;
                            case 3:
                                neighboursNeighbours[1] = undefined;
                                drawLine(this.ctx, cellPosX, cellPosY, cellPosX, cellPosY + wallHeight);
                                break;
                            default:
                        }
                        neighbours[i] = undefined;
                    }
                }
            }
        }
        drawSquare(this.ctx, this.posX, this.posY, this.pxWidth, this.pxHeight, 'black');
    }
}

class DepthFirstMaze extends Maze {
    constructor(posX, posY, pxWidth, pxHeight, width, height, c, ctx) {
        super(posX, posY, pxWidth, pxHeight, width, height, c, ctx)
    }

    generateMaze(x, y) {
        var currentNode = this.grid[x][y];
        currentNode.visited = true;

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

function generateMaze() {
    console.log("called");
    var c = document.querySelector('canvas');
    var ctx = c.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maze = new DepthFirstMaze(0, 0, c.width, c.height, 10, 10, c, ctx);
    maze.generateMaze(0, 0);
    maze.drawMaze();
}

generateMaze();