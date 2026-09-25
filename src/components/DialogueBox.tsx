// src/components/DialogueBox.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { InputHandler } from '../game/InputHandler';

interface DialogueBoxProps {
  npcName: string;
  lines: string[];
  onComplete: () => void;
  input: InputHandler | null;
}

export default function DialogueBox({ npcName, lines, onComplete, input }: DialogueBoxProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const fullText = lines[currentLineIndex] || '';
  const dialogueStateRef = useRef({ currentLineIndex, fullText, isTyping });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    dialogueStateRef.current = { currentLineIndex, fullText, isTyping };
    onCompleteRef.current = onComplete;
  }, [currentLineIndex, fullText, isTyping, onComplete]);

  // Efecto Máquina de Escribir
  useEffect(() => {
    let charIndex = 0;
    let timer: ReturnType<typeof setInterval>;
    const resetTimer = setTimeout(() => {
      setDisplayedText('');
      setIsTyping(fullText.length > 0);

      timer = setInterval(() => {
        if (charIndex < fullText.length) {
          charIndex += 1;
          setDisplayedText(fullText.slice(0, charIndex));

          if (charIndex === fullText.length) {
            setIsTyping(false);
            clearInterval(timer);
          }
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 30); // Velocidad: 30ms por letra
    }, 0);

    return () => {
      clearTimeout(resetTimer);
      if (timer) clearInterval(timer);
    };
  }, [currentLineIndex, fullText]);

  // Capturar la tecla E para controlar el diálogo
  useEffect(() => {
    if (!input) return;

    const actionHandler = () => {
      const { currentLineIndex: lineIndex, fullText: text, isTyping: typing } = dialogueStateRef.current;

      if (typing) {
        // 1. Si aún se escribe, mostrar la frase completa de inmediato
        setDisplayedText(text);
        setIsTyping(false);
      } else if (lineIndex < lines.length - 1) {
        // 2. Si terminó de escribirse, avanzar o cerrar
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        onCompleteRef.current(); // Fin del diálogo
      }
    };

    const previousHandler = input.setActionHandler(actionHandler);

    return () => {
      input.restoreActionHandler(previousHandler);
    };
  }, [input, lines.length]);

  return (
    <div className="dialogue-container">
      <div className="dialogue-box">
        <div className="npc-name">{npcName}</div>
        <div className="dialogue-text">{displayedText}</div>
        {!isTyping && <div className="space-indicator">E ▶</div>}
      </div>

      <style jsx>{`
        .dialogue-container {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 550px;
          z-index: 30;
          user-select: none;
        }

        .dialogue-box {
          background: rgba(16, 16, 20, 0.92);
          border: 2px solid #00ff88;
          border-radius: 12px;
          padding: 16px 20px;
          color: white;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
          min-height: 90px;
          position: relative;
        }

        @media (hover: none) and (pointer: coarse) {
          .dialogue-container {
            bottom: 180px;
            width: calc(100% - 24px);
          }

          .dialogue-box {
            padding: 12px 16px;
          }
        }

        .npc-name {
          color: #00ff88;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .dialogue-text {
          font-size: 15px;
          line-height: 1.4;
          font-family: monospace;
          color: #e0e0e0;
        }

        .space-indicator {
          position: absolute;
          bottom: 10px;
          right: 14px;
          font-size: 11px;
          color: #00ff88;
          font-weight: bold;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}