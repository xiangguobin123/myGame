var game = new Phaser.Game(1280, 768, Phaser.CANVAS, 'game');
var left=false;             //记录虚拟按键状态
var right=false;
var up=false;
var score = 0;               //记录分数
var bestScore = bestScore || 0;
var startTime = 0;
var nowTime = 0;
var gameTime = 0;
var playerCount = 0;

var BasicGame = {};

BasicGame.Boot = function (game) {};
BasicGame.Boot.prototype = {

    preload: function () {
        this.load.image('preloaderBackground', 'assets/images/title_background.jpg');
        this.load.image('preloaderBar', 'assets/images/preloadr_bar.png');

    },

    create: function () {
        this.stage.disableVisibilityChange = true;
        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.refresh();
        }
        this.state.start('Preloader');
    }

};

BasicGame.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

BasicGame.Preloader.prototype = {

    preload: function () {
        this.background = this.add.sprite(0, 0, 'preloaderBackground');
        this.preloadBar = this.add.sprite(400, 600, 'preloaderBar');

        this.load.setPreloadSprite(this.preloadBar);
        this.load.spritesheet('button', 'assets/images/button_sprite_sheet.png',265,98);
        this.load.tilemap('map', 'assets/tilemap/level.json',null, Phaser.Tilemap.TILED_JSON);

        game.load.image('background', 'assets/images/sky.png');
        this.load.image('simgledude','assets/images/simgledude.png');
        this.load.image('simplerobo','assets/images/simplerobo.png');
        this.load.image('simplepepo','assets/images/simplepepo.png');
        this.load.image('platforms', 'assets/images/platforms.png');
        this.load.spritesheet('robo','assets/images/robo.png',48,78);
        this.load.spritesheet('dude','assets/images/dude.png',48,78);
        this.load.spritesheet('pepo','assets/images/pepo.png',48,78);
        this.load.image('gem','assets/images/gem.png');
        this.load.spritesheet('buttonhorizontal', 'assets/images/button-horizontal.png',350,200);
        this.load.spritesheet('buttonjump', 'assets/images/button-jump.png',200,200);

        this.load.audio('starsound','assets/music/star.wav');
        this.load.audio('gameover','assets/music/gameover.wav');
    },

    create: function () {
        this.preloadBar.cropEnabled = false;
    },
    update: function () {
        this.ready = true;
        this.state.start('MainMenu');
    }
};
BasicGame.MainMenu = function (game) {};
BasicGame.MainMenu.prototype = {
    create:function () {
        this.add.sprite(0,0,'background');
        game.add.button(540,300,'simgledude',this.onDudeClick,this,0,0,0,0);
        game.add.button(640,300,'simplerobo',this.onRoboClick,this,0,0,0,0);
        game.add.button(740,300,'simplepepo',this.onPepoClick,this,0,0,0,0);
        this.playerText = game.add.text(510, 400, "点击图标选择不同的角色", "font: '20px Arial', fill: '#ff0000'");
    },
    onDudeClick:function () {
        playerCount = 1;
        game.state.start('Game');
        startTime = new Date();
    },
    onRoboClick:function () {
        playerCount = 2;
        game.state.start('Game');
        startTime = new Date();
    },
    onPepoClick:function () {
        playerCount = 3;
        game.state.start('Game');
        startTime = new Date();
    }
};
BasicGame.Game = function (game) {};
BasicGame.Game.prototype = {
    create: function () {
        this.map = this.game.add.tilemap('map');        //创建地图
        this.map.addTilesetImage('gem');
        this.map.addTilesetImage('platforms');
        this.map.setTileIndexCallback(61,this.hitCoin,this);
        this.map.setTileIndexCallback(24,this.dead,this);
        this.map.setTileIndexCallback(25,this.dead,this);

        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.resizeWorld();
        this.map.setCollisionBetween(1,10);
        this.map.setCollisionBetween(13,20);
        this.map.setCollisionBetween(23,37);
        this.map.setCollisionBetween(39,45);
        this.map.setCollisionBetween(49,60);

        if(playerCount == 1){
            this.sprite = this.game.add.sprite(75,600,'dude');
        }else if(playerCount == 2){
            this.sprite = this.game.add.sprite(75,600,'robo');
        }else if(playerCount == 3){
            this.sprite = this.game.add.sprite(75,600,'pepo');
        }
        this.starsound = game.add.sound('starsound');
        this.gameover = game.add.sound('gameover');

        this.sprite.animations.add('left',[0,1,2,3],10,true);
        this.sprite.animations.add('right',[5,6,7,8],10,true);

        this.game.physics.enable(this.sprite);

        this.sprite.body.bounce.set(0);
        this.sprite.body.tilePadding.set(64);
        this.game.camera.follow(this.sprite);
        this.sprite.body.gravity.y = 1200;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.TILE_BIAS = 50;
        this.playing = true;

        this.cursor = game.input.keyboard.createCursorKeys();                        //保存按键

        // 创建虚拟按键
        buttonUp = game.add.button(1070, 565, 'buttonjump', null, this, 0, 1, 0, 1);
        buttonUp.fixedToCamera = true;                                              // 相对相机固定
        buttonLeft = game.add.button(0, 565, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonLeft.fixedToCamera = true;
        buttonRight = game.add.button(360, 565, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonRight.fixedToCamera = true;

        if (!game.device.desktop){              //不是pc端
            buttonUp.events.onInputOver.add(function(){up=true;});
            buttonUp.events.onInputOut.add(function(){up=false;});
            buttonUp.events.onInputDown.add(function(){up=true;});
            buttonUp.events.onInputUp.add(function(){up=false;});

            buttonLeft.events.onInputOver.add(function(){left=true;});
            buttonLeft.events.onInputOut.add(function(){left=false;});
            buttonLeft.events.onInputDown.add(function(){left=true;});
            buttonLeft.events.onInputUp.add(function(){left=false;});

            buttonRight.events.onInputOver.add(function(){right=true;});
            buttonRight.events.onInputOut.add(function(){right=false;});
            buttonRight.events.onInputDown.add(function(){right=true;});
            buttonRight.events.onInputUp.add(function(){right=false;});
        }else{
            buttonUp.alpha = 0;
            buttonLeft.alpha = 0;
            buttonRight.alpha = 0;
        }

        this.sprite.scoreStyle = { font: "30px Arial", fill: "#ff0000"};
        this.sprite.scoreText = game.add.text(0, 5, "Score:"+score, this.sprite.scoreStyle);
        this.sprite.scoreText.fixedToCamera = true;

        this.sprite.timeStyle = { font: "28px 华文隶书", fill: "#cccccc" };
        this.sprite.timeText = game.add.text(450, 5, "Time:"+gameTime, this.sprite.timeStyle);
        this.sprite.timeText.fixedToCamera = true;
    },

    update: function () {
        nowTime = new Date();
        gameTime = (nowTime - startTime)/1000;
        this.sprite.timeText.text = "Time:"+gameTime;

        this.game.physics.arcade.collide(this.sprite,this.layer);
        if (this.sprite.x > 7460) {
            console.log("win");
            this.playing=false;
        }
        if (this.sprite.y > 760) {
            this.dead();
        }

        if(this.cursor.left.isDown || left){
            this.sprite.body.velocity.x = -300;
            this.sprite.animations.play('left');
        }else if(this.cursor.right.isDown || right){
            this.sprite.body.velocity.x = 300;
            this.sprite.animations.play('right');
        }else {
            this.sprite.body.velocity.x = 0;
            this.sprite.frame = 4;
        }
        if(this.sprite.body.blocked.down){
            if(this.cursor.up.isDown || up){
                this.sprite.body.velocity.y = -750;
            }
        }
    },
    hitCoin: function (sprite,tile) {
        if (tile.alpha != 0) {
            this.starsound.play();
            score += 10;
            this.sprite.scoreText.text = "Score:"+score;
            tile.alpha = 0;
            this.layer.dirty = true;
            return false;
        }
    },
    dead: function () {
        console.log("dead");
        this.gameover.play();
        this.playing=false;
        this.state.start('Over');
    }

};

BasicGame.Over = function (game) {};
BasicGame.Over.prototype = {
    preload:function () {
        this.load.spritesheet('replaybutton', 'assets/images/replaybutton.png', 80, 30, 2);
        this.load.spritesheet('sharebutton', 'assets/images/sharebutton.png', 80, 30, 2);
        this.load.spritesheet('startbutton', 'assets/images/startbutton.png', 100, 40, 2);
    },
    create:function () {
        var over_style = {font: "bold 32px Arial", fill: "#ffeb9e", boundsAlignH: "center", boundsAlignV: "middle"};
        var over_text = game.add.text(500, game.height/2-128, "Game Over!", over_style);
        var score_style = {font: "bold 28px Arial", fill: "#74ff26", boundsAlignH: "center", boundsAlignV: "middle"};
        var score_text = game.add.text(530, game.height/2-64, "Score:"+score, score_style);
        if(score > bestScore) bestScore = score;
        var bestscore_style = {font: "bold 28px Arial", fill: "#74ff26", boundsAlignH: "center", boundsAlignV: "middle"};
        var bestscore_text = game.add.text(530, game.height/2-32, "Best:"+"  "+bestScore, bestscore_style);
        var time_style = {font: "bold 26px 华文隶书", fill: "#ffe63f", boundsAlignH: "center", boundsAlignV: "middle"};
        var time_text = game.add.text(535, game.height/2+32, "用时:"+gameTime, time_style);
        game.add.button(500,game.height/2+64,'replaybutton',this.onReplayClick,this,0,0,1);
        game.add.button(600,game.height/2+64,'sharebutton',this.onShareClick,this,0,0,1);
    },
    update: function () {},
    onReplayClick:function () {
        document.getElementById('bdsharebutton').style.display = 'none';
        score = 0;
        game.state.start('MainMenu');
        startTime = new Date();
    },
    onShareClick:function () {
        if(!game.device.desktop){
            document.getElementById('share_image').style.display = 'block';
        }else {
            if(document.getElementById('bdsharebutton').style.display == 'none'){
                document.getElementById('bdsharebutton').style.position = 'absolute';
                document.getElementById('bdsharebutton').style.display = 'block';
                document.getElementById('bdsharebutton').style.top = event.clientY + "px";
                document.getElementById('bdsharebutton').style.left = event.clientX + "px";
            }else {
                document.getElementById('bdsharebutton').style.display = 'none';
            }
        }
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.add('Preloader', BasicGame.Preloader);
game.state.add('MainMenu', BasicGame.MainMenu);
game.state.add('Game', BasicGame.Game);
game.state.add('Over', BasicGame.Over);

game.state.start('Boot');