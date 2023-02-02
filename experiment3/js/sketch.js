// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const NUM_ROOMS = 40;
const ROOM_MIN = 50;
const ROOM_MAX = 300;

// Globals
let rooms = [];
//variables to store information regarding each of the "players"
let c1;
let c2;
let start1;
let start2;
let currentRoom1 = null;
let currentRoom2 = null;
let traveling1 = false;
let traveling2 = false;

//class for the rooms
class Room {
    constructor(x, y, size, c) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.path = null;
        this.done = false; //tells whether the room has stopped growing
        this.c = c;
        this.lastVisited = null; //keeps track of the "player" that last visited
    }
    draw() {
        strokeWeight(3);
        stroke(100);
        rectMode(CENTER); //drawing from the center helps with collision detection
        if (this.lastVisited != null) {
            this.c = this.lastVisited.c;
        }
        fill(this.c);
        square(this.x, this.y, this.size);
    }

    grow() {
        this.size += 0.5;
        this.draw();
    }
    //collision detection from https://mary.codes/blog/art/shape_packing_with_p5js/
    //check if the shape has reached the edge of the screen
    detectEdgeCollision() {
        if (
            dist(this.x, this.y, 0, this.y) <= this.size ||
            dist(this.x, this.y, width, this.y) <= this.size ||
            dist(this.x, this.y, this.x, 0) <= this.size ||
            dist(this.x, this.y, this.x, height) <= this.size
        ) {
            return true;
        }
        return false;
    }
    //check to see if the room will overlap with another
    detectRoomCollision() {
        for (let i = 0; i < rooms.length; i++) {
            let room2 = rooms[i];
            let distance = dist(this.x, this.y, room2.x, room2.y);
            if (distance !== 0 && distance <= (this.size + room2.size) / 1.5) {
                return true;
            }
        }
        return false;
    }
    //create a path attached to the room
    createPath(c) {
        let r = this.size / 2;
        let amp = random([0, 1, 2, 3]);
        this.path = new Path(
            createVector(
                this.x + r * cos((PI / 2) * amp),
                this.y + r * sin((PI / 2) * amp)
            ),
            random(-PI / 2 + (PI / 2) * amp, PI / 2 + (PI / 2) * amp),
            this,
            1,
            c,
            this.lastVisited.who
        );
    }
    drawPath() {
        this.path.update();
        this.path.draw();
    }
}
//class for the path stemming from a room
class Path {
    constructor(position, angle, room, spd, c, who) {
        this.room = room;
        this.position = position.copy();
        this.oldPosition = position.copy();
        this.angle = angle;
        this.speed = spd;
        this.c = c;
        this.done = false;
        this.who = who;
    }
    //checking to see if it has reached the edge of the screen
    detectEdgeCollision() {
        if (
            this.position.x > width ||
            this.position.y > height ||
            this.position.x < 0 ||
            this.position.y < 0
        ) {
            //bounce the path off the edge and keep going 
            this.angle += (2 * PI) / 3;
        }
    }
    //check to see if the path has reached a room
    detectRoomCollision() {
        for (let i = 0; i < rooms.length; i++) {
            let room = rooms[i];
            if (room != this.room) {
                if (
                    this.position.x < room.x + room.size / 2 &&
                    this.position.x > room.x - room.size / 2 &&
                    this.position.y < room.y + room.size / 2 &&
                    this.position.y > room.y - room.size / 2
                ) {
                    //check to makesure that this room isn't already being used by the other path
                    if (this.who == 1) {
                        if (currentRoom2 == room) {
                        } else {
                            this.done = true;
                            room.lastVisited = this;
                            currentRoom1 = room;
                            currentRoom1.createPath(c1);
                        }
                    } else {
                        if (currentRoom1 == room) {
                        } else {
                            this.done = true;
                            room.lastVisited = this;
                            currentRoom2 = room;
                            currentRoom2.createPath(c2);
                        }
                    }
                }
            }
        }
    }

    update() {
        if (!this.done) {
            this.detectEdgeCollision();
            this.detectRoomCollision();
            this.oldPosition = this.position.copy();
            this.position.add(
                cos(this.angle),
                sin(this.angle)
            );
        }
        //make the path turn
        if (random() > 0.95) {
            this.angle += random([-PI / 4, -PI / 8, PI / 8, PI / 4]);
        }
    }

    draw() {
        if (!this.done) {
            stroke(this.c);
            strokeWeight(2);
            line(
                this.oldPosition.x,
                this.oldPosition.y,
                this.position.x,
                this.position.y
            );
        }
    }
}

function Start(c, currentRoom, traveling, start, who) {
    currentRoom.lastVisited = new Path(createVector(0, 0), 0, null, 0, c, who);
    currentRoom.createPath(c);
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function () {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });
    background(0);
    for (let i = 0; i < NUM_ROOMS; i++) {
        rooms.push(new Room(random(0, width), random(0, height), 1, color(255)));
    }
    c1 = color(random(255), random(255), random(255));
    c2 = color(random(255), random(255), random(255));
    start1 = floor(random(rooms.length - 1));
    start2 = floor(random(rooms.length - 1));
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
    //grow the each of the rooms until they have a collision
    rooms.forEach((r) => {
        if (r.detectEdgeCollision()) {
            r.draw();
            r.done = true;
        } else if (r.detectRoomCollision()) {
            r.draw();
            r.done = true;
        } else {
            r.grow();
        }
    });
    //start the paths when the starting room is done
    if (rooms[start1].done) {
        if (!traveling1) {
            currentRoom1 = rooms[start1];
            Start(c1, currentRoom1, traveling1, start1, 1);
            traveling1 = true;
        }
    }
    if (rooms[start2].done) {
        if (!traveling2) {
            currentRoom2 = rooms[start2];
            Start(c2, currentRoom2, traveling2, start2, 2);
            traveling2 = true;
        }
    }
    //draw the path for the current rooms
    if (currentRoom1 !== null) {
        if (!currentRoom1.path.done) {
            currentRoom1.drawPath();
        }
    }
    if (currentRoom2 !== null) {
        if (!currentRoom2.path.done) {
            currentRoom2.drawPath();
        }
    }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}