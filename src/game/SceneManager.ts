import * as THREE from "three";
import { InputHandler } from "./InputHandler";

export type SceneType = 'MENU' | 'OVERWORLD' | 'INTERIOR';

export interface IScene {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    update(input: InputHandler): void;
    destroy(): void;
}

export class SceneManager{
    public currentScene: IScene | null = null;
    public currentType: SceneType = 'MENU';
    private onSceneChangeCallBack?: (type: SceneType) => void;

    constructor(onSceneChange?: (type: SceneType) => void){
        this.onSceneChangeCallBack = onSceneChange;
    }

    public changeScene(newScene: IScene, type: SceneType){
        if (this.currentScene){
            this.currentScene.destroy();
        }
        this.currentScene = newScene;
        this.currentType = type

        if (this.onSceneChangeCallBack)
        {
            this.onSceneChangeCallBack(type);
        }
    }

    public update(input: InputHandler){
        if(this.currentScene)
        {
            this.currentScene.update(input);
        }
    }
}