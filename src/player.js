class Player extends Character {
    constructor(x, y, speed, controls, color, magicKey, engine) {
        super(x, y, speed, color, engine);
        this.controls = controls;
        this.magicKey = magicKey;
        this.magics = [];
        this.magicCooldown = 100;
        this.lastMagicTime = 0;
        this.isCastingMagic = false;
        this.castingDuration = 30;
        this.castingLoop = this.castingDuration;
    }

}
