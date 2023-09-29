import React, { Component } from "react";

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            xPos: props.xPos,
            yPos: props.yPos,
        };
    }

    componentDidUpdate(prevProps) {
        // 플레이어의 위치가 변경될 때 상태를 업데이트합니다.
        if (this.props.xPos !== prevProps.xPos || this.props.yPos !== prevProps.yPos) {
            this.setState({
                xPos: this.props.xPos,
                yPos: this.props.yPos,
            });
        }
    }

    drawPlayerRect(ctx) {
        // 새로운 위치에 플레이어를 그립니다.
        const { xPos, yPos } = this.state;
        const size = this.props.size;
        ctx.beginPath();
        ctx.fillStyle = this.props.color;
        ctx.rect(xPos, yPos, size, size);
        ctx.fill();
    }

    render() {
        const { canvasWidth, canvasHeight } = this.props;

        return (
            <canvas
                width={canvasWidth}
                height={canvasHeight}
                onMouseMove={(e) => {
                    // 마우스 이벤트 핸들러: 마우스 위치로 플레이어 위치 업데이트
                    const rect = e.target.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    // 업데이트된 위치를 부모 컴포넌트로 전달
                    this.props.onPlayerMove(mouseX, mouseY);
                }}
                ref={(canvas) => {
                    if (canvas) {
                        this.drawPlayerRect(canvas.getContext("2d"));
                    }
                }}
            />
        );
    }
}

export default Player;
