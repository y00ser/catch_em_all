step = 0;  	// Current step
steps = 500; // Total number of steps to perform the effect
accel = 0.05;  // Acceleration
vX = 4; 	// X velocity

function moveObj(name, Xpix, Ypix)
{
	obj = document.getElementById(name);

	var px = parseInt(obj.style.left) + Xpix;
	var py = parseInt(obj.style.top) + Ypix;
	
	if(px > playGroundRect.leftTopX && py > playGroundRect.leftTopY &&
			(px + obj.width) < playGroundRect.rightBottomX && (py + obj.height) < playGroundRect.rightBottomY)
		{
			obj.style.left = px;
			obj.style.top = py;
		}
}

function fireTorpedo(name)
{
// Get the position of the saucer
	var obj = document.getElementById(name);
	var px = parseInt(obj.style.left);
	var py = parseInt(obj.style.top);

// Fire topredo to the right of the saucer
	var t = document.getElementById("torpedo");
	t.style.left = px+95;
	t.style.top = py+38;

	step = 0;
	accel = 0.05;
	vX=1;

	window.setTimeout("moveTorpedo();", 0);
}

function moveTorpedo()
{
	step++; if(step>=steps) return; // The effect has finished

// Move torpedo to the right by the given velocity and acceleration
	var t = document.getElementById("torpedo");
	var px = parseInt(t.style.left);
	vX+=parseInt(accel); // Increase velocity by the amount of acceleration
	t.style.left = px + vX;
  var torpedoLeft = parseInt(t.style.left);
  var rwithgunLeft = parseInt(document.getElementById("rwithgun").style.left);
  if( torpedoLeft > rwithgunLeft)
  {
    //alert("collison");
  }
  else
  {
	//accel+=0.05;
	window.setTimeout("moveTorpedo();", 0);
  }
}

function ProcessKeypress(e)
{
	var myObj = "saucer";
	var moveBy = 10;

	if (e.keyCode) keycode=e.keyCode;
	else keycode=e.which;
	ch=String.fromCharCode(keycode);

  var objectToMove = myObj;
  var moveObjectByX = 0;
  var moveObjectByY = 0;

	if(ch=='a'){
    moveObjectEachSide(myObj, -moveBy, 0);
  }
	else if(ch=='d'){
    moveObjectEachSide(myObj, moveBy, 0);
  }
	else if(ch=='w'){
    moveObjectEachSide(myObj, 0, -moveBy);
  }
	else if(ch=='s'){
    moveObjectEachSide(myObj, 0, moveBy);
  }
	else if(ch==' '){
    sendCommand('fireTorpedo("' + myObj +'")');
    fireTorpedo(myObj);
  }
}
function moveObjectEachSide(obj, x, y){
  sendCommand('moveObj("' + obj + '", ' + x + ', ' + y + ')');
  moveObj(obj, x, y);
}
function sendFireTorpedo(obj){
  sendCommand('fireTorpedo("' + obj +'")');
  fireTorpedo(myObj);
}
