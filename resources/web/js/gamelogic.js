var step = 0; // Current step
var steps = 500; // Total number of steps to perform the effect
var accel = 0.05; // Acceleration
var vX = 4; // X velocity

var moveBy = 5; // players velocity

var playGround;
var playGroundWidth;
var playGroundHeight;
var playGroundTop;
var playGroundLeft;

const topPlayer = {name:"saucer", displayName: "Space Boy" , torpedoDirection:1, torpedoIndex: 0, torpedoPrefix: "top", score: 0};
const bottomPlayer = {name: "rwithgun", displayName: "Bandit", torpedoDirection:-1, torpedoIndex:0, torpedoPrefix: "bottom", score: 0};
const observer = {name: "observer", displayName: "Observer"};
const players = [topPlayer, bottomPlayer, observer];

const frog0 = {name:"frog0" , startTop:100, jumpSpeed: 150, jumpFreq: 700};
const frog1 = {name:"frog1" , startTop:200, jumpSpeed: 77, jumpFreq: 800};
const frog2 = {name:"frog2" , startTop:200, jumpSpeed: 42, jumpFreq: 444};
const frog3 = {name:"frog3" , startTop:200, jumpSpeed: 100, jumpFreq: 700};
const frogs = [frog0, frog1, frog2, frog3];

var player;
var torpedoPrefix = "torpedo"
var torpedoSteps = {};
var playGame = false;
var matchTime = 45;

function setPlayerIndex(index){
	player = players[index];
	player.score= 0 ;
	$("#infoLine1").html("You are: " + player.displayName);
	if(index != 2){
		setTimeout("ws.close(); alert('Match has ended!'); window.location.reload();", 45000);
	}
}
function udpatePlayerScore(index, score){
	var actualPlayer = players[index];
	if(actualPlayer == player){
		$("#infoLine2").html("Your score: " + score);
	}
}

function moveObj(name, Xpix, Ypix, makeContinous = true) {
	obj = document.getElementById(name);

	var px = parseInt(obj.style.left) + Xpix;
	var py = parseInt(obj.style.top) + Ypix;
	
	if (name.startsWith("frog") || px > playGroundRect.leftTopX
			&& (px + obj.width) < playGroundRect.rightBottomX) {
		obj.style.left = px;
	}
	if(makeContinous){
		setTimeout('makeMovementContinous("'+name+'", '+Xpix+','+Ypix+')', 0);	
	}
}
function resetObject(name, Xpix) {
	obj = document.getElementById(name);
	obj.style.left = Xpix;
}
var movementArray = new Array();
var movementArrayMaxLength = 20;

function initGameLogic(){
	playGround = document.getElementById("playground");
	playGroundWidth = playGround.clientWidth;
	playGroundHeight = playGround.clientHeight;
	playGroundTop = playGround.offsetTop;
	playGroundLeft = playGround.offsetLeft;
	setTimeout("autoMove()", 0);	
}
function startGame(){
	sendCommand('resetObject("'+topPlayer.name+'", '+(playGroundLeft + 10)+')');
	sendCommand('resetObject("'+bottomPlayer.name+'", '+(playGroundLeft + 10)+')');
	setTimeout("initFrogs()",100)

}
function initFrogs(){
	for(i = 0 ; i < frogs.length; i++)
	{
		sendCommand('resetObject('+frogs[i].name+', 1010 )');
	}
	for(i = 0 ; i < frogs.length; i++)
	{
		var frog = document.getElementById(frogs[i].name);		
		moveFrog(frogs[i].name,(-frogs[i].jumpSpeed), frogs[i].jumpFreq );
	}
}
function showHideObject(id, display = "block"){
	document.getElementById(id).style.display=display;
}
function moveFrog(frogId, speed, freq){
	if(playGame){
		var frog = document.getElementById(frogId);	
		if(parseInt(frog.style.left) < playGroundLeft){
			sendCommand('resetObject("'+frogId+'", '+(playGroundLeft + playGroundWidth)+')');
			sendCommand('showHideObject("'+frogId+'","block")');
		}
		else{
			sendCommand('resetObject("'+frogId+'", '+(parseInt(frog.style.left) + speed)+')');
		}
		setTimeout('moveFrog("'+frogId+'",'+speed+','+ freq+')', freq);	
	}

}
function autoMove(){
	if(movementArray.length != 0){
		var command = movementArray.shift();
		setTimeout(command.command, command.waitTime);
	}
	setTimeout("autoMove()", 10);
}

