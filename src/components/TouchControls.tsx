'use client'

import { InputHandler } from "../game/InputHandler";

interface TouchControlProps {
    input: InputHandler | null;
}

export default function TouchControls({input}: TouchControlProps)
{
    if (!input) return null;

    const handleDirection = (e: React.TouchEvent | React.MouseEvent, key: 'w' | 'a' | 's' | 'd', active: boolean) => {
        e.stopPropagation();
        input.setKey(key, active);
    }

    const handleAction = (e: React.TouchEvent | React.MouseEvent) => {
        e.stopPropagation();
        if (e.type === 'touchstart' || e.type === 'click') {
        input.handleSpace();
        }
    };

    return (
        <div className="touch-overlay">
        {/* D-Pad */}
        <div className="dpad">
            <button
            className="btn dpad-up"
            onTouchStart={(e) => handleDirection(e, 'w', true)}
            onTouchEnd={(e) => handleDirection(e, 'w', false)}
            onMouseDown={(e) => handleDirection(e, 'w', true)}
            onMouseUp={(e) => handleDirection(e, 'w', false)}
            >
            ▲
            </button>
            <div className="dpad-row">
            <button
                className="btn dpad-left"
                onTouchStart={(e) => handleDirection(e, 'a', true)}
                onTouchEnd={(e) => handleDirection(e, 'a', false)}
                onMouseDown={(e) => handleDirection(e, 'a', true)}
                onMouseUp={(e) => handleDirection(e, 'a', false)}
            >
                ◀
            </button>
            <button
                className="btn dpad-right"
                onTouchStart={(e) => handleDirection(e, 'd', true)}
                onTouchEnd={(e) => handleDirection(e, 'd', false)}
                onMouseDown={(e) => handleDirection(e, 'd', true)}
                onMouseUp={(e) => handleDirection(e, 'd', false)}
            >
                ▶
            </button>
            </div>
            <button
            className="btn dpad-down"
            onTouchStart={(e) => handleDirection(e, 's', true)}
            onTouchEnd={(e) => handleDirection(e, 's', false)}
            onMouseDown={(e) => handleDirection(e, 's', true)}
            onMouseUp={(e) => handleDirection(e, 's', false)}
            >
            ▼
            </button>
        </div>

        {/* Action Button */}
        <div className="action-container">
            <button
            className="btn btn-action"
            onTouchStart={handleAction}
            onClick={handleAction}
            >
            ACTION
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