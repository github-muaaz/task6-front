import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const Board = () => {

    const brushColor: string = 'red';
    const brushSize: number = 4;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:8090');
        setSocket(newSocket);
    }, []);


    useEffect(() => {
        if (socket)
            socket.on('board', (data) => {
                const image = new Image();
                image.src = data;

                const canvas = canvasRef.current;

                const ctx = canvas.getContext('2d');
                image.onload = () => ctx.drawImage(image, 0, 0);
            });
    }, [socket]);


    useEffect(() => {

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        const startDrawing = (e: { offsetX: number; offsetY: number; }) => {
            isDrawing = true;

            [lastX, lastY] = [e.offsetX, e.offsetY];
        };

        const draw = (e: { offsetX: number; offsetY: number; }) => {
            if (!isDrawing) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            }

            [lastX, lastY] = [e.offsetX, e.offsetY];
        };

        const endDrawing = () => {
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL();

            if (socket)
                socket.emit('board', dataURL);

            isDrawing = false;
        };

        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');

        if (ctx) {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseout', endDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', endDrawing);
            canvas.removeEventListener('mouseout', endDrawing);
        };
    }, [brushColor, brushSize, socket]);


    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
    ]);

    useEffect(() => {
        const handleWindowResize = () => setWindowSize([window.innerWidth, window.innerHeight]);

        window.addEventListener('resize', handleWindowResize);

        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    const canvasStyle: React.CSSProperties = {
        backgroundColor: 'white',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }

    return (
        <canvas
            style={canvasStyle}
            width={windowSize[0] > 600 ? 600 : 300}
            ref={canvasRef}
            height={windowSize[1] > 400 ? 400 : 200}
        />
    );
};

export default Board;