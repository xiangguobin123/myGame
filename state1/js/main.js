/**
 * Created by bingo on 2017/10/10.
 */
var game = new Phaser.Game(480,600,Phaser.CANVAS,'');
var progressText;//百分比文字
var loadImg;
var score = 0;               //记录分数
var bestScore = bestScore || 0;
var left=false;             //记录虚拟按键状态
var right=false;
var up=false;
var gameTime = 0;           //游戏时间
var startTime = 0;
var nowTime = 0;
var isSetFps = false;
var fpsCount = 0;
var playerCount = 0;

game.MyStates = {};     //场景对象

//boot state中一般对游戏进行设置
game.MyStates.boot = {
    preload:function () {
        game.load.image('preload', 'assets/preloader.gif');         //进度加载
        game.load.atlasXML('loadImg','assets/loading/sprites.png','assets/loading/sprites.xml');
        if(!game.device.desktop){                                   //不是pc端
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;    //屏幕适配
        }
    },
    create:function () {
        game.state.start('load');
    }
};

//load state中一般加载资源
game.MyStates.load = {
    init:function () {
        loadImg = game.add.sprite(game.world.centerX -10, game.world.centerY -40, 'loadImg');
        loadImg.anchor.set(0.5, 0.5);
        loadImg.animations.add('loadImg_away',[0, 1, 2, 3, 4]);
        loadImg.play('loadImg_away', 10, true);
        progressText = game.add.text(game.world.centerX -50, game.world.centerY + 70,'0%',{fill:'#fff',fontSize:'16px'});
        progressText.font = '微软雅黑';
    },
    preload:function () {
        /*var preloadSprite = game.add.sprite(game.width/2 - 220/2,game.height/2 - 19/2,'preload');*/
        /*game.load.setPreloadSprite(preloadSprite);              //获取加载进度*/
        game.load.image('background', 'assets/sky.png');
        game.load.image('sun', 'assets/sun.png');
        game.load.image('diamond', 'assets/diamond.png');
        game.load.image('simgledude','assets/simgledude.png');
        game.load.image('simplerobo','assets/simplerobo.png');
        game.load.image('simplepepo','assets/simplepepo.png');
        game.load.image('star', 'assets/star.png');
        game.load.spritesheet('dude','assets/dude.png',32,48);
        game.load.spritesheet('robo','assets/robo.png',32,48);
        game.load.spritesheet('pepo','assets/pepo.png',32,48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32); //敌人
        game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40, 2);
        game.load.spritesheet('replaybutton', 'assets/replaybutton.png', 80, 30, 2);
        game.load.spritesheet('sharebutton', 'assets/sharebutton.png', 80, 30, 2);
        game.load.image('stair1','assets/stair_stable_01.png');
        game.load.image('stair2','assets/stair_stable_02.png');
        game.load.image('stair3','assets/stair_stable_03.png');
        game.load.image('stair4','assets/stair_stable_04.png');
        game.load.image('stair5','assets/stair_stable_05.png');
        game.load.image('x', 'assets/x.png');
        game.load.image('xf', 'assets/xf.png');
        game.load.image('xx', 'assets/xx.png');
        game.load.image('xxf', 'assets/xxf.png');
        game.load.image('xxx', 'assets/xxx.png');
        game.load.image('xxxf', 'assets/xxxf.png');
        game.load.image('lose', 'assets/lose.png');
        game.load.spritesheet('stairMove','assets/stair_moveable.png',256,128);
        game.load.spritesheet('buttonhorizontal', 'assets/button-horizontal.png',96,64);
        game.load.spritesheet('buttonjump', 'assets/button-jump.png',64,64);
        game.load.audio('bg','assets/music/bg.mp3');
        game.load.audio('jump','assets/music/jump.mp3');
        game.load.audio('click','assets/music/click.mp3');
        game.load.audio('starsound','assets/music/star.wav');
        game.load.audio('gameover','assets/music/gameover.wav');
        game.load.onFileComplete.add(function(progress) {
            progressText.text ='游戏加中' + progress + '%...';
            if(progress == 100) {
                game.state.start('start');
            }
        });
    }
};
//start state游戏加载界面
game.MyStates.start = {
    create:function () {
        game.add.sprite(0,0,'background');
        game.add.button(180,200,'simgledude',this.onDudeClick,this,0,0,0,0);
        game.add.button(230,200,'simplerobo',this.onRoboClick,this,0,0,0,0);
        game.add.button(280,200,'simplepepo',this.onPepoClick,this,0,0,0,0);
        this.playerText = game.add.text(100, 280, "点击图标选择不同的角色", "font: '20px Arial', fill: '#ff0000'");
    },
    onDudeClick:function () {
        playerCount = 1;
        game.state.start('play');
        startTime = new Date();
    },
    onRoboClick:function () {
        playerCount = 2;
        game.state.start('play');
        startTime = new Date();
    },
    onPepoClick:function () {
        playerCount = 3;
        game.state.start('play');
        startTime = new Date();
    }
};
//游戏主界面
game.MyStates.play = {
    create:function () {
        if (!game.device.desktop){
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;    //屏幕适配
        }
        this.bgAutoNum = 50;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');      //背景滚动

        var sun = game.add.sprite(380,10,'sun');
        this.soundBg = game.add.sound('bg');
        this.jump = game.add.sound('jump');
        this.click = game.add.sound('click');
        this.starsound = game.add.sound('starsound');
        this.gameover = game.add.sound('gameover');

        game.physics.startSystem(Phaser.Physics.ARCADE);                            //打开物理引擎
        this.playerVelocity = -238;
        this.playerGravity = 365;
        if(playerCount == 1){
            this.player = game.add.sprite(224,200,'dude',4);
        }else if(playerCount == 2){
            this.player = game.add.sprite(224,200,'robo',4);
        }else if(playerCount == 3){
            this.player = game.add.sprite(224,200,'pepo',4);
        }
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = this.playerGravity;
        this.player.animations.add('left',[0,1,2,3],10,true);
        this.player.animations.add('right',[5,6,7,8],10,true);
        this.player.score = 0;
        this.player.bestScore = this.player.bestScore || 0;

        this.baddies = game.add.group();                                            //敌人组
        this.baddies.enableBody = true;

        this.diamonds = game.add.group();                                            //钻石组
        this.diamonds.enableBody = true;

        this.stars = game.add.group();                                            //星星组
        this.stars.enableBody = true;

        this.floor = game.add.sprite(200,350,'stair1');                             //设置第一层地面
        game.physics.arcade.enable(this.floor);
        this.floor.body.immovable = true;
        this.floor.body.velocity.y = 50;

        this.stairs = game.add.group();                                              //地面group
        this.stairs.enableBody = true;                                              //打开group的物理引擎
        var ledge1 = this.stairs.create(20,270,'stair1');
        ledge1.body.immovable = true;
        ledge1.body.checkCollision.left = false;
        ledge1.body.checkCollision.right = false;
        ledge1.body.checkCollision.down = false;
        ledge1.body.velocity.y = 50;
        ledge1.body.velocity.x = -20;
        ledge1.scoreFlag = true;
        var ledge2 = this.stairs.create(150,180,'stair4');
        ledge2.body.immovable = true;
        ledge2.body.checkCollision.left = false;
        ledge2.body.checkCollision.right = false;
        ledge2.body.checkCollision.down = false;
        ledge2.body.velocity.y = 50;
        ledge2.scoreFlag = true;
        var ledge3 = this.stairs.create(250,90,'stair2');
        ledge3.body.immovable = true;
        ledge3.body.checkCollision.left = false;
        ledge3.body.checkCollision.right = false;
        ledge3.body.checkCollision.down = false;
        ledge3.body.velocity.y = 50;
        ledge3.body.velocity.x = 20;
        ledge3.scoreFlag = true;
        var ledge4 = this.stairs.create(220,0,'stair3');
        ledge4.body.immovable = true;
        ledge4.body.checkCollision.left = false;
        ledge4.body.checkCollision.right = false;
        ledge4.body.checkCollision.down = false;
        ledge4.body.velocity.y = 50;
        ledge4.scoreFlag = true;
        var tween = game.add.tween(this.player).to({y:this.floor.y-40},1000,Phaser.Easing. Cubic.In,true);
        tween.onComplete.add(this.onStart,this);        //添加回调函数

        this.cursor = game.input.keyboard.createCursorKeys();                       //保存按键

        this.player.scoreStyle = { font: "20px Arial", fill: "#ff0000"};
        this.player.scoreText = game.add.text(0, 5, "Score:"+score, this.player.scoreStyle);

        this.player.timeStyle = { font: "20px 华文隶书", fill: "#774b16" };
        this.player.timeText = game.add.text(180, 5, "Time:"+gameTime, this.player.timeStyle);

        this.xxxAnim();
        this.lostCount = 0;

        // 创建虚拟按键
        buttonUp = game.add.button(410, 530, 'buttonjump', null, this, 0, 1, 0, 1);
        buttonLeft = game.add.button(0, 530, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonRight = game.add.button(120, 530, 'buttonhorizontal', null, this, 0, 1, 0, 1);

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
        this.FpsTestEnd = false;
    },
    update:function () {
        this.createTime = 100000 / this.bgAutoNum;
        switch(Math.floor(score/100)){
            case 0:this.bgAutoNum = 50;break;
            case 1:break;
            case 2:this.bgAutoNum = 60;break;
            case 3:break;
            case 4:break;
            case 5:this.bgAutoNum = 70;break;
            case 6:break;
            case 7:break;
            case 8:break;
            case 9:break;
            default:this.bgAutoNum = 80;break
        }
        this.bg.autoScroll(0,this.bgAutoNum);                                       //自动滚动，水平0，竖直this.bgAutoNum
        for(var i=0;i<this.stairs.length;i++){                                      //云向下运动的速度
            this.stairs.children[i].body.velocity.y = this.bgAutoNum;
        }
        nowTime = new Date();
        gameTime = (nowTime - startTime)/1000;
        this.player.timeText.text = "Time:"+gameTime;
        game.physics.arcade.collide(this.player,this.floor);                        //设置player和第一层云碰撞
        game.physics.arcade.collide(this.baddies,this.stairs);                      //怪物和云
        game.physics.arcade.collide(this.diamonds,this.stairs);                     //钻石和云
        for(var i=0;i<this.stairs.length;i++){                                      //云超出边界
            this.screenWrapStair(this.stairs.children[i]);
        }
        this.screenWrap(this.player);                                               //精灵超出边界

        if(this.cursor.left.isDown || left){
            this.player.body.velocity.x = -150;
            this.player.animations.play('left');
        }else if(this.cursor.right.isDown || right){
            this.player.body.velocity.x = 150;
            this.player.animations.play('right');
        }else{
            this.player.body.velocity.x = 0;
            this.player.frame = 4;
        }
        if(this.player.myPlayerOK){
            this.createStairs();
            game.physics.arcade.collide(this.stars, this.stairs, this.collisionStairStar, null, this);       //云和星星碰撞后
            game.physics.arcade.collide(this.player, this.stairs, this.collisionHandler, null, this);        //与云碰撞调用函数score+10
            game.physics.arcade.overlap(this.player, this.baddies, this.collisionBaddies, null, this);       //与怪物碰撞调用函数
            game.physics.arcade.overlap(this.player, this.diamonds, this.collisionDiamond, null, this);      //与钻石碰撞调用函数score+40
            game.physics.arcade.overlap(this.player, this.stars, this.collisionStar, null, this);            //与星星碰撞调用函数score+20
        }
        this.loseCount();
        if(this.player.body.touching.down){
            if(this.cursor.up.isDown || up){
                this.player.body.velocity.y = this.playerVelocity;
            }
        }
        if(!game.device.desktop){
            game.time.events.loop(Phaser.Timer.SECOND,this.updateCounter,this);
            this.AutoSetFps();
        }
    },
    updateCounter:function () {
        this.FpsTestEnd = true;
    },
    AutoSetFps:function () {
        if(isSetFps) return;
        if(this.FpsTestEnd&&this.FpsTestEnd == true){
            if(fpsCount>=30){
                game.time.desiredFps = 60;
            }else{
                game.time.desiredFps = fpsCount + 5;
            }
            isSetFps = true;
        }
        else{
            fpsCount++;
        }
    },
    collisionStairStar:function (star,stair) {
        star.body.velocity.x = stair.body.velocity.x;
    },
    collisionHandler:function (player,stair) {
        if(player.body.touching.down){
            if(stair.scoreFlag)
            {
                this.jump.play();
                score += 10;
                stair.scoreFlag = false;
                player.scoreText.text = "Score:"+score;
            }
        }
    },
    collisionBaddies:function (player,baddie) {
        this.gameover.play();
        baddie.kill();
        this.lostCount++;
    },
    collisionDiamond:function (player,diamond) {
        this.click.play();
        diamond.kill();
        score += 40;
    },
    collisionStar:function (player,star) {
        this.starsound.play();
        star.kill();
        score += 20;
    },
    onStart:function () {
        this.player.myPlayerOK = true;                 //player标记,准备就绪
        this.player.lastStairsTime = 0;                  //上一次云产生的时间
    },
    createStairs:function () {
        var now = new Date().getTime();
        if(now - this.player.lastStairsTime > this.createTime) {
            var stairIndex = game.rnd.integerInRange(1, 5);                  //取一个1-5随机数
            var key = 'stair' + stairIndex;
            var stairWidth = game.cache.getImage(key).width;                       //从缓存中随机获取不同种类的云的width
            var x = game.rnd.integerInRange(stairWidth / 2, game.width - stairWidth);
            var y = -20;
            var stair = this.stairs.getFirstExists(false, true, x, y, key);     //第二个参数表示如果不存在则创建一个
            stair.body.immovable = true;
            stair.body.checkCollision.left = false;                               //设置左边不碰撞
            stair.body.checkCollision.right = false;
            stair.body.checkCollision.down = false;
            /*stair.anchor.setTo(0.5, 0.5);                                        //设置云锚点在中心*/
            stair.checkWorldBounds = true;                                      //设置超出边界就kill，和下面的原理一样
            stair.outOfBoundsKill = true;
            game.physics.arcade.enable(stair);
            stair.scoreFlag = true;
            stair.playerTouch = false;
            if(stairIndex == 1){
                stair.body.velocity.x = -20;
            }else if(stairIndex == 5){
                stair.body.velocity.x = 20;
            }else{
                stair.body.velocity.x = 0;
            }
            this.player.lastStairsTime = now;

            var rndBaddie = game.rnd.integerInRange(0,5);                          //随机产生怪物，星星，钻石
            var diaIndex = game.rnd.integerInRange(40,408);                         //宽度随机值
            if(rndBaddie == 0){                                                      //当随机数是0时从左边产生怪物
                var baddie = this.baddies.create(20,20,'baddie'); //敌人位置
                game.physics.arcade.enable(baddie); //速度，加速度，角速度，角加速度
                baddie.body.gravity.y = 80;//跳跃重力值
                baddie.checkWorldBounds = true;                                      //设置超出边界就kill，和下面的原理一样
                baddie.outOfBoundsKill = true;
                baddie.animations.add('baddie');
                baddie.animations.play('baddie',8,true);
                game.add.tween(baddie).to({ x:game.width+10},5000,null,true,0,Number.MAX_VALUE,true);
            }
            if(rndBaddie == 5){                                                      //当随机数是5时从右边产生怪物
                var baddie = this.baddies.create(428,20,'baddie'); //敌人位置
                game.physics.arcade.enable(baddie); //速度，加速度，角速度，角加速度
                baddie.body.gravity.y = 80;//跳跃重力值
                baddie.checkWorldBounds = true;                                      //设置超出边界就kill，和下面的原理一样
                baddie.outOfBoundsKill = true;
                baddie.animations.add('baddie');
                baddie.animations.play('baddie',8,true);
                game.add.tween(baddie).to({ x:-40},5000,null,true,0,Number.MAX_VALUE,true);
            }
            if(rndBaddie == 1){
                var diamond = this.diamonds.create(diaIndex,-20,'diamond');        //当随机数是1时产生钻石
                game.physics.arcade.enable(diamond); //速度，加速度，角速度，角加速度
                diamond.body.gravity.y = 80;//跳跃重力值
                diamond.checkWorldBounds = true;                                      //设置超出边界就kill，和下面的原理一样
                diamond.outOfBoundsKill = true;
            }
            if(rndBaddie == 2 || rndBaddie == 3){
                var star = this.stars.create(diaIndex,-20,'star');                  //当随机数是2.3时产生星星
                game.physics.arcade.enable(star); //速度，加速度，角速度，角加速度
                star.body.gravity.y =100;
                star.body.bounce.y = 0.38;
                star.checkWorldBounds = true;                                      //设置超出边界就kill，和下面的原理一样
                star.outOfBoundsKill = true;
            }
        }
    },
    xxxAnim: function() {
        this.xxxGroup = game.add.group();
        this.x = game.add.image(0, 0, 'x');
        this.xx = game.add.image(22, 0, 'xx');
        this.xxx = game.add.image(49, 0, 'xxx');
        this.xxxGroup.addChild(this.x);
        this.xxxGroup.addChild(this.xx);
        this.xxxGroup.addChild(this.xxx);
        this.xxxGroup.x = game.width;
        this.xxxGroup.y = 5;
        game.add.tween(this.xxxGroup).to({x: game.width-86}, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    loseCount: function() {
        if(this.lostCount == 1) {
            this.lostAnim(this.x, 'xf');
        } else if(this.lostCount == 2) {
            this.lostAnim(this.xx, 'xxf');
        } else if(this.lostCount == 3) {
            this.lostAnim(this.xxx, 'xxxf');
            game.state.start('over');
        }
    },
    lostAnim: function(removeObj, addKey) {
        this.xxxGroup.removeChild(removeObj);
        removeObj.kill();
        this[addKey] = game.add.sprite(0, 0, addKey);
        this[addKey].reset(removeObj.x + this[addKey].width/2, removeObj.y + this[addKey].height/2);
        this.xxxGroup.addChild(this[addKey]);
        this[addKey].anchor.setTo(0.5, 0.5);
        this[addKey].scale.setTo(0, 0);
        game.add.tween(this[addKey].scale).to({x: 1.0, y: 1.0}, 300, Phaser.Easing.Sinusoidal.InOut, true);
    },
    screenWrapStair:function (sprite) {
        if(sprite.x < 0){
            sprite.body.velocity .x = 20;
        }else if(sprite.x > game.width - sprite.width){
            sprite.body.velocity.x = -20;
        }
    },
    screenWrap:function(sprite) {                                               //上下左右超出屏幕判断的事件
        if (sprite.x < 0) {
            sprite.x = game.width;
        }
        else if (sprite.x > game.width) {
           sprite.x = 0;
        }
        if (sprite.y < 0) {
            sprite.body.velocity.y = 100;
        }
        else if (sprite.y > game.height) {
            this.gameover.play();
            game.state.start('over');
        }
    }
};
//游戏结束界面
game.MyStates.over = {
    create:function () {
        game.add.sprite(0,0,'background');
        var over_style = {font: "bold 32px Arial", fill: "#ffeb9e", boundsAlignH: "center", boundsAlignV: "middle"};
        /*var over_style = { font: "32px Arial", fill: "#ffeb9e"};*/
        var over_text = game.add.text(160, game.height/2-128, "Game Over!", over_style);
        var score_style = {font: "bold 28px Arial", fill: "#74ff26", boundsAlignH: "center", boundsAlignV: "middle"};
        var score_text = game.add.text(180, game.height/2-64, "Score:"+score, score_style);
        if(score > bestScore) bestScore = score;
        var bestscore_style = {font: "bold 28px Arial", fill: "#74ff26", boundsAlignH: "center", boundsAlignV: "middle"};
        var bestscore_text = game.add.text(180, game.height/2-32, "Best:"+"  "+bestScore, bestscore_style);
        var time_style = {font: "bold 26px 华文隶书", fill: "#ffe63f", boundsAlignH: "center", boundsAlignV: "middle"};
        var time_text = game.add.text(175, game.height/2+32, "用时:"+gameTime, time_style);
        game.add.button(150,game.height/2+64,'replaybutton',this.onReplayClick,this,0,0,1);
        game.add.button(250,game.height/2+64,'sharebutton',this.onShareClick,this,0,0,1);
    },
    onReplayClick:function () {
        document.getElementById('bdsharebutton').style.display = 'none';
        score = 0;
        game.state.start('start');
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

game.state.add('boot',game.MyStates.boot);      ///添加场景
game.state.add('load',game.MyStates.load);
game.state.add('start',game.MyStates.start);
game.state.add('play',game.MyStates.play);
game.state.add('over',game.MyStates.over);
game.state.start('boot');                       //进入场景