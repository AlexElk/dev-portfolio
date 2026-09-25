export class InputHandler{
    public keys = {w: false, a: false, s:false, d: false};
    public jumpHeld = false;
    private jumpPressed = false;
    private actionHandler = () => {
        console.log("Action!");
    };

    constructor(){
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    public handleSpace()
    {
        this.actionHandler();
    }

    public setActionHandler(handler: () => void): () => void {
        const previousHandler = this.actionHandler;
        this.actionHandler = handler;
        return previousHandler;
    }

    public restoreActionHandler(handler: () => void): void {
        this.actionHandler = handler;
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            this.pressJump();
            return;
        }

        if (e.key.toLowerCase() === 'e') {
            e.preventDefault();
            this.handleSpace();
            return;
        }

        const key = e.key.toLowerCase();
        if(key in this.keys)
        {
            this.keys[key as keyof typeof this.keys] = true;
        }

    }

    private handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            this.releaseJump();
            return;
        }

        const key = e.key.toLocaleLowerCase();
        if(key in this.keys)
        {
            this.keys[e.key as keyof typeof this.keys] = false;
        }
    }

    public consumeJumpPress(): boolean {
        const wasPressed = this.jumpPressed;
        this.jumpPressed = false;
        return wasPressed;
    }

    public pressJump(): void {
        if (!this.jumpHeld) this.jumpPressed = true;
        this.jumpHeld = true;
    }

    public releaseJump(): void {
        this.jumpHeld = false;
    }

    public setKey(key: 'w' | "s" | "a" | "d", active: boolean)
    {
        this.keys[key] = active;
    }

    public destroy(){
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}