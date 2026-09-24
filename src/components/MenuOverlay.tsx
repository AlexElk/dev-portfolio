'use client'

interface MenuOverlayProps{
    onStart: () => void;
}

export default function MenuOverlay({ onStart}: MenuOverlayProps){
    return(
        <div className="menu-container">
        <div className="menu-card">
            <h1>AlexElk</h1>
            <p>alejandro.pina@gmail.com</p>

            <div className="button-group">
            <button 
                className="btn btn-primary" 
                onClick={(e) => {
                    (e.target as HTMLElement).blur(); 
                    onStart();
                    }}
            >
                Start
            </button>
            
            <button 
                className="btn btn-secondary" 
                onClick={() => window.open('https://github.com', '_blank')}
            >
                Github
            </button>
            </div>
        </div>

        <style jsx>{`
            .menu-container {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(10, 10, 14, 0.85);
            backdrop-filter: blur(8px);
            z-index: 30;
            }

            .menu-card {
            text-align: center;
            color: white;
            background: rgba(255, 255, 255, 0.05);
            padding: 40px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }

            h1 {
            font-size: 36px;
            margin: 0 0 8px 0;
            color: #00ff88;
            letter-spacing: 2px;
            }

            p {
            color: #aaa;
            margin-bottom: 32px;
            }

            .button-group {
            display: flex;
            flex-direction: column;
            gap: 16px;
            }

            .btn {
            padding: 12px 32px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.1s, background 0.2s;
            }

            .btn:active {
            transform: scale(0.96);
            }

            .btn-primary {
            background: #00ff88;
            color: #101014;
            border: none;
            }

            .btn-secondary {
            background: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            }
        `}</style>
        </div>
    );
}