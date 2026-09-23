'use client';

import { useEffect, useRef, useState } from "react";
import { createScene } from "../game/SceneSetUp";
import { InputHandler } from "../game/InputHandler";
import { Player } from "../game/Player";
import TouchControlls from "./TouchControls";

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputHandler, setInputHandler] = useState<InputHandler | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const {scene, camera, renderer, cleanup: cleanupScene} = createScene(containerRef.current);
        const input = new InputHandler();
        const player = new Player();

        setInputHandler(input);

        scene.add(player.mesh);

        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            player.update(input);
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animId);
            input.destroy();
            cleanupScene();
        };
    }, []);

    return <div ref={containerRef} style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <TouchControlls input={inputHandler}/>
            </div>;
}