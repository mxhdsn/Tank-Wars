class TankScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    destructLayer
    /** @type {PlayerTank} */
    player
    /** @type {Array.<EnemyTank>} */
    enemyTanks = []
    /** @type {Phaser.Physics.Arcade.Group} */
    bullets
    /** @type {Phaser.Physics.Arcade.Group} */
    enemyBullets
    /**@type {Phaser.GameObjects.Group} */
    explosions
    /** @type {number} */
    tankSpeed = 0
    /** @type {number} */
    tanksRemaining = 5
    /** @type {number} */
    playerHealth = 10
    /** @type {number} */
    tankFuelAmount = 100

    preload() {
        this.load.image('bullet', 'assets/tanks/bullet.png')
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('assassin', 'assets/tanks/assassin-tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('boss', 'assets/tanks/boss-tanks.png', 'assets/tanks/tanks.json')
        this.load.image('tileset', 'assets/tanks/landscape-tileset.png')
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')
        this.load.image('borderBox', 'assets/borderbox.png')
        this.load.image('reticle', 'assets/reticle.cur')
        this.load.image('life', 'assets/life.png')
        this.load.image('tankRadar', 'assets/tank-radar.png')
        this.load.image('fuelCan', 'assets/fuel-can.png')
        this.load.spritesheet('tankFuel', 'assets/tanks/tank-fuel.png',
            {
                frameWidth: 200,
                frameHeight: 20
            })
        this.load.spritesheet('kaboom', 'assets/tanks/explosion.png',
            {
                frameWidth: 64,
                frameHeight: 64
            })
    }
    create() {
        // load in the tilemap
        this.map = this.make.tilemap({ key: 'level1' })
        const landscape = this.map.addTilesetImage('landscape-tileset', 'tileset')
        this.map.createLayer('groundLayer', [landscape], 0, 0)
        this.destructLayer = this.map.createLayer('destructableLayer', [landscape], 0, 0)
        this.destructLayer.setCollisionByProperty({ collides: true })
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        

        // create bullets
        this.enemyBullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        })
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 5
        })


        const objectLayer = this.map.getObjectLayer('objectLayer')
        let enemyObjects = []
        let actor
        objectLayer.objects.forEach(function (object) {
            actor = Utils.RetrieveCustomProperties(object)
            if (actor.type == "playerSpawn") {
                this.createPlayer(actor)
            } else if (actor.type == "enemySpawn" || actor.type == "bossSpawn" || actor.type == 'assassinSpawn') {
                enemyObjects.push(actor)
            } else if (actor.type == 'fuelSpawn') {
                this.createFuelCan(actor)
            }
        }, this)
        this.cameras.main.startFollow(this.player.hull, true, 0.25, 0.25)
        for (let i = 0; i < enemyObjects.length; i++) {
            this.createEnemy(enemyObjects[i])
        }

        // create explosions
        this.explosions = this.add.group({
            defaultKey: 'kaboom',
            maxSize: enemyObjects.length + 1
        })
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('kaboom', {
                start: 0,
                end: 23,
                first: 23
            }),
            frameRate: 24
        })
        this.input.on('pointerdown', this.tryShoot, this)
        this.physics.world.on('worldbounds', function (body) {
            this.disposeOfBullet(body.gameObject)
        }, this)

        //-- User Interface Stuff --//
        //-- Reticle Conversion --//
        this.input.setDefaultCursor('url(assets/reticle_1.cur), pointer')

        //-- Create Border Box --//
        var border = this.add.image(0, 0, 'borderBox')
        border.setOrigin(0, 0)
        border.setScrollFactor(0, 0)
        border.setDepth(5)

        //-- Tank Health --//
        this.tankHealthUI()

        //-- Enemy Tanks Remaining --//
        this.tanksRemaining = enemyObjects.length
        this.tanksRemainingUI()

        //-- Tank Fuel --//
        this.tankFuelUI()
        this.physics.add.overlap(this.player.hull, this.fuel, this.fuelCollected, null, this)

        //-- Tank Speed --//
        this.tankSpeed = this.player.currentSpeed
        this.tankSpeedUI()

        //-- Radar Scanning --//
        this.tankRadarUI()
    }

    update(time, delta) {
        this.player.update()
        for (let i = 0; i < this.enemyTanks.length; i++) {
            this.enemyTanks[i].update(time, delta)
        }
        if(this.playerHealth < 10){
            this.life10.destroy(true)
        }
        if(this.playerHealth < 9){
            this.life9.destroy(true)
        }
        if(this.playerHealth < 8){
            this.life8.destroy(true)
        }
        if(this.playerHealth < 7){
            this.life7.destroy(true)
        }
        if(this.playerHealth < 6){
            this.life6.destroy(true)
        }
        if(this.playerHealth < 5){
            this.life5.destroy(true)
        }
        if(this.playerHealth < 4){
            this.life4.destroy(true)
        }
        if(this.playerHealth < 3){
            this.life3.destroy(true)
        }
        if(this.playerHealth < 2){
            this.life2.destroy(true)
        }
        if(this.playerHealth < 1){
            this.life1.destroy(true)
        }
    }

    createEnemy(dataObject) {
        let enemyTank
        if (dataObject.type == 'enemySpawn') {
            enemyTank = new EnemyTank(this, dataObject.x, dataObject.y, 'enemy', 'tank1', this.player)
        } else if (dataObject.type == 'bossSpawn') {
            enemyTank = new BossTank(this, dataObject.x, dataObject.y, 'boss', 'tank1', this.player)
        } else if (dataObject.type == 'assassinSpawn') {
            enemyTank = new AssassinTank(this, dataObject.x, dataObject.y, 'assassin', 'tank1', this.player)
        }
        enemyTank.initMovement()
        enemyTank.enableCollision(this.destructLayer)
        enemyTank.setBullets(this.enemyBullets)
        this.physics.add.collider(enemyTank.hull, this.player.hull)
        this.enemyTanks.push(enemyTank)
        if (this.enemyTanks.length > 1) {
            for (let i = 0; i < this.enemyTanks.length - 1; i++) {
                this.physics.add.collider(enemyTank.hull, this.enemyTanks[i].hull)
            }
        }
    }

    createPlayer(dataObject) {
        this.player = new PlayerTank(this, dataObject.x, dataObject.y, 'tank', 'tank1')
        this.player.enableCollision(this.destructLayer)
    }

    tryShoot(pointer) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        let bullet = this.bullets.get(this.player.turret.x, this.player.turret.y)
        if (bullet) {
            this.fireBullet(bullet, this.player.turret.rotation, this.enemyTanks)
        }
    }

    fireBullet(bullet, rotation, target) {
        // bullet is a sprite
        bullet.setDepth(3)
        bullet.body.collideWorldBounds = true
        bullet.body.onWorldBounds = true
        bullet.enableBody(false, bullet.x, bullet.y, true, true)
        bullet.rotation = rotation
        this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity)
        this.physics.add.collider(bullet, this.destructLayer, this.damageWall, null, this)
        if (target === this.player) {
            this.physics.add.overlap(this.player.hull, bullet, this.bulletHitPlayer, null, this)
        } else {
            for (let i = 0; i < this.enemyTanks.length; i++) {
                this.physics.add.overlap(this.enemyTanks[i].hull, bullet, this.bulletHitEnemy, null, this)
            }
        }

    }

    bulletHitPlayer(hull, bullet) {
        this.disposeOfBullet(bullet)
        this.player.damage()
        this.playerHealth -= 1
        if (this.player.isDestroyed()) {
            this.input.enabled = false
            this.enemyTanks = []
            this.physics.pause()
            this.gameOver()
            let explosion = this.explosions.get(hull.x, hull.y)
            if (explosion) {
                this.activateExplosion(explosion)
                explosion.play('explode')
            }
        }
    }

    bulletHitEnemy(hull, bullet) {
        /** @type {EnemyTank} */
        let enemy
        /** @type {number} */
        let index
        for (let i = 0; i < this.enemyTanks.length; i++) {
            if (this.enemyTanks[i].hull === hull) {
                enemy = this.enemyTanks[i]
                index = i
                break
            }
        }
        this.disposeOfBullet(bullet)
        enemy.damage()
        if (enemy.isImmobilised()) {
            let explosion = this.explosions.get(hull.x, hull.y)
            if (explosion) {
                this.activateExplosion(explosion)
                explosion.on('animationcomplete', this.animComplete, this)
                explosion.play('explode')
            }
            if (enemy.isDestroyed()) {
                // remove from array
                this.enemyTanks.splice(index, 1)
                this.tanksRemaining -= 1
                this.updateTanksRemainingUI()
            }
        }
    }

    activateExplosion(explosion) {
        explosion.setDepth(5)
        explosion.setActive(true)
        explosion.setVisible(true)
    }

    damageWall(bullet, tile) {
        this.disposeOfBullet(bullet)
        // retrieve the tileset firtgid (used as an offset)
        let firstGid = this.destructLayer.tileset[0].firstgid
        // get next tile id
        let nextTileId = tile.index + 1 - firstGid
        // get next tile properties
        let tileProperties = this.destructLayer.tileset[0].tileProperties[nextTileId]
        let newTile = this.destructLayer.putTileAt(nextTileId + firstGid, tile.x, tile.y)
        if (tileProperties && tileProperties.collides) {
            newTile.setCollision(true)
        }
    }

    disposeOfBullet(bullet) {
        bullet.disableBody(true, true)
    }

    animComplete(animation, frame, gameObject) {
        this.explosions.killAndHide(gameObject)
    }

    tankHealthUI(player) {
        var tankHealthText = this.add.text(30, 30, 'Lives: ', {
            fontSize: '30px',
        })
        tankHealthText.setScrollFactor(0, 0)
        tankHealthText.setDepth(5)
        tankHealthText.setTint(0x39FF14)
        this.life1 = this.add.image(160, 45, 'life')
        this.life1.setScrollFactor(0, 0)
        this.life2 = this.add.image(200, 45, 'life')
        this.life2.setScrollFactor(0, 0)
        this.life3 = this.add.image(240, 45, 'life')
        this.life3.setScrollFactor(0, 0)
        this.life4 = this.add.image(280, 45, 'life')
        this.life4.setScrollFactor(0, 0)
        this.life5 = this.add.image(320, 45, 'life')
        this.life5.setScrollFactor(0, 0)
        this.life6 = this.add.image(360, 45, 'life')
        this.life6.setScrollFactor(0, 0)
        this.life7 = this.add.image(400, 45, 'life')
        this.life7.setScrollFactor(0, 0)
        this.life8 = this.add.image(440, 45, 'life')
        this.life8.setScrollFactor(0, 0)
        this.life9 = this.add.image(480, 45, 'life')
        this.life9.setScrollFactor(0, 0)
        this.life10 = this.add.image(520, 45, 'life')
        this.life10.setScrollFactor(0, 0)
    }

    tanksRemainingUI(enemy) {
        this.tanksRemainingText = this.add.text(30, 65, 'Tanks Remaining:' + this.tanksRemaining, {
            fontSize: '30px',
        })
        this.tanksRemainingText.setScrollFactor(0, 0)
        this.tanksRemainingText.setDepth(5)
        this.tanksRemainingText.setTint(0x39FF14)
    }

    updateTanksRemainingUI(){
        this.tanksRemainingText.setText('Tanks Remaining:' + this.tanksRemaining)
    }

    tankFuelUI(player) {
        this.tankFuel = this.add.text(30, 540, 'Fuel: ', {
            fontSize: '20px',
        })
        this.tankFuel.setScrollFactor(0, 0)
        this.tankFuel.setDepth(5)
        this.tankFuel.setTint(0x39FF14)
        this.tankFuelSprite = this.add.sprite(200, 550, 'tankFuel', 0)
        this.tankFuelSprite.setScrollFactor(0, 0)
        this.tankFuelSprite.setDepth(5)
    }

    createFuelCan(dataObject) {
        this.fuel = this.add.sprite(dataObject.x, dataObject.y, 'fuelCan')
        this.fuel.setDepth(4)
    }

    fuelCollected(player, fuel) {
        this.fuel.destroy()
        this.tankFuelAmount += 100
        console.log(this.tankFuelAmount)
    }

    tankSpeedUI(player) {
        this.tankSpeedText = this.add.text(30, 570, 'Tank Speed:' + this.tankSpeed, {
            fontSize: '20px'
        })
        this.tankSpeedText.setScrollFactor(0, 0)
        this.tankSpeedText.setDepth(5)
        this.tankSpeedText.setTint(0x39FF14)
    }
    updateTankSpeedUI(){
        this.tankSpeedText.setText('Tank Speed:' + this.tankSpeed)
    }

    tankRadarUI() {
        var tankRadar = this.add.image(700, 500, 'tankRadar')
        tankRadar.setScrollFactor(0, 0)
        tankRadar.setDepth(5)
    }

    gameOver() {
        var gameOverText = this.add.text(180, 250, 'Game Over', {
            fontSize: '90px'
        })
        gameOverText.setTint(0x39FF14)
        gameOverText.setScrollFactor(0, 0)
        gameOverText.setDepth(5)
    }
}