class TankScene extends Phaser.Scene {

    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    destructLayer
    /** @type {PlayerTank} */
    player
    /** @type {Array.<EnemyTank>} */
    enemyTanks = []
    /** @type {number} */
    Lives = 10
    /** @type {Phaser.Physics.Arcade.Group} */
    bullets
    /** @type {Phaser.Physics.Arcade.Group} */
    enemyBullets

    preload() {
        //-- Preload Assets --//
        this.load.image('bullet', 'assets/tanks/bullet.png')
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json')
        this.load.image('tileset', 'assets/tanks/landscape-tileset.png')
        this.load.image('borderBox', 'assets/borderbox.png')
        this.load.image('reticle', 'assets/reticle.cur')
        this.load.image('life', 'assets/life.png')
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')
    }

    create() {
        //-- Load in Tilemap --//
        this.map = this.make.tilemap({key:'level1'})
        const landscape = this.map.addTilesetImage('landscape-tileset', 'tileset')
        this.map.createLayer('groundLayer', [landscape], 0, 0)
        this.destructLayer = this.map.createLayer('destructibleLayer', [landscape], 0, 0)
        this.destructLayer.setCollisionByProperty({collides: true})
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //-- User Interface Stuff --//
        //-- Reticle Conversion --//
        this.input.setDefaultCursor('url(assets/reticle_1.cur), pointer')
        //-- Create Border Box --//
        var border = this.add.image(0, 0, 'borderBox')
        border.setOrigin(0, 0)
        border.setScrollFactor(0, 0)
        border.setDepth(5)
        //-- Tank Health --//
        var tankHealthText = this.add.text( 30, 30, 'Lives: ', {
            fontSize: '40px',
        })
        tankHealthText.setScrollFactor(0, 0)
        tankHealthText.setDepth(5)
        tankHealthText.setTint(0x39FF14)
        this.life1 = this.add.image(195, 49, 'life')
        this.life1.setScrollFactor(0, 0)
        this.life1.setDepth(5)
        this.life2 = this.add.image(245, 49, 'life')
        this.life2.setScrollFactor(0, 0)
        this.life2.setDepth(5)
        this.life3 = this.add.image(295, 49, 'life')
        this.life3.setScrollFactor(0, 0)
        this.life3.setDepth(5)
        this.life4 = this.add.image(345, 49, 'life')
        this.life4.setScrollFactor(0, 0)
        this.life4.setDepth(5)
        this.life5 = this.add.image(395, 49, 'life')
        this.life5.setScrollFactor(0, 0)
        this.life5.setDepth(5)
        //-- Enemy Tanks Remaining --//
        var tanksRemaining = this.add.text( 30, 80, 'Tanks Remaining: ', {
            fontSize: '40px',
        })
        tanksRemaining.setScrollFactor(0, 0)
        tanksRemaining.setDepth(5)
        tanksRemaining.setTint(0x39FF14)
        //-- Tank Fuel --//
        //-- Tank Speed --//
        var tankSpeedText = this.add.text(30, 570, 'Tank Speed = ', {
            fontSize: '20px'
        })
        tankSpeedText.setScrollFactor(0, 0)
        tankSpeedText.setDepth(5)
        tankSpeedText.setTint(0x39FF14)
        //-- Radar Scanning --//
        //-- Create Bullets --//
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
        objectLayer.objects.forEach(function(object){
            actor = Utils.RetrieveCustomProperties(object)
            if(actor.type == 'playerSpawn'){
                this.createPlayer(actor)
            }
            else if(actor.type == 'enemySpawn'){
                enemyObjects.push(actor)
            }
        }, this)
        this.cameras.main.startFollow(this.player.hull, true, 0.25, 0.25)
        for(let i = 0; i < enemyObjects.length; i++){
            this.createEnemy(enemyObjects[i])
        }
    }

    update(time, delta) {
        this.player.update()
        for(let i = 0; i < this.enemyTanks.length; i++){
            this.enemyTanks[i].update(time, delta)
        }
    }

    createEnemy(dataObject){
        let enemyTank = new EnemyTank(this, dataObject.x, dataObject.y, 'enemy', 'tank1', this.player)
        enemyTank.initMovement()
        enemyTank.enableCollision(this.destructLayer)
        this.physics.add.collider(enemyTank.hull, this.player.hull)
        this.enemyTanks.push(enemyTank)
        if(this.enemyTanks.length > 1){
            for(let i = 0; i < this.enemyTanks.length - 1; i++){
                this.physics.add.collider(enemyTank.hull, this.enemyTanks[i].hull)
            }
        }
    }

    createPlayer(dataObject) {
        this.player = new PlayerTank(this, dataObject.x, dataObject.y, 'tank', 'tank1')
        this.player.enableCollision(this.destructLayer)
    }
}