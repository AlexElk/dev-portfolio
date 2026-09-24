import * as THREE from "three";
import { Player } from "../Player";
import { InputHandler } from "../InputHandler";
import { IScene, SceneManager } from "../SceneManager";
import { CameraController } from "../CameraController";
import { OverworldScene } from "./OverworldScene";
import { Thasadith } from "next/font/google";

export class HouseInteriorScene implements IScene{
    public scene : THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    private player: Player;
    private cameraController: CameraController;
    private exitDoor: THREE.Mesh;
    private sceneManager: SceneManager;
    private domElement: HTMLElement;


    constructor(domElement: HTMLElement, sceneManager: SceneManager)
    {
        this.domElement = domElement;
        this.sceneManager = sceneManager;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);

        this.camera = new THREE.PerspectiveCamera(75, 256 / 224, 0.1, 1000);
        this.cameraController = new CameraController(this.camera, domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 3, 0);
        this.scene.add(light, new THREE.AmbientLight(0x222233));

        this.player = new Player();
        this.player.mesh.position.set(0, 0.5, 2);
        this.scene.add(this.player.mesh);

        this.buildRoom();

        const doorGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
        const doorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.exitDoor = new THREE.Mesh(doorGeo, doorMat);
        this.exitDoor.position.set(0, 0.05, 3);
        this.scene.add(this.exitDoor);
    }

    private buildRoom(){
        const wallMat = new THREE.MeshBasicMaterial({color: 0x444455});

        //floor
        const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), wallMat);
        floor.position.y = -0.1;
        this.scene.add(floor);
        
        //walls
        const wallN = new THREE.Mesh(new THREE.BoxGeometry(8,4, 0.2), wallMat);
        wallN.position.set(0, 2, -4);

        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.2,4, 8), wallMat);
        wallE.position.set(4, 2, 0);

        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.2,4, 8), wallMat);
        wallW.position.set(-4, 2, 0);

        this.scene.add(wallN, wallE, wallW);
    }

    public update(input: InputHandler): void {
        this.player.update(input, this.cameraController.yaw);
        this.cameraController.update(this.player.mesh.position);

        const distanceToExit = this.player.mesh.position.distanceTo(this.exitDoor.position);

        if (distanceToExit < 1.0) {
            console.log("Exit to Overworld");
            this.sceneManager.changeScene(
                new OverworldScene(this.domElement, this.sceneManager),
                'OVERWORLD'
            );
        }
    }

    public destroy(): void {
        this.scene.clear();
    }
}