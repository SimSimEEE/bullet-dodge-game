import React, { Component } from "react";
import Bomb from "./Bomb";
import GameTimer from "./GameTimer";
import { randomItemInArray } from "./utils";
import Modal from "react-modal";
import "./Game.css";
class Game extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            canvasWidth: 300,
            canvasHeight: 300,
            playerX: 250,
            playerY: 250,
            bombs: [],
            isGameOver: false,
        };
        this.ctx = null;
        this.drawAnimation = null;
        this.gameTimer = new GameTimer(Date.now());
    }

    componentDidMount() {
        this.initializeCanvas();
        this.gameLoop();
        this.startAddingBombs(); // 5초마다 폭탄 추가 시작

        const canvas = this.canvasRef.current;
        canvas.style.cursor = "none"; // 마우스 커서 숨기기
    }

    componentWillUnmount() {
        const canvas = this.canvasRef.current;
        canvas.removeEventListener("mousemove", this.handleMouseMove);
        clearInterval(this.bombInterval); // 컴포넌트가 언마운트될 때 폭탄 추가 인터벌 제거
    }

    startAddingBombs() {
        this.bombInterval = setInterval(() => {
            const { bombs } = this.state;
            if (bombs.length < 10) {
                // 폭탄 개수 제한 (원하는 개수로 수정 가능)
                bombs.push(new Bomb(this.state.canvasWidth, this.state.canvasHeight));
                this.setState({ bombs });
            }
        }, 5000); // 5초마다 폭탄 추가
    }

    initializeCanvas() {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.addEventListener("mousemove", this.handleMouseMove);
        const { canvasWidth, canvasHeight } = this.state;
        const scale = window.devicePixelRatio;
        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;
        canvas.style.width = canvasWidth + "px";
        canvas.style.height = canvasHeight + "px";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth * scale, canvasHeight * scale);
        const bombs = [];
        for (let i = 0; i < 5; i++) {
            bombs.push(new Bomb(canvasWidth, canvasHeight));
        }
        this.setState({ bombs });
    }

    handleMouseMove = (e) => {
        if (!this.state.isGameOver) {
            const { canvasWidth, canvasHeight } = this.state;
            const canvas = this.canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.setState({
                playerX: mouseX,
                playerY: mouseY,
            });
        }
    };

    gameLoop = () => {
        if (!this.state.isGameOver) {
            this.updateGame();
            this.drawGame();
            this.drawAnimation = requestAnimationFrame(this.gameLoop);
        }
    };

    updateGame = () => {
        const { canvasWidth, canvasHeight, bombs } = this.state;
        bombs.forEach((bomb) => {
            bomb.xPos += bomb.xVector;
            bomb.yPos += bomb.yVector;
            if (
                bomb.xPos < 0 ||
                bomb.xPos > canvasWidth + bomb.size * 100 ||
                bomb.yPos < 0 ||
                bomb.yPos > canvasHeight + bomb.size * 100
            ) {
                bomb.xPos = randomItemInArray([0, canvasWidth]);
                bomb.yPos = randomItemInArray([0, canvasHeight]);
                bomb.xVector = Math.random() * 4 - 2;
                bomb.yVector = Math.random() * 4 - 2;
            }
        });
    };

    handleGameOver = () => {
        this.setState({ isGameOver: true });
    };

    handleRestart = () => {
        // 페이지 새로 고침
        window.location.reload();
    };

    drawGame = () => {
        const { playerX, playerY, bombs } = this.state;
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        bombs.forEach((bomb) => {
            bomb.drawBomb(ctx);
            bomb.xPos += bomb.xVector;
            bomb.yPos += bomb.yVector;
            bomb.checkFrame(canvas.width, canvas.height);
            if (bomb.checkCollision(playerX, playerY)) {
                this.handleGameOver();
            }
        });
        ctx.fillStyle = "rgba(22, 22, 22, 0.9)";
        ctx.fillRect(playerX - 20, playerY - 20, 40, 40);

        // 시간 표시
        this.gameTimer.drawTime(ctx);
    };

    render() {
        const { canvasWidth, canvasHeight, isGameOver } = this.state;
        const elapsedTime = this.gameTimer.getTime(); // 경과된 시간 가져오기

        const canvasStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
        };

        return (
            <div>
                <div style={canvasStyle}>
                    <canvas ref={this.canvasRef} width={canvasWidth} height={canvasHeight} />
                </div>
                <Modal
                    isOpen={isGameOver}
                    onRequestClose={this.handleRestart}
                    contentLabel="게임 오버"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <h2>게임 오버</h2>
                    <p>게임에서 버틴 시간: {elapsedTime}초</p>
                    <button onClick={this.handleRestart}>다시 시작</button>
                </Modal>
            </div>
        );
    }
}

export default Game;