function makeMovementContinous(name, Xpix, Ypix){
	var waitTime = 0;
	for(i=0; i < 10; i++){
		waitTime +=50;
		if(movementArray.length < movementArrayMaxLength)
		{
			movementArray.push({command: 'moveObj("'+name+'", '+Xpix+','+Ypix+', false)', waitTime: waitTime});
		}
	}
}

function fireTorpedo(playerIndex) {
	
	var actualPlayer = players[playerIndex];
	actualPlayer.torpedoIndex = (actualPlayer.torpedoIndex + 1) % 10;
	
	var torpedoId = actualPlayer.torpedoPrefix + actualPlayer.torpedoIndex;
	var obj = document.getElementById(actualPlayer.name);
	var px = parseInt(obj.style.left);
	var py = parseInt(obj.style.top);

	var t = document.getElementById(torpedoId);
	t.style.left = px + document.getElementById(actualPlayer.name).width/2;
	t.style.top = py + 20 * actualPlayer.torpedoDirection;

	step = 0;
	accel = 0.05;
	vX = 1;

	window.setTimeout('moveTorpedo("'+ torpedoId +'",'+playerIndex+');', 0);
}

function moveTorpedo(torpedoId, playerIndex) {
	var actualPlayer = players[playerIndex];
	var actualStep = torpedoSteps[torpedoId];
	if(actualStep == undefined)
	{
		actualStep = 1;
	}
	torpedoSteps[torpedoId] = ++actualStep;
	if (actualStep >= steps){
		torpedoSteps[torpedoId] = 0;
		return; // no more torpedo movement
	}

	// Move torpedo to the right by the given velocity and acceleration
	var torpedo = document.getElementById(torpedoId);
	var py = parseInt(torpedo.style.top);
	vX += parseInt(accel); // Increase velocity by the amount of acceleration
	torpedo.style.top = py + vX * actualPlayer.torpedoDirection;
	var torpedoLeft = parseInt(torpedo.style.left);
	var torpedoTop = parseInt(torpedo.style.top);

	for(i = 0 ; i < frogs.length; i++)
	{
		var frog = document.getElementById(frogs[i].name );
		if(frog != undefined && frog.style.display == "block"){
			var frogLeft = parseInt(frog.style.left);
			var frogTop = parseInt(frog.style.top);
			var frogRight = frogLeft + frog.width;
			var frogBottom = frogTop + frog.height;
			
			if(torpedoLeft > frogLeft && torpedoLeft < frogRight &&
			   torpedoTop < frogBottom && torpedoTop > 	frogTop)
			{
				if(torpedoId.startsWith(actualPlayer.torpedoPrefix)){
					torpedoSteps[torpedoId] = 0
					torpedo.style.left = "-100px";
					if(actualPlayer == player){
						player.score = player.score + 1;
						sendCommand('udpatePlayerScore('+playerIndex+', '+player.score+')');
						sendCommand('showHideObject("'+frogs[i].name+'","none")');
					}
					// TODO show hit
					return;
				}
	         }		
		 }
	}
	
	window.setTimeout('moveTorpedo("'+torpedoId+'",'+playerIndex+');', 0);
}

function ProcessKeypress(e) {
	if (e.keyCode)
		keycode = e.keyCode;
	else
		keycode = e.which;
	ch = String.fromCharCode(keycode);

	var objectToMove = player.name;
	var moveObjectByX = 0;
	var moveObjectByY = 0;

	if (ch == 'a') {
		moveObjectEachSide(objectToMove, -moveBy, 0);
	} else if (ch == 'd') {
		moveObjectEachSide(objectToMove, moveBy, 0);
	}
	else if (ch == 's') {
		sendFireTorpedo();
	}
}
function moveObjectEachSide(obj, x, y, makeContinous = true) {
	sendCommand('moveObj("' + obj + '", ' + x + ', ' + y + ','+makeContinous+')');
}
function sendFireTorpedo() {
	sendCommand('fireTorpedo(' + players.indexOf(player) + ')');	
}
