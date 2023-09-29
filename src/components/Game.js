import React, { Component } from "react";

class Game extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        // 캔버스 초기화 및 설정
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");

        const scale = window.devicePixelRatio;
        ctx.scale(scale, scale);
        const canvasWidth = 500;
        const canvasHeight = 500;
        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;
        canvas.style.width = canvasWidth + "px";
        canvas.style.height = canvasHeight + "px";

        // 게임 초기화 및 게임 루프 설정
        // 여기서 게임 로직을 추가하세요.

        // 게임판 테두리 그리기
        ctx.strokeStyle = "black"; // 테두리 색상 설정
        ctx.lineWidth = 2; // 테두리 두께 설정
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} />
                {/* 게임 UI 및 정보를 여기에 추가하세요. */}
            </div>
        );
    }
}

export default Game;
