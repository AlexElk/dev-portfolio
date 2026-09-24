// src/components/GameCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createScene } from '../game/SceneSetUp';
import { InputHandler } from '../game/InputHandler';
import { Player } from '../game/Player';
import { CameraController } from '../game/CameraController';
import { setupOverworldScene, setupInteriorScene, HouseTrigger } from '../game/Scenes';
import TouchControls from './TouchControls';
import MenuOverlay from './MenuOverlay';
import InteractionPrompt from './InteractionPrompt';

type SceneState = 'MENU' | 'OVERWORLD' | 'INTERIOR';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados del juego
  const [sceneState, setSceneState] = useState<SceneState>('MENU');
  const [inputHandler, setInputHandler] = useState<InputHandler | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);

  // Estado para el prompt flotante
  const [promptData, setPromptData] = useState<{
    visible: boolean;
    position: THREE.Vector3 | null;
    text: string;
  }>({ visible: false, position: null, text: '' });

  const activeTriggerRef = useRef<HouseTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera: mainCam, renderer, cleanup: cleanupScene } = createScene(containerRef.current);
    const input = new InputHandler();
    const player = new Player();
    const cameraController = new CameraController(mainCam, containerRef.current);

    setCamera(mainCam);
    setInputHandler(input);

    let triggers: HouseTrigger[] = [];

    // Cargar elementos 3D según el estado actual
    if (sceneState === 'OVERWORLD') {
      scene.add(player.mesh);
      triggers = setupOverworldScene(scene);
    } else if (sceneState === 'INTERIOR') {
      player.mesh.position.set(0, 0.5, 2); // Posición de entrada
      scene.add(player.mesh);
      triggers = setupInteriorScene(scene);
    }

    // Sobrescribir la acción de la tecla Espacio
    input.handleSpace = () => {
      if (activeTriggerRef.current) {
        if (activeTriggerRef.current.type === 'ENTER') {
          setSceneState('INTERIOR');
        } else if (activeTriggerRef.current.type === 'EXIT') {
          setSceneState('OVERWORLD');
        }
      }
    };

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (sceneState !== 'MENU') {
        player.update(input, cameraController.yaw);
        cameraController.update(player.mesh.position);

        // Detectar cercanía con zonas de interacción
        let nearTrigger: HouseTrigger | null = null;
        for (const trigger of triggers) {
          const dist = player.mesh.position.distanceTo(trigger.position);
          if (dist < 1.5) {
            nearTrigger = trigger;
            break;
          }
        }

        activeTriggerRef.current = nearTrigger;

        if (nearTrigger) {
          setPromptData({
            visible: true,
            position: nearTrigger.promptPosition,
            text: nearTrigger.type === 'ENTER' ? '' : '', //Enter or Exit
          });
        } else {
          setPromptData((prev) => ({ ...prev, visible: false }));
        }
      }

      renderer.render(scene, mainCam);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      input.destroy();
      cleanupScene();
    };
  }, [sceneState]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />

      {/* Menú Principal */}
      {sceneState === 'MENU' && (
        <MenuOverlay onStart={() => setSceneState('OVERWORLD')} />
      )}

      {/* Texto Flotante Reutilizable */}
      <InteractionPrompt
        visible={promptData.visible && sceneState !== 'MENU'}
        position={promptData.position}
        camera={camera}
        text={promptData.text}
      />

      {/* Controles Táctiles (solo fuera del menú) */}
      {sceneState !== 'MENU' && <TouchControls input={inputHandler} />}
    </div>
  );
}