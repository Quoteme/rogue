canvas_x = window.innerWidth;
canvas_y = window.innerHeight;

var game = new Phaser.Game(canvas_x, canvas_y, Phaser.AUTO, '', { preload: preload, create: create, update: update }, false, false);

var background;
var filter;

function preload() {

	game.load.image('light', 'assets/light.png');
	game.load.image('block_shadow', 'assets/block_shadow.png');
	game.load.image('entety_shadow', 'assets/player_shadow.png');
	game.load.spritesheet('bullet', 'assets/bullet.png', 10, 9);
	game.load.spritesheet('smilys', 'assets/stats_icons.png', 16, 16);//10 tiles
	if (getUrlVars()['p1c'] == 'green' || getUrlVars()['p2c'] == 'green')
		game.load.spritesheet('dude_green', 'assets/main_green.png', 11, 14);//23 tiles
	if (getUrlVars()['p1c'] == 'red' || getUrlVars()['p2c'] == 'red')
		game.load.spritesheet('dude_red', 'assets/main_red.png', 11, 14);//23 tiles
	if (getUrlVars()['p1c'] == 'blue' || getUrlVars()['p2c'] == 'blue')
		game.load.spritesheet('dude_blue', 'assets/main_blue.png', 11, 14);//23 tiles
	if (getUrlVars()['p1c'] == 'yellow' || getUrlVars()['p2c'] == 'yellow')
		game.load.spritesheet('dude_yellow', 'assets/main_yellow.png', 11, 14);//23 tiles
	if (getUrlVars()['p1c'] == 'hobo' || getUrlVars()['p2c'] == 'hobo')
		game.load.spritesheet('dude_hobo', 'assets/main_hobo.png', 11, 14);//23 tiles

	game.load.spritesheet('sky', 'assets/green_bot_sprite.png', 13, 13);

	if (getUrlVars()["map"] == '' || getUrlVars()["map"] == undefined || getUrlVars()["map"] == 'desert'){
		console.log('loading desert graphic')
		game.stage.backgroundColor = '#dad45e';
		// load map specific images
			game.load.image('ground', 'assets/ground_desert.png');
	}else if (getUrlVars()["map"] == 'lab'){
		console.log('loading laboratory graphic')
		game.stage.backgroundColor = '#999';
		// load map specific images
			game.load.image('ground', 'assets/ground_lab.png');
	}else if (getUrlVars()["map"] == 'tron'){
		console.log('loading tron graphic')
		game.stage.backgroundColor = '#161616';
		// load map specific images
		game.load.image('ground', 'assets/ground_tron.png');
	}else if (getUrlVars()['map'] == 'dream'){
		console.log('loading tron graphic')
		game.stage.backgroundColor = '#295a74';
		// load map specific images
		game.load.image('ground', 'assets/ground_dream.png');
	}

	if(getUrlVars()["filter"] == 'acid'){
		console.log('gooooing acid, maaaan...');
		game.load.script('filter', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Marble.js');

	}
}

function create() {
	if (getUrlVars()["scale"] == undefined || getUrlVars()["scale"] == '')
		scaling_level = 250;
	else
		scaling_level = getUrlVars()["scale"];

	if (getUrlVars()["ground"] == undefined || getUrlVars()["ground"] == '')
		ground_rand = 0.4;
	else
		ground_rand = getUrlVars()["ground"];

	if (getUrlVars()["blocks"] == undefined || getUrlVars()["blocks"] == '')
		blocks_rand = 0.1;
	else
		blocks_rand = getUrlVars()["blocks"];

	scale 	= (game.world.height / scaling_level) / 2 + (game.world.width / scaling_level) / 2 ;
	scale_x = scale;
	scale_y = scale;
	tile_size = 14 * scale_x;
	how_many_players = 0;
	spawn_radius_x = 3 * getUrlVars()["players"];
	spawn_radius_y = 3;
	time_to_particle = 0;
	time_to_shoot	= new Array;
	for (var i = 0; i < getUrlVars()["players"]; i++)
		time_to_shoot[i] = 50;
	time_to_shoot_o = time_to_shoot[0];
	if (getUrlVars()['health'] != undefined)
		standart_player_life = getUrlVars()['health'];
	else
		standart_player_life = 4;

	player 				= new Array();
	player_shadow 		= new Array();
	player_life 		= new Array();
	player_allow_shoot	= new Array();
	map 				= new Array();

	health = new Array(2); // health array
	for (var i = 0; i < health.length; i++) {
		health[i] = [];
		console.log('Health for player ' + i + ' created.');
	}

	game.physics.startSystem(Phaser.Physics.ARCADE);

	if (getUrlVars()["map_size_x"] != '' && getUrlVars()["map_size_x"] != undefined)
	{
		if (getUrlVars()["map_size_y"] != '' && getUrlVars()["map_size_y"] != undefined)
			create_level(getUrlVars()["map_size_x"], getUrlVars()["map_size_y"], 1)
	}else
		create_level(40, 30, 1)

	function create_level(size_x, size_y, number){
		game.world.setBounds(0, tile_size, size_x * tile_size - tile_size, size_y * tile_size + 20); // + 20 for the specs, so they dont hide the bottom tiles
		// 0 = ground
		// 1 = next row
		// 2 = nothing
		// 3 = player
		// 4 = shadow

		// vars to build map
			row = 0;

		// Player position
			player_x = 2;
			player_y = 3;

		if (getUrlVars()["map"] != 'lab' && getUrlVars()["map"] != 'tron'){
			// ---------------------------
			//     Default Map Gen
			// ---------------------------
			for (var i = 0; i < size_x * size_y; i++) {
				// create borders
					if (i < size_x && row == 0){
						map[i] = 0;
					}else if (map[i-1] == 1){
						map[i] = 0;
					}else if (i == size_x * (row + 1) && row != 0){
						map[i - 1] = 0;
						map[i - 2] = 0;
					}
					if (row == size_y - 1){
						map[i] = 0;
						map[i - size_x] = 0;
					}
					if (i == 0) {
						map[i] = 1;
					}
					if (i == size_x * (row + 1)){
						map[i] = 1;
						row += 1;
					}
				// end of generating borders

				// random platforms
					if (map[i-1] == 0 || map[i-size_x] == 0 || map[i-size_x + 1] || map[i-size_x - 1]){
						if (Math.random() < ground_rand )
							if (map[i] != 1)
								map[i] = 0;
					}else{
						if (Math.random() < blocks_rand )
							if (map[i] != 1)
								map[i] = 0;
					}

				// better create the player
					if (i == player_x + size_x * player_y)
						create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p1c'], standart_player_life);
					if (getUrlVars()["players"] >= 2)
						if (i == player_x + spawn_radius_x / 2 + size_x * player_y)
							create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p2c'], standart_player_life);
				}
			// end of map generating

			// style map
				for (var i = 0; i < map.length; i++) {
					if(map[i-size_x] == 0 && map[i] != 0){
						map[i] = 4;
					}
				}
		}else if (getUrlVars()["map"] == 'lab'){
			// ---------------------------
			//     Generate The LAB map
			// ---------------------------
			for (var i = 0; i < size_x * size_y; i++) {
				// create borders
					if (i < size_x == 0){
						map[i] = 0;
					}

					if (i == size_x * (row + 1)){
						map[i] = 1;
						row += 1;
					}
				// end of generating borders


				// better create the player
				if (i == player_x + size_x * player_y)
					create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p1c'], standart_player_life);
					if (getUrlVars()["players"] >= 2)
						if (i == player_x + spawn_radius_x / 2 + size_x * player_y)
							create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p2c'], standart_player_life);


			}

			for (var i = 0; i < size_x / 2; i++)
				map[size_x * 2 + 3 + i] = 2;
			for (var i = 0; i < size_y / 2; i++)
				map[size_x * 2 + 3 + size_x * i] = 2;

			for (var i = 0; i < map.length; i++) {
				if (map[i-size_x] == 2 && map[i-1] != 2 || map[i-1] == 2 && map[i-size_x] != 2){
					if (Math.random() < 1-ground_rand)
						if (map[i] != 1)
						map[i] = 2;
					}
			}

			for (var i = map.length; i > 0; i--) {
				if (map[i+1] == 2 && map[i+size_x] != 2 && map[i-1] != 1)
					if (Math.random() < 1-ground_rand )
						if (map[i] != 1)
							map[i] = 2;
			}

			// style map
				for (var i = 0; i < map.length; i++) {
					if(map[i-size_x] == 0 && map[i] != 0){
						map[i] = 4;
					}
				}
		}else if (getUrlVars()["map"] == 'tron'){
			// ---------------------------
			//     Generate The Tron map
			// ---------------------------
			for (var i = 0; i < size_x * size_y; i++) {
				// create borders
					if (i < size_x && row == 0){
						map[i] = 0;
					}else if (map[i-1] == 1){
						map[i] = 0;
					}else if (i == size_x * (row + 1) && row != 0){
						map[i - 1] = 0;
						map[i - 2] = 0;
					}
					if (row == size_y - 1){
						map[i] = 0;
						map[i - size_x] = 0;
					}
					if (i == 0) {
						map[i] = 1;
					}
					if (i == size_x * (row + 1)){
						map[i] = 1;
						row += 1;
					}

					if (Math.random() < blocks_rand / 3)
						for (var j = 0; j < 3; j++) {
							for (var k = 0; k < 3; k++) {
								if (map[i - size_x - 1 + j + k * size_x] != 1)
									map[i - size_x - 1 + j + k * size_x] = 0;
							}
						}

				// better create the player
				if (i == player_x + size_x * player_y)
					create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p1c'], standart_player_life);
					if (getUrlVars()["players"] >= 2)
						if (i == player_x + spawn_radius_x / 2 + size_x * player_y)
							create_player(i * tile_size - row * size_x * tile_size, row * tile_size, how_many_players, getUrlVars()['p2c'], standart_player_life);

				// end of generating borders
			}
			// style map
				for (var i = 0; i < map.length; i++) {
					if(map[i-size_x] == 0 && map[i] != 0){
						map[i] = 4;
					}
				}
		}else
			console.log('error : 002 | No map specified');

		// ---------------------------
		//		Spawn Point
		// ---------------------------
			for (var i = 0; i < spawn_radius_x; i++) {
				for (var j = 0; j < spawn_radius_y; j++) {
					if (map[player_x + size_x * player_y - size_x + i + size_x * j - size_x] == 0)
						map[player_x + size_x * player_y - size_x + i + size_x * j] = 4;
					else
						map[player_x + size_x * player_y - size_x + i + size_x * j] = 2;
				}
			}

		platforms 			 	= game.add.group();
		platforms.enableBody 	= true;
		decorations 		 	= game.add.group();
		decorations.enableBody  = true;

		// vars for building map
			next_row = 0;
			go_right = 0;

		// build the map
			for (var i = 0; i < map.length; i++) {
				if (map[i] == 0){		// create the walls
					border = platforms.create(go_right * tile_size, next_row * tile_size, 'ground');
					border.body.immovable = true;
					border.scale.setTo(scale_x, scale_y);
					if (map[i-size_x] != 0){
						light = decorations.create(go_right * tile_size, next_row * tile_size, 'light');
						light.body.immovable = true;
						light.scale.setTo(scale_x, scale_y);
					}
				}
				if (map[i] == 4){		// create the shadows
					shadow = decorations.create(go_right * tile_size, next_row * tile_size - tile_size / 2, 'block_shadow');
					shadow.body.immovable = true;
					shadow.scale.setTo(scale_x, scale_y);
				}

				go_right += 1;

				if (map[i] == 1){	// create a new row
					next_row += 1;
					go_right = 0;
				}

			}

	}

	function create_player(x, y, number, color, life){
		// vars for health & weaponry
			player_life[number] = life;
		// create a player shadow
			player_shadow[number] = game.add.sprite(x, y,'entety_shadow')
			player_shadow[number].anchor.setTo(0.5,-0.7);
			player_shadow[number].scale.setTo(scale_x,scale_y);
			game.physics.arcade.enable(player_shadow[number]);

			console.log('Added player ' + number + ', colored ' + color);

		if (color == 'green')
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_green');
		else if (color == 'red')
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_red');
		else if (color == 'blue')
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_blue');
		else if	(color == 'yellow')
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_yellow');
		else if	(color == 'hobo')
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_hobo');
		else
			player[number] = game.add.sprite(x + tile_size / 2, y + tile_size / 2, 'dude_green');

		player[number].scale.setTo(scale_x,scale_y);

		game.physics.arcade.enable(player[number]);
		player[number].body.collideWorldBounds = false;
		player[number].animations.add('stand_right', [0, 1, 2], 6, true);
		player[number].animations.add('stand_left', [4, 5, 6], 6, true);
		player[number].animations.add('blink_right', [3], 6, true);
		player[number].animations.add('blink_left', [7], 6, true);
		player[number].animations.add('right', [8, 9, 10], 8, true);
		player[number].animations.add('left', [11, 12, 13], 8, true);
		player[number].animations.play('stand_right');
		player[number].anchor.setTo(0.5,0.5);

		how_many_players += 1;
		game.camera.follow(player[number]);
		if (how_many_players > 1)
			game.camera.follow(null);
		player_speed = 75 * scale_x;

	}

		// particles | emitter of player
		emitter = new Array();
		bullet_emitter = new Array();

		for (var i = 0; i < how_many_players; i++) {
			if (getUrlVars()['particles'] == 'true'){
				console.log('Allow particles, dont kill your session with that');
				emitter[i] = game.add.emitter(0, 0, 5);
				emitter[i].makeParticles('ground');
				emitter[i].setAlpha(0.5, 0.5, 2000);
				emitter[i].gravity = 150;
				emitter[i].setRotation(150, 0);
			}
			bullet_emitter[i] = game.add.emitter(0, 10, 100);
			bullet_emitter[i].setXSpeed(0, 0);
			bullet_emitter[i].setYSpeed(0, 0);
			bullet_emitter[i].minRotation = 0;
			bullet_emitter[i].maxRotation = 0;
			bullet_emitter[i].gravity = 0;
		}
	// set the keyboard as an input
		cursors = game.input.keyboard.createCursorKeys();
		cursors.W = game.input.keyboard.addKey(Phaser.Keyboard.W);
		cursors.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
		cursors.S = game.input.keyboard.addKey(Phaser.Keyboard.S);
		cursors.D = game.input.keyboard.addKey(Phaser.Keyboard.D);
		if (getUrlVars()["p1sk"] == 'Y')
			cursors.Shoot = game.input.keyboard.addKey(Phaser.Keyboard.Y);
		else if (getUrlVars()["p1sk"] == 'Z')
			cursors.Shoot = game.input.keyboard.addKey(Phaser.Keyboard.Z);
		else if (getUrlVars()["p1sk"] == 'C')
			cursors.Shoot = game.input.keyboard.addKey(Phaser.Keyboard.C);
		else if (getUrlVars()["p1sk"] == 'X')
			cursors.Shoot = game.input.keyboard.addKey(Phaser.Keyboard.X);
		else if (getUrlVars()["p1sk"] == 'space')
			cursors.Shoot = game.input.keyboard.addKey(32);

		if (getUrlVars()["p2sk"] == 'l')
			cursors.Shoot2 = game.input.keyboard.addKey(Phaser.Keyboard.L);
		else if (getUrlVars()["p2sk"] == 'r_ctrl')
			cursors.Shoot2 = game.input.keyboard.addKey(17)
		else if (getUrlVars()["p2sk"] == 'space')
			cursors.Shoot2 = game.input.keyboard.addKey(32);

	// player animation handlers
		player_stand_left = new Array();

	if (getUrlVars()["filter"] == 'acid') {
		background 			= game.add.sprite(0, 0);
		background.width 	= game.world.width;
		background.height 	= game.world.height;

		filter = game.add.filter('Marble', 800, 600);
		filter.alpha = 0.5;

		filter.speed = 5;
		filter.intensity = 0.30;

		background.filters = [filter];
	}

	call_specs();

	function call_specs(){
		for (var i = how_many_players - 1; i >= 0; i--)
			create_specs(i, 0.92, 5, window.innerWidth * 0.05);
	}

	function create_specs(number, height, line_size, slash){
		var graphics	= game.add.graphics(0, 0);
		var icon 		= game.add.group();
		var face 		= game.add.group();

		// set a fill and line style
		graphics.beginFill(0x161616);
		graphics.lineStyle(line_size, 0x262626, 1);

		// draw a shape
		graphics.moveTo(window.innerWidth / how_many_players * number - slash / 2 * number,window.innerHeight * height - line_size / 2);
		graphics.lineTo(window.innerWidth / how_many_players * (number + 1)- slash / 2, window.innerHeight * height - line_size / 2);
		graphics.lineTo(window.innerWidth / how_many_players * (number + 1) + slash / 2, window.innerHeight - line_size / 2);
		graphics.lineTo(window.innerWidth / how_many_players * number, window.innerHeight - line_size / 2);
		graphics.endFill();

		for (var i = 0; i <= player_life[number]; i++) {
			health[number][i] = game.add.sprite(100 + 64 * i + window.innerWidth / 2 * number, window.innerHeight - (window.innerHeight * (1 - height)) + line_size * 1.5, 'smilys');
			health[number][i].frame = 0;
			health[number][i].scale.setTo(2,2);
			health[number][i].fixedToCamera = true;
		}

		health[number][standart_player_life].alpha = 0.15;

		//add player face
		face_number = number + 1;
		console.log(face_number);

		face[number] = game.add.sprite(health[number][0].x - 80, health[number][0].y - 10 , 'dude_' + getUrlVars()['p' + face_number + 'c']);
		face[number].frame = 0;
		face[number].scale.setTo(5,5);
		face[number].fixedToCamera = true;
		//fix to camera
		graphics.fixedToCamera = true;
	}

	for (var i = 0; i < how_many_players; i++) {
		give_weapon(i);
	}
}

function update() {
	if (getUrlVars()["filter"] == 'acid'){
		filter.update();
		for (var i = 0; i < how_many_players; i++) {
			player[i].angle += 1;
		}
	}

	// collision detecter
		for (var i = 0; i < how_many_players; i++) {
			game.physics.arcade.collide(player[i], platforms)
			game.physics.arcade.collide(bullet_emitter[i], platforms)

			game.physics.arcade.collide(bullet_emitter, player[i], function(player, emitter){
			if (player_life[i] <= 4)
				for (var j = 0; j < health[i].length; j++) {
					health[i][j].frame = health[i][j].frame + 1;
			}
				if (player_life[i] - 1 > 0){
					player_life[i] -= 1;
					console.log('Player ' + i + ' lost one life.\n He has ' + player_life[i] + ' life left.')
					game.add.tween(health[i][player_life[i]]).to( { alpha: 0.15}, 300, Phaser.Easing.Linear.None, true);
				}else{
					console.log('Game Over');
					for (var j = 0; j < health[i].length; j++) {
						health[i][j].frame = 4;
					}
					game.add.tween(player).to( { alpha: 0.15}, 300, Phaser.Easing.Linear.None, true);
					player_allow_shoot[i] = false;
				}emitter.x = -10000; // send somewhere far away

			}, null, this);
		}


	// Controle Players
		controle_player(0, cursors.W.isDown, cursors.A.isDown, cursors.S.isDown, cursors.D.isDown, cursors.Shoot.isDown);
		if (how_many_players == 2){
			controle_player(1, cursors.up.isDown, cursors.left.isDown, cursors.down.isDown, cursors.right.isDown, cursors.Shoot2.isDown);
		}

	if (how_many_players >= 2){
		// calculate camera location
			if (how_many_players >= 2){
				median_x = 0;
				median_y = 0;
				for (var i = 0; i < how_many_players; i++) {
					median_x += player[i].body.x;
					median_y += player[i].body.y;
				}
				median_x = median_x / player.length;
				median_y = median_y / player.length;
			}
		// make the camera follow the median of the player locations
			game.camera.focusOnXY(median_x, median_y);
	}

	// player controling stuff using keyboard
		function controle_player(number, up, left, down, right, shoot ){
			if ( down ){											// down
				player[number].body.velocity.y = player_speed;
				if (player_stand_left[number])
					player[number].animations.play('left');
				else
					player[number].animations.play('right');
			}
			else if ( up ){ 										// up
				player[number].body.velocity.y = -player_speed;
				if (player_stand_left[number])
					player[number].animations.play('left');
				else
					player[number].animations.play('right');
			}
			else {
				player[number].body.velocity.y = 0;
			}

			if ( left ) 											// left
			{
				player[number].body.velocity.x = -player_speed;
				player[number].animations.play('left');
				player_stand_left[number] = true;
			} else if ( right )									 	// right
			{
				player[number].body.velocity.x = player_speed;
				player[number].animations.play('right');
				player_stand_left[number] = false;
			} else {
				player[number].body.velocity.x = 0;
			}
																	//shoot
			if (shoot && player_allow_shoot[number]){
				shoot_bullet(number, 500, parseFloat(getUrlVars()['weapon']));
			}


			if (up == false &&
				left == false &&
				down == false &&
				right == false){
				if (player_stand_left[number])
					player[number].animations.play('stand_left');
				else
					player[number].animations.play('stand_right');


						player_shadow[number].y = player[number].y;
						player_shadow[number].x = player[number].x;
				}
			else{
				player_shadow[number].y = player[number].y;
				player_shadow[number].x = player[number].x;
				if (getUrlVars()['particles'] == 'true'){
					particleBurst(number);
				}
			}

			time_to_shoot[number] -= 1;
			if (time_to_shoot[number] <= 0)
				health[number][standart_player_life].frame = 10;
			else{
				health[number][standart_player_life].frame = 9;
			}
		}
}

function particleBurst(number){
	if (time_to_particle <= 0 && Math.random() < 0.5){
		emitter[number].x = player[number].x;
		emitter[number].y = player[number].y + tile_size / 2.5;
		emitter[number].start(true, 200, null, Math.random()*2);
		time_to_particle = Math.random() * 80;
	}else{
		time_to_particle -= 1;
	}
}

function shoot_bullet(number, speed, weapon){
	//0 = double | 1 = fist | 2 = shell
	if (time_to_shoot[number] <= 0){
		bullet_emitter[number].makeParticles('bullet', weapon, 250, 1, true);
		bullet_emitter[number].x = player[number].x;
		bullet_emitter[number].y = player[number].y;
		if (player_stand_left[number]){
			bullet_emitter[number].setXSpeed(-speed, -speed);
			bullet_emitter[number].setScale(scale_x, -scale_x, scale_y, -scale_y, 100, Phaser.Easing.Quintic.Out);
		}
		else{
			bullet_emitter[number].setXSpeed(speed, speed);
			bullet_emitter[number].setScale(-scale_x, scale_x, scale_y, -scale_y, 100, Phaser.Easing.Quintic.Out);
		}
		bullet_emitter[number].start(true, 1500, null, 1);

	time_to_shoot[number] = time_to_shoot_o;
	}
}

function give_weapon(number){
	console.log('Player ' + number + ' now has a weapon.')
	game.add.tween(health[number][standart_player_life]).to( { alpha: 1}, 300, Phaser.Easing.Linear.None, true);
	player_allow_shoot[number] = true;
}

// general purpose functions
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value
	});
	return vars;

	//currently used url-vars
	/*
	?scale 		> scale of the screen			| default	= 150
	?players 	> how many players are there	| default	= 1
	?blocks		> how many blocks are there		| default	= 0.6
	?filter		> mind using a filter, sir?		| default 	= none
	?map_size_x > x size of map					| default	= 40
	?map_size_y > y size of map					| default	= 30
	?map		> map type						| default	= desert
	*/
}
