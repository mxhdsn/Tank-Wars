class PlayerTank extends BaseTank {

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        this.cursors = this.scene.input.keyboard.createCursorKeys()
        this.keys = this.scene.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        })
        this.damageMax = 10
        this.currentSpeed = 0
    }

    update() {
        super.update()
        if (this.keys.up.isDown) {
            if (this.currentSpeed < this.tankSpeed) {
                this.currentSpeed += 10
            }
        }
        else if (this.keys.down.isDown) {
            if (this.currentSpeed > -this.tankSpeed) {
                this.currentSpeed -= 10
            }
        }
        else { this.currentSpeed *= 0.9 }

        if (this.keys.left.isDown) {
            if (this.currentSpeed > 0) {
                this.hull.angle--
            }
            else { this.hull.angle++ }
        }
        else if (this.keys.right.isDown) {
            if (this.currentSpeed > 0){
                this.hull.angle++
            }
            else { this.hull.angle-- }       
        }

        this.scene.physics.velocityFromRotation(this.hull.rotation, this.currentSpeed, this.hull.body.velocity)
        const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main)
        this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, worldPoint.x, worldPoint.y)
        }
}