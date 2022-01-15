class AssassinTank extends EnemyTank{
    /** @type {number} */
    shotInterval = 700
    /** @type {number} */
    tankSpeed = 300
    /** @type {number} */
    damageMax = 2
    constructor(scene, x, y, texture, frame, player){
        super(scene, x, y, texture, frame, player)
    }
}