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
            playerExploding: false, // 플레이어 폭발 애니메이션 상태
            playerExplosionTriangles: [], // 폭팔 애니메이션 삼각형들의 정보를 저장하는 배열
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
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = canvasWidth + "px";
        canvas.style.height = canvasHeight + "px";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
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
        this.updateGame();
        this.drawGame();
        this.drawAnimation = requestAnimationFrame(this.gameLoop);
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

    // 폭팔 애니메이션을 시작하는 함수
    startPlayerExplosion(playerX, playerY) {
        this.setState({ playerExploding: true }); // 폭팔 상태로 변경

        const explosionTriangles = [];
        for (let i = 0; i < 8; i++) {
            // 8개의 방향으로 삼각형 생성
            const angle = (Math.PI / 4) * i; // 45도씩 회전
            const speed = 2; // 삼각형의 속도
            const size = 20; // 삼각형 크기

            const xVector = Math.cos(angle) * speed; // 삼각형의 x 방향 속도
            const yVector = Math.sin(angle) * speed; // 삼각형의 y 방향 속도

            const x = playerX - size / 2; // 플레이어 사각형 중심에서 왼쪽으로 이동
            const y = playerY - size / 2; // 플레이어 사각형 중심에서 위로 이동
            const rotationCenterX = playerX; // 회전 중심 x 좌표 (플레이어 중심)
            const rotationCenterY = playerY; // 회전 중심 y 좌표 (플레이어 중심)

            // 회전 변환 적용
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

        // 폭팔 애니메이션 삼각형 배열 설정
        this.setState({ playerExplosionTriangles: explosionTriangles });

        // 일정 시간 후에 폭팔 애니메이션 종료 및 게임 오버 처리
        setTimeout(() => {
            this.setState({ playerExplosionTriangles: [], playerExploding: false });
            this.handleGameOver();
        }, 500); // 예: 1초 후에 게임 오버 처리
    }

    drawGame = () => {
        const { playerX, playerY, bombs, isGameOver, playerExploding, playerExplosionTriangles } =
            this.state;
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
            if (!playerExploding && bomb.checkCollision(playerX, playerY)) {
                // 플레이어 폭팔 애니메이션 시작
                this.startPlayerExplosion(playerX, playerY);
            }
        });

        // 폭팔 애니메이션 그리기
        if (playerExploding && isGameOver === false) {
            playerExplosionTriangles.forEach((triangle) => {
                ctx.fillStyle = "black";
                ctx.beginPath();

                const rotationCenterX = triangle.x; // 삼각형 중심 x 좌표
                const rotationCenterY = triangle.y; // 삼각형 중심 y 좌표
                const angle = Math.atan2(triangle.yVector, triangle.xVector); // 회전 각도 계산

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
            // 시간 표시
            if (!isGameOver) {
                this.gameTimer.drawTime(ctx);

                // 플레이어 그리기
                ctx.fillStyle = "rgba(22, 22, 22, 0.9)";
                ctx.fillRect(playerX - 20, playerY - 20, canvas.width / 20, canvas.height / 20);
            }
        }
    };

    render() {
        const { canvasWidth, canvasHeight, isGameOver } = this.state;
        const elapsedTime = this.gameTimer.getTime();

        const canvasStyle = {
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
                </div>
                <Modal
                    isOpen={isGameOver}
                    onRequestClose={this.handleRestart}
                    contentLabel="Game Over"
                    style={modalStyle}
                    shouldCloseOnOverlayClick={false} // 모달 외부 클릭으로 닫히지 않도록 설정
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
