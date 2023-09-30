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
            canvasWidth: 500,
            canvasHeight: 500,
            playerX: 250,
            playerY: 250,
            bombs: [],
            isGameOver: false,
            playerExploding: false,
            playerExplosionTriangles: [],
            bombSlowDuration: 1000, // 폭탄 느리게 하는 기간 (1초)
            isBombSlow: false, // 폭탄 느리게 하는 상태
            bombSlowCooldown: 3000, // 폭탄 느려짐 재사용 대기 시간 (10초)
            canUseBombSlow: true, // 폭탄 느려짐 사용 가능 여부
        };
        this.ctx = null;
        this.drawAnimation = null;
        this.gameTimer = new GameTimer(Date.now());
    }

    componentDidMount() {
        this.initializeCanvas();
        this.gameLoop();
        this.startAddingBombs();
        this.setupCanvasMouseInteraction();
        this.drawInvulnerabilityCount();
    }

    componentWillUnmount() {
        clearInterval(this.bombInterval);
        cancelAnimationFrame(this.drawAnimation);
    }

    setupCanvasMouseInteraction() {
        const canvas = this.canvasRef.current;
        canvas.style.cursor = "none";
        canvas.addEventListener("mousemove", this.handleMouseMove);
        canvas.addEventListener("click", this.handleMouseClick);
    }

    startAddingBombs() {
        this.bombInterval = setInterval(() => {
            const { bombs } = this.state;
            if (bombs.length < 10) {
                bombs.push(new Bomb(this.state.canvasWidth, this.state.canvasHeight));
                this.setState({ bombs });
            }
        }, 1000);
    }

    initializeCanvas() {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { canvasWidth, canvasHeight } = this.state;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = canvasWidth + "px";
        canvas.style.height = canvasHeight + "px";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        // 초기에 몇 개의 폭탄을 생성해 놓음
        const bombs = [];
        for (let i = 0; i < 5; i++) {
            bombs.push(new Bomb(canvasWidth, canvasHeight));
        }
        this.setState({ bombs });
    }

    handleMouseMove = (e) => {
        if (!this.state.isGameOver) {
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

    handleMouseClick = () => {
        if (!this.state.isGameOver && this.state.canUseBombSlow) {
            // 게임이 종료되지 않았고, 폭탄 느려짐을 사용 가능하고 있는 경우
            this.setState({ isBombSlow: true, canUseBombSlow: false });

            setTimeout(() => {
                this.setState({ isBombSlow: false });

                // 폭탄 느려짐 사용 후 10초 뒤에 다시 사용 가능하도록 설정
                setTimeout(() => {
                    this.setState({ canUseBombSlow: true });
                }, this.state.bombSlowCooldown);
            }, this.state.bombSlowDuration);
        }
    };

    gameLoop = () => {
        this.updateGame();
        this.drawGame();
        this.drawAnimation = requestAnimationFrame(this.gameLoop);
    };

    updateGame = () => {
        const { canvasWidth, canvasHeight, bombs, isBombSlow } = this.state;
        bombs.forEach((bomb) => {
            // 폭탄들을 업데이트하고 화면 경계를 벗어난 폭탄을 재설정
            bomb.xPos += isBombSlow ? bomb.xVector * 0.5 : bomb.xVector;
            bomb.yPos += isBombSlow ? bomb.yVector * 0.5 : bomb.yVector;
            bomb.checkFrame(canvasWidth, canvasHeight);

            if (
                !this.state.playerExploding &&
                bomb.checkCollision(this.state.playerX, this.state.playerY)
            ) {
                // 플레이어와 폭탄이 충돌하면 폭발 애니메이션 시작
                this.startPlayerExplosion(this.state.playerX, this.state.playerY);
            }
        });
    };

    handleGameOver = () => {
        // 게임 오버 상태로 전환
        this.setState({ isGameOver: true });
    };

    handleRestart = () => {
        // 페이지를 다시 로드하여 게임을 재시작
        window.location.reload();
    };

    startPlayerExplosion(playerX, playerY) {
        this.setState({ playerExploding: true });
        const explosionTriangles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const speed = 2;
            const size = 20;
            const xVector = Math.cos(angle) * speed;
            const yVector = Math.sin(angle) * speed;
            const x = playerX - size / 2;
            const y = playerY - size / 2;
            const rotationCenterX = playerX;
            const rotationCenterY = playerY;
            const rotatedX =
                (x - rotationCenterX) * Math.cos(angle) -
                (y - rotationCenterY) * Math.sin(angle) +
                rotationCenterX;
            const rotatedY =
                (x - rotationCenterX) * Math.sin(angle) +
                (y - rotationCenterY) * Math.cos(angle) +
                rotationCenterY;
            explosionTriangles.push({
                x: rotatedX,
                y: rotatedY,
                xVector,
                yVector,
                size,
            });
        }
        this.setState({ playerExplosionTriangles: explosionTriangles });

        // 폭발 애니메이션 후 게임 오버 처리
        setTimeout(() => {
            this.setState({ playerExplosionTriangles: [], playerExploding: false });
            this.handleGameOver();
        }, 500); // 0.5초 후에 게임 오버 처리
    }

    // 무적 횟수 표시 함수
    drawInvulnerabilityCount = () => {
        const { canvasWidth } = this.state;
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Clear the area before drawing the count
        ctx.clearRect(canvasWidth - 200, 0, canvasWidth, 30);

        ctx.font = "20px Arial";
        ctx.fillStyle = "black"; // Change text color to black
        ctx.textAlign = "right";
        ctx.fillText(`무적 횟수: ${this.state.invulnerabilityCount}`, canvasWidth - 10, 30);
    };

    drawElapsedTime = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText(`버틴 시간: ${this.gameTimer.getTime()}초`, 10, 30);
    };

    drawGame = () => {
        const {
            playerX,
            playerY,
            bombs,
            isGameOver,
            playerExploding,
            playerExplosionTriangles,
            isBombSlow,
        } = this.state;
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        bombs.forEach((bomb) => {
            bomb.drawBomb(ctx);
            bomb.xPos += isBombSlow ? bomb.xVector * 0.5 : bomb.xVector;
            bomb.yPos += isBombSlow ? bomb.yVector * 0.5 : bomb.yVector;
            bomb.checkFrame(canvas.width, canvas.height);
        });

        // 폭발 애니메이션 그리기
        if (playerExploding && !isGameOver) {
            playerExplosionTriangles.forEach((triangle) => {
                ctx.fillStyle = "black";
                ctx.beginPath();

                const rotationCenterX = triangle.x;
                const rotationCenterY = triangle.y;
                const angle = Math.atan2(triangle.yVector, triangle.xVector);

                // 회전된 좌표 계산
                const rotatedX1 = triangle.x - (Math.cos(angle) * triangle.size) / 2;
                const rotatedY1 = triangle.y - (Math.sin(angle) * triangle.size) / 2;
                const rotatedX2 = triangle.x + (Math.cos(angle) * triangle.size) / 2;
                const rotatedY2 = triangle.y + (Math.sin(angle) * triangle.size) / 2;
                const rotatedX3 = triangle.x + (Math.cos(angle + Math.PI / 2) * triangle.size) / 2;
                const rotatedY3 = triangle.y + (Math.sin(angle + Math.PI / 2) * triangle.size) / 2;

                ctx.moveTo(rotatedX1, rotatedY1);
                ctx.lineTo(rotatedX2, rotatedY2);
                ctx.lineTo(rotatedX3, rotatedY3);
                ctx.closePath();
                ctx.fill();

                triangle.x += triangle.xVector;
                triangle.y += triangle.yVector;
            });
        } else {
            // 게임이 종료되지 않았을 때만 시간과 플레이어를 그립니다.
            if (!isGameOver) {
                this.gameTimer.drawTime(ctx);

                // 플레이어 그리기
                ctx.fillStyle = isBombSlow
                    ? "rgba(22, 22, 22, 0.5)" // 폭탄 느려질 때는 반투명
                    : "rgba(22, 22, 22, 0.9)";
                ctx.fillRect(playerX - 20, playerY - 20, canvas.width / 20, canvas.height / 20);
            }
        }
    };

    render() {
        const {
            canvasWidth,
            canvasHeight,
            isGameOver,
            isBombSlow,
            bombSlowCooldown,
            canUseBombSlow,
        } = this.state;
        const elapsedTime = this.gameTimer.getTime();

        const canvasStyle = {
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "linear-gradient(to bottom, #3498db, #2980b9)",
        };

        const modalStyle = {
            overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                zIndex: 1000,
            },
            content: {
                width: "300px",
                margin: "auto",
                textAlign: "center",
                background: "#fff",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
        };

        return (
            <div>
                <div style={canvasStyle}>
                    <canvas
                        ref={this.canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        style={{ border: "2px solid #000" }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            color: "white",
                            zIndex: "1",
                        }}
                    >
                        폭탄 느려짐:{" "}
                        {isBombSlow
                            ? "사용 중"
                            : canUseBombSlow
                            ? "사용 가능"
                            : `쿨다운 중 (${Math.ceil(bombSlowCooldown / 1000)}초)`}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: "30px",
                            left: "10px",
                            color: "white",
                            zIndex: "1",
                        }}
                    ></div>
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            color: "white",
                            zIndex: "1",
                        }}
                    >
                        경과 시간: {elapsedTime}초
                    </div>
                </div>
                <Modal
                    isOpen={isGameOver}
                    onRequestClose={this.handleRestart}
                    contentLabel="Game Over"
                    style={modalStyle}
                    shouldCloseOnOverlayClick={false}
                >
                    <h2 style={{ color: "#e74c3c" }}>Game Over</h2>
                    <p>게임에서 버틴 시간: {elapsedTime}초</p>
                    <button
                        onClick={this.handleRestart}
                        style={{
                            padding: "10px 20px",
                            background: "#3498db",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        다시 시작
                    </button>
                </Modal>
            </div>
        );
    }
}

export default Game;
