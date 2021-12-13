class TankScene extends Phaser.Scene {

    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer} */
    destructLayer

    preload() {
        //-- Preload Assets --//
        this.load.image('tileset', 'assets/tanks/landscape-tileset.png')
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

        //-- Player Tank --//
    }

    update(time, delta) {

    }
}