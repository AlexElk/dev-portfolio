import * as THREE from "three";

export class CameraController{
    public camera: THREE.PerspectiveCamera;
    public domElement: HTMLElement;
    public yaw = 0; //Horizontal Angle
    public pitch = 0.3 //Vertical Angle

    private distance = 7;
    private heightOffset = 1.2;

    private inDialog = false;
    private dialogueCamPos = new THREE.Vector3();
    private dialogueLookAt = new THREE.Vector3()

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement)
    {
        this.camera = camera;
        this.domElement = domElement;
        this.setupEvents(domElement);
    }

    public startDialogueMode(playerPos: THREE.Vector3, npcPos: THREE.Vector3){
        this.inDialog = true;

        const midPoint = new THREE.Vector3().addVectors(playerPos, npcPos).multiplyScalar(0.5);
        this.dialogueLookAt.copy(midPoint).add(new THREE.Vector3(0, 0.8, 0));

        //Direction Vector and Lateral intersection
        const dir = new THREE.Vector3().subVectors(npcPos, playerPos).normalize();
        const sideDir = new THREE.Vector3(-dir.z, 0, dir.x); //Perpendicularity

        //Camera to the side and a little up
        this.dialogueCamPos
            .copy(midPoint)
            .add(sideDir.multiplyScalar(3.2))
            .add(new THREE.Vector3(0, 1.2, 0));
    }

    public endDialogueMode() {
        this.inDialog = false;
    }

    private setupEvents(element: HTMLElement ){

    let isDragging = false;
    let previousMouse = {x: 0, y: 0};
    let previousTouch = {x: 0, y: 0};

    let touchId: number | null = null;
    //compu
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouse = {x: e.clientX, y: e.clientY};
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || this.inDialog) return;

        const deltaX = e.clientX - previousMouse.x;
        const deltaY = e.clientY - previousMouse.y;

        this.rotate(deltaX * 0.005, deltaY * 0.003);
        previousMouse = {x: e.clientX, y: e.clientY};
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
    //touch

    element.addEventListener('touchstart', (e) => {
        if (this.inDialog || e.touches.length !== 1) return;

        const touch = e.touches[0];
        touchId = touch.identifier;
        previousTouch = {x: touch.clientX, y: touch.clientY};
    }, {passive: true});

    element.addEventListener('touchmove', (e) => {
        if (this.inDialog || touchId === null) return;

        const touch = Array.from(e.touches).find(({identifier}) => identifier === touchId);
        if (!touch) return;

        const deltaX = touch.clientX - previousTouch.x;
        const deltaY = touch.clientY - previousTouch.y;

        this.rotate(deltaX * 0.005, deltaY * 0.003);
        previousTouch = {x: touch.clientX, y: touch.clientY};
    }, {passive: true});

    const stopTouchDrag = (e: TouchEvent) => {
        if (this.inDialog || touchId === null) return; //*

        const touchEnded = Array.from(e.changedTouches)
            .some(({identifier}) => identifier === touchId);

        if (touchEnded) touchId = null;
    };

    element.addEventListener('touchend', stopTouchDrag, {passive: true});
    element.addEventListener('touchcancel', stopTouchDrag, {passive: true});
    }

    private rotate(deltaYaw: number, deltaPitch: number){
        this.yaw -= deltaYaw;
        this.pitch += deltaPitch;

        const maxPitch = Math.PI / 2 -0.1;
        const minPitch = -0.1;
        this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));
    }

    public update(targetPosition: THREE.Vector3)
    {
        if (this.inDialog){
            //Smooth transition
            this.camera.position.lerp(this.dialogueCamPos, 0.08);
            this.camera.lookAt(this.dialogueLookAt);
            return;
        }

        //where the camera looks
        const target = targetPosition.clone().add(new THREE.Vector3(0, this.heightOffset , 0));
        //Spheric coordinates to position the camera around the player
        const offSetX = this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
        const offSetY = this.distance * Math.sin(this.pitch);
        const offSetZ = this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);

        const desiredPos = new THREE.Vector3(target.x + offSetX, target.y + offSetY, target.z + offSetZ);
        this.camera.position.lerp(desiredPos, 0.1); //smooth transition
        this.camera.lookAt(target);
    }
}