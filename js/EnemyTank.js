class EnemyTank extends BaseTank {

    /** @type {PlayerTank} */
    player

    constructor(scene, x, y, texture, frame, player){
        super(scene, x, y, texture, frame)
        this.player = player
        this.hull.angle = Phaser.Math.RND.angle()
    }

    initMovement(){
        this.scene.physics.velocityFromRotation(this.hull.rotation, this.tankSpeed,this.hull.body.rotation)
    }

    update(time, delta){
        super.update()
    }
}