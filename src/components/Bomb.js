import React, { Component } from "react";
import { randomItemInArray } from "./utils";

class Bomb {
    xPos;
    yPos;
    size;
    color = "rgba(244, 22, 22, 0.9)";
    xVector;
    yVector;
    minVector = 1;
    maxVentor = 5;

    constructor(canvasWidth, canvasHeight, size = canvasWidth / 50, vector = 1) {
        this.xPos = randomItemInArray([0, canvasWidth]);
        this.yPos = randomItemInArray([0, canvasHeight]);
        this.size = size;
        this.xVector = (Math.random() * 4 - 2) * 1.5;
        this.yVector = (Math.random() * 4 - 2) * 1.5;
    }

    drawBomb(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    checkFrame(canvasWidth, canvasHeight) {
        if (this.xPos > canvasWidth) {
            this.xPos = canvasWidth;
            this.#changeDirectionX();
        }
        if (this.xPos < 0) {
            this.xPos = 0;
            this.#changeDirectionX();
        }
        if (this.yPos > canvasHeight) {
            this.yPos = canvasHeight;
            this.#changeDirectionY();
        }
        if (this.yPos < 0) {
            this.yPos = 0;
            this.#changeDirectionY();
        }
    }

    #changeDirectionX() {
        this.xVector = -(this.xVector + Math.random() * 0.5 - 0.25);
        this.xVector = Math.abs(this.xVector) < this.minVector ? this.minVector : this.xVector;
        this.xVector = Math.abs(this.xVector) > this.maxVentor ? this.maxVentor : this.xVector;
    }

    #changeDirectionY() {
        this.yVector = -(this.yVector + Math.random() * 0.5 - 0.25);
        this.yVector = Math.abs(this.yVector) < this.minVector ? this.minVector : this.yVector;
        this.yVector = Math.abs(this.yVector) > this.maxVentor ? this.maxVentor : this.yVector;
    }

    checkCollision(playerX, playerY) {
        const xCollision = this.xPos > playerX - 20 && this.xPos < playerX + 20;
        const yCollision = this.yPos > playerY - 20 && this.yPos < playerY + 20;
        return xCollision && yCollision;
    }
}

export default Bomb;
