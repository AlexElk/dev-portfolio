'use client';

import { useEffect, useRef, useState } from "react";
import { createScene } from "../game/SceneSetUp";
import { InputHandler } from "../game/InputHandler";
import { Player } from "../game/Player";
import { CameraController } from "../game/CameraController";
import TouchControlls from "./TouchControls";
import { SceneManager, SceneType } from "../game/SceneManager";
import { MenuScene } from "../game/scenes/MenuScene";
import { OverworldScene } from "../game/scenes/OverworldScene";

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputHandler, setInputHandler] = useState<InputHandler | null>(null);
    const [currentSceneType, setCurrentSceneType] = useState<SceneType>('MENU');
    const sceneManagerRef = useRef<SceneManager | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const {renderer, cleanup: cleanupScene} = createScene(containerRef.current);
        const input = new InputHandler();
        setInputHandler(input);

        const manager = new SceneManager((type) => setCurrentSceneType(type));
        sceneManagerRef.current = manager;

        manager.changeScene(new MenuScene, 'MENU');

        //Animation Loop
        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            if (manager.currentScene){
                manager.update(input);
                renderer.render(manager.currentScene.scene, manager.currentScene.camera);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animId);
            input.destroy();
            if (manager.currentScene) manager.currentScene.destroy();
            cleanupScene();
        };
    }, []);

    const handleStartGame = () => {
        if(sceneManagerRef.current && containerRef.current){
            sceneManagerRef.current.changeScene(
                new OverworldScene(containerRef.current, sceneManagerRef.current),
                'OVERWORLD'
            );
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

        {/* OVERLAY DEL MENÚ PRINCIPAL */}
        {currentSceneType === 'MENU' && (
            <div className="menu-overlay">
            <h1 className="title">AlexElk</h1>
            <div className="button-group">
                <button className="menu-btn" onClick={handleStartGame}>
                Start
                </button>
                <a
                href="https://github.com/AlexElk"
                target="_blank"
                rel="noopener noreferrer"
                className="menu-btn github-btn"
                >
                Github
                </a>
            </div>
            </div>
        )}

        {/* Tactile Control*/}
        {currentSceneType !== 'MENU' && <TouchControlls input={inputHandler} />}

        <style jsx>{`
            .menu-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            z-index: 20;
            background: rgba(0, 0, 0, 0.4);
            font-family: monospace;
            }

            .title {
            color: #00ff88;
            font-size: 3rem;
            text-shadow: 2px 2px #000;
            letter-spacing: 2px;
            }

            .button-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            }

            .menu-btn {
            padding: 12px 24px;
            font-size: 1.2rem;
            font-family: monospace;
            background: #111;
            color: #fff;
            border: 2px solid #00ff88;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            transition: all 0.2s;
            }

            .menu-btn:hover {
            background: #00ff88;
            color: #000;
            }
        `}</style>
        </div>
    );
}