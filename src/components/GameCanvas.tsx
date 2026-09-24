'use client';

import { useEffect, useRef, useState } from "react";
import { createScene } from "../game/SceneSetUp";
import { InputHandler } from "../game/InputHandler";
import { Player } from "../game/Player";
import { CameraController } from "../game/CameraController";
import TouchControlls from "./TouchControls";

export default function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputHandler, setInputHandler] = useState<InputHandler | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const {scene, camera, renderer, cleanup: cleanupScene} = createScene(containerRef.current);
        const input = new InputHandler();
        const player = new Player();

        const cameraController = new CameraController(camera, containerRef.current);

        setInputHandler(input);

        scene.add(player.mesh);

        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            player.update(input, cameraController.yaw);

            cameraController.update(player.mesh.position);

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animId);
            input.destroy();
            cleanupScene();
        };
    }, []);

    return <div  style={{position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden'}}>
                <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none'}}/>
                <TouchControlls input={inputHandler}/>
            </div>;
}