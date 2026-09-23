'use client'

import { InputHandler } from "../game/InputHandler";

interface TouchControlProps {
    input: InputHandler | null;
}

export default function TouchControls({input}: TouchControlProps)
{
    if (!input) return null;

    const handleDirection = (key: 'w' | 'a' | 's' | 'd', active: boolean) => {
        input.setKey(key, active);
    }

    return (
        <div className="touch-overlay">
        {/* Cruceta / D-Pad direccional */}
        <div className="dpad">
            <button
            className="btn dpad-up"
            onTouchStart={() => handleDirection('w', true)}
            onTouchEnd={() => handleDirection('w', false)}
            onMouseDown={() => handleDirection('w', true)}
            onMouseUp={() => handleDirection('w', false)}
            >
            ▲
            </button>
            <div className="dpad-row">
            <button
                className="btn dpad-left"
                onTouchStart={() => handleDirection('a', true)}
                onTouchEnd={() => handleDirection('a', false)}
                onMouseDown={() => handleDirection('a', true)}
                onMouseUp={() => handleDirection('a', false)}
            >
                ◀
            </button>
            <button
                className="btn dpad-right"
                onTouchStart={() => handleDirection('d', true)}
                onTouchEnd={() => handleDirection('d', false)}
                onMouseDown={() => handleDirection('d', true)}
                onMouseUp={() => handleDirection('d', false)}
            >
                ▶
            </button>
            </div>
            <button
            className="btn dpad-down"
            onTouchStart={() => handleDirection('s', true)}
            onTouchEnd={() => handleDirection('s', false)}
            onMouseDown={() => handleDirection('s', true)}
            onMouseUp={() => handleDirection('s', false)}
            >
            ▼
            </button>
        </div>

        {/* Botón de Acción (Espacio) */}
        <div className="action-container">
            <button
            className="btn btn-action"
            onTouchStart={() => input.handleSpace()}
            onClick={() => input.handleSpace()}
            >
            ESPACIO
            </button>
        </div>

        <style jsx>{`
            .touch-overlay {
            position: absolute;
            bottom: 24px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 24px;
            pointer-events: none; /* Allows click on canvas*/
            z-index: 10;
            user-select: none;
            }

            /* Hide on computer */
            @media (hover: hover) and (pointer: fine) {
            .touch-overlay {
                display: none;
            }
            }

            .dpad, .action-container {
            pointer-events: auto; /* Enable the button's interact */
            }

            .dpad {
            display: flex;
            flex-direction: column;
            align-items: center;
            }

            .dpad-row {
            display: flex;
            gap: 32px;
            }

            .btn {
            width: 52px;
            height: 52px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            color: white;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            touch-action: manipulation;
            }

            .btn:active {
            background: rgba(0, 255, 136, 0.6);
            border-color: #00ff88;
            }

            .btn-action {
            width: 72px;
            height: 72px;
            background: rgba(0, 255, 136, 0.3);
            border-color: #00ff88;
            font-size: 10px;
            }
        `}</style>
        </div>
    );
}