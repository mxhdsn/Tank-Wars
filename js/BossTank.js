class BossTank extends BaseTank {

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        this.cursors = this.scene.input.keyboard.createCursorKeys()
        this.keys = this.scene.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        })
        this.damageMax = 5
        this.currentSpeed = 0
    }
    
}