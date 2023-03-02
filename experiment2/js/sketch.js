// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// Globals
let tree;
let dots = false;
let rainbow = false;
let baseX;
let maxHeight;
let startingAngle;
let sky = [];
let skyCount = 0;
let theta = 0.0;
let thetaDiff = 0.01;
let drawSpeed = 5;
let done = false;
let animate = true;
let tempX;
let tempY;

class PointData {
  constructor(x, y, len, angle, c) {
    this.start = createVector(x, y);
    this.end = createVector(x + cos(angle) * len, y + sin(angle) * len);
    this.current = this.end;
    this.len = len;
    this.startAngle = angle;
    this.angle = angle;
    this.c = c;
  }
}
class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
  
}

//Binary tree layout from https://www.geeksforgeeks.org/implementation-binary-search-tree-javascript/ 
class Tree {
  constructor() {
    this.root = null;
  }

  insert(data) {
    let newNode = new Node(data);

    if (this.root == null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    if (newNode.data.angle < node.data.angle) {
      if (node.left == null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right == null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }
  
  changeColor(node, c) {
    if(node != null) {
      this.changeColor(node.left, c);
      if(rainbow) {
        node.data.c = color(random(255), random(255), random(255));
      } else {
        node.data.c = c;
      }
      this.changeColor(node.right, c);
    }
  }

  draw(node) {
    if (node != null) {
      this.draw(node.left);
      let data = node.data;
      stroke(data.c);
      if (dots) {
        strokeWeight(2);
        point(data.start.x, data.start.y);
        point(
          data.end.x,
          data.end.y
        );
      } else {
        strokeWeight(1);
        if(animate) {
          this.animateLines(data);
        }
        else {
          data.current = data.end;
        }
        line(
          data.start.x,
          data.start.y,
          data.current.x,
          data.current.y
        );
      }
      this.draw(node.right);
    }
  }
  //animate lines function from https://editor.p5js.org/knectar/sketches/ZCnqNDXe
  animateLines(data) {
    tempX = map(data.angle, 0, 100, data.start.x, data.end.x, 1);
    tempY = map(data.angle, 0, 100, data.start.y, data.end.y, 1);
    
    data.current = createVector(tempX, tempY);
    if(tempX == data.end.x && tempY == data.end.y) {
      data.angle = data.startAngle;
      tempX = map(data.angle, 0, 100, data.start.x, data.end.x, 1);
      tempY = map(data.angle, 0, 100, data.start.y, data.end.y, 1);
    }
    data.angle += drawSpeed;
  }
}

class Skyline {
  constructor(xspacing, baseY, equation, c) {
    this.xspacing = xspacing;
    this.baseY = baseY;
    this.yvalues = new Array(floor(width / this.xspacing));
    this.equation = equation;
    this.c = c;
  }
  
  //sine wave implementation from https://p5js.org/examples/math-sine-wave.html
  calcWave() {
    theta += thetaDiff;
    this.yvalues[0] = this.baseY;
    let x = theta;
    let dx = (TWO_PI / 500) * this.xspacing;
    for(let i = 0; i < this.yvalues.length; i++) {
      this.yvalues[i] = (this.equation(x) * 20) + this.baseY;
      x+= dx;
    }
  }
  
  draw() {
    this.calcWave();
    stroke(this.c);
    fill(this.c);
    for(let x = 0; x < this.yvalues.length; x++) {
      line(x * this.xspacing, this.yvalues[x], (x * this.xspacing) + 16, this.yvalues[x] + 16);
    }
  }
}

//tree building from https://editor.p5js.org/wmodes/sketches/zMGTchHRx
function buildTree(x, y, len, angle) {
  tree.insert(new PointData(x, y, len, angle, 255));
  if (len > 4) {
    let newLen = len * 0.7;
    let a = angle + random(-PI / 6, PI / 6);
    let b = angle + random(-PI / 6, PI / 6);
    let newX = x + cos(angle) * len;
    let newY = y + sin(angle) * len;
    tree.insert(new PointData(newX, newY, newLen, a, 255));
    tree.insert(new PointData(newX, newY, newLen, b, 255));
    buildTree(newX, newY, newLen, a);
    buildTree(newX, newY, newLen, b);
  }
}




// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function() {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });

    var centerHorz = windowWidth / 2;
    var centerVert = windowHeight / 2;

    background(0);
    for(let i = 10; i < height / 7; i += 15) {
      let tempC = color(random(255), random(255), random(255));
      if(i % 2 == 0 ) {
        sky.push(new Skyline(16, i, sin, tempC));
      }
      else {
        sky.push(new Skyline(16, i, cos, tempC));
      }
    }
    baseX = random(width * 0.25, width * 0.75);
    maxHeight = random(height * 0.1, height * 0.3);
    startingAngle = random(-(2 * PI) / 3, -PI / 3);
    tree = new Tree();
    buildTree(baseX, height, maxHeight, startingAngle);
    tree.draw(tree.root);
}
function draw() {
  background(map(mouseX + mouseY, 0, width + height, 0, 255));
  tree.draw(tree.root);
  sky.forEach(element => element.draw());
}

function mousePressed() {
  tree = new Tree();
  rainbow = false;
  dots = false;
  baseX = mouseX;
  maxHeight = random(height * 0.1, height * 0.3);
  startingAngle = random(-(2 * PI) / 3, -PI / 3);
  buildTree(baseX, height, maxHeight, startingAngle);
}

function keyTyped() {
  if (key === "d") {
    dots = !dots;
  } 
  if (key === "c") {
    tree.changeColor(tree.root, color(random(255), random(255), random(255)));
   } 
  if (key === "r") {
    rainbow = !rainbow;
    tree.changeColor(tree.root, 255);
  }
  if(key === "a"){
    animate = !animate;
  }
}

function keyPressed() {
  if(keyCode == UP_ARROW) {
    thetaDiff += 0.005;
  }
  if(keyCode == DOWN_ARROW) {
    if(thetaDiff <= 0) {
    thetaDiff -= 0.005;
    }
  }
}