import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const CartesianPlane = ({ pointX, pointY }) => {
  const canvasRef = useRef(null);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const url = "ws://localhost:1887/";

    const options = {
      clean: true,
      connectTimeout: 4000,
      clientId: "cartesianPlane",
    };
    const client = mqtt.connect(url, options);

    // Conectar ao broker
    client.on("connect", () => {
      console.log("Conectado ao broker MQTT");
      client.subscribe(["move/X", "move/Y"], (err) => {
        if (!err) {
          console.log("Inscrito nos tópicos move/X e move/Y..");
        }
      });
    });

    client.on("message", (topic, payload) => {
      const message = payload.toString();
      console.log(`Mensagem recebida no tópico ${topic}:`, message);

      let newXPosition = xPosition;
      let newYPosition = yPosition;

      if (topic === "move/X") {
        setXPosition(parseInt(message, 10)); // Atualizar posição X
        console.log(xPosition);
      } else if (topic === "move/Y") {
        setYPosition(parseInt(message, 10)); // Atualizar posição Y
        console.log(yPosition);
      }

      drawCartesianPlane();
      drawDashedLines(newXPosition, newYPosition);
    });

    // Função para ajustar o tamanho do canvas ao tamanho da janela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawCartesianPlane();
      drawPoint(pointX, pointY);
      drawDashedLines(xPosition, yPosition);
    };

    // Função para desenhar o plano cartesiano
    const drawCartesianPlane = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhando o eixo X
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.strokeStyle = "#000";
      ctx.stroke();

      // Desenhando o eixo Y
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.strokeStyle = "#000";
      ctx.stroke();
    };

    const drawDashedLines = (x, y) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Ajustar as coordenadas do ponto para o centro do plano cartesiano
      const adjustedX = centerX + x;
      const adjustedY = centerY - y;

      // Desenhar linha tracejada no eixo Y (vertical)
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(adjustedX, 0);
      ctx.lineTo(adjustedX, canvas.height);
      ctx.strokeStyle = "#00f"; // Azul para linha vertical
      ctx.stroke();

      // Desenhar linha tracejada no eixo X (horizontal)
      ctx.beginPath();
      ctx.moveTo(0, adjustedY);
      ctx.lineTo(canvas.width, adjustedY);
      ctx.strokeStyle = "#f00"; // Vermelho para linha horizontal
      ctx.stroke();

      // Resetar a linha tracejada
      ctx.setLineDash([]);
    };

    // Função para desenhar pontos no plano cartesiano
    const drawPoint = (x, y, color = "#f00") => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.beginPath();
      ctx.arc(centerX + x, centerY - y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawRandomPoint = () => {
      // Gerar coordenadas aleatórias dentro do canvas
      const x = Math.floor(Math.random() * canvas.width) - canvas.width / 2;
      const y = Math.floor(Math.random() * canvas.height) - canvas.height / 2;
      // Desenhar o ponto usando a função drawPoint
      drawPoint(x, y);
    };

    // Função para desenhar múltiplos pontos aleatórios
    const drawMultipleRandomPoints = (count) => {
      for (let i = 0; i < count; i++) {
        drawRandomPoint();
      }
    };

    // Redimensionar o canvas e redesenhar o plano cartesiano ao redimensionar a janela
    window.addEventListener("resize", resizeCanvas);
    // Redimensionar o canvas e desenhar o plano cartesiano ao carregar a página
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [xPosition, yPosition]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
};

export default CartesianPlane;
