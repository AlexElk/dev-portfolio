export class InputHandler{
    public keys = {w: false, a: false, s:false, d: false};

    constructor(){
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    public handleSpace()
    {
        console.log("Action!");
    }

    private handleKeyDown = (e: KeyboardEvent) => {
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
        const key = e.key.toLocaleLowerCase();
        if(key in this.keys)
        {
            this.keys[e.key as keyof typeof this.keys] = false;
        }
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