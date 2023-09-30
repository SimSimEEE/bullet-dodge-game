import React, { Component } from "react";

class GameTimer {
    startTime;
    playTime;

    constructor(startTime) {
        this.startTime = startTime;
        this.playTime = 0; // 게임 시간 초기화
    }

    drawTime(ctx) {
        this.#updateTime();
    }

    #updateTime() {
        const now = Date.now();
        this.playTime = Math.floor((now - this.startTime) / 1000);
    }

    // 게임 시간을 초기화하는 메서드
    reset() {
        this.startTime = Date.now();
        this.playTime = 0;
    }

    getTime() {
        return this.playTime;
    }
}

export default GameTimer;
