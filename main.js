// Find intersection of RAY & SEGMENT
function getIntersection(ray,segment){

	// RAY in parametric: Point + Delta*T1
	var r_px = ray.a.x;
	var r_py = ray.a.y;
	var r_dx = ray.b.x-ray.a.x;
	var r_dy = ray.b.y-ray.a.y;

	// SEGMENT in parametric: Point + Delta*T2
	var s_px = segment.a.x;
	var s_py = segment.a.y;
	var s_dx = segment.b.x-segment.a.x;
	var s_dy = segment.b.y-segment.a.y;

	// Are they parallel? If so, no intersect
	var r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
	var s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
	if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
		// Unit vectors are the same.
		return null;
	}

	// SOLVE FOR T1 & T2
	// r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
	// ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
	// ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
	// ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
	var T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
	var T1 = (s_px+s_dx*T2-r_px)/r_dx;

	// Must be within parametic whatevers for RAY/SEGMENT
	if(T1<0) return null;
	if(T2<0 || T2>1) return null;

	// Return the POINT OF INTERSECTION
	return {
		x: r_px+r_dx*T1,
		y: r_py+r_dy*T1,
		param: T1
	};

}

///////////////////////////////////////////////////////

// DRAWING
var canvas = document.getElementById("can");
canvas.width = Math.floor(window.innerWidth / 50) * 50;
canvas.height = Math.floor(window.innerHeight / 50) * 50;
var ctx = canvas.getContext("2d");
var cx = canvas.width / 2;
var cy = canvas.height / 2;

var w = false;
var a = false;
var s = false;
var d = false;

// LINE SEGMENTS
var segments = [

	// Border
	{a:{x:0,y:0}, b:{x:canvas.width,y:0}},
	{a:{x:canvas.width,y:0}, b:{x:canvas.width,y:canvas.height}},
	{a:{x:canvas.width,y:canvas.height}, b:{x:0,y:canvas.height}},
	{a:{x:0,y:canvas.height}, b:{x:0,y:0}},

	// Polygon #1
	{a:{x:100,y:150}, b:{x:120,y:50}},
	{a:{x:120,y:50}, b:{x:200,y:80}},
	{a:{x:200,y:80}, b:{x:140,y:210}},
	{a:{x:140,y:210}, b:{x:100,y:150}},

	// Polygon #2
	{a:{x:100,y:200}, b:{x:120,y:250}},
	{a:{x:120,y:250}, b:{x:60,y:300}},
	{a:{x:60,y:300}, b:{x:100,y:200}},

	// Polygon #3
	{a:{x:200,y:260}, b:{x:220,y:150}},
	{a:{x:220,y:150}, b:{x:300,y:200}},
	{a:{x:300,y:200}, b:{x:350,y:320}},
	{a:{x:350,y:320}, b:{x:200,y:260}},

	// Polygon #4
	{a:{x:340,y:60}, b:{x:360,y:40}},
	{a:{x:360,y:40}, b:{x:370,y:70}},
	{a:{x:370,y:70}, b:{x:340,y:60}},

	// Polygon #5
	{a:{x:450,y:190}, b:{x:560,y:170}},
	{a:{x:560,y:170}, b:{x:540,y:270}},
	{a:{x:540,y:270}, b:{x:430,y:290}},
	{a:{x:430,y:290}, b:{x:450,y:190}},

	// Polygon #6
	{a:{x:400,y:95}, b:{x:580,y:50}},
	{a:{x:580,y:50}, b:{x:480,y:150}},
	{a:{x:480,y:150}, b:{x:400,y:95}}

];

//Game Loop
var last = performance.now();
var dt = 0;
var interval = setInterval(tick, 0);

// PLAYER
var Player = {
	x: 0,
	y: 0,
    xv: 0,
    yv: 0,
    speed: 5
};
document.addEventListener("keydown", function (e) 
{
    if (e.key == "w") w = true;
    if (e.key == "a") a = true;
    if (e.key == "s") s = true;
    if (e.key == "d") d = true;
});
document.addEventListener("keyup", function (e) 
{
    if (e.key == "w") w = false;
    if (e.key == "a") a = false;
    if (e.key == "s") s = false;
    if (e.key == "d") d = false;
});

function tick()
{
    var now = performance.now();
    dt = now - last;
    last = now;
    while (dt >= 1000 / 60)
    {
        dt -= 1000 / 60;
        update()
    }
    render();
}

function update()
{
    if (w) Player.yv = -Player.speed;
    if (a) Player.xv = -Player.speed;
    if (s) Player.yv = Player.speed;
    if (d) Player.xv = Player.speed;
    Player.y += Player.yv;
    Player.x += Player.xv;
    Player.yv /= 5;
    Player.xv /= 5;
}

function render()
{
	// Clear canvas
    ctx.resetTransform();
    ctx.fillStyle = "#000";
	ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.translate(-Player.x + cx, -Player.y + cy);
	// Draw segments
	ctx.strokeStyle = "#999";
	for(var i=0;i<segments.length;i++){
		var seg = segments[i];
		ctx.beginPath();
		ctx.moveTo(seg.a.x,seg.a.y);
		ctx.lineTo(seg.b.x,seg.b.y);
		ctx.stroke();
	}

	// Get all unique points
	var points = (function(segments){
		var a = [];
		segments.forEach(function(seg){
			a.push(seg.a,seg.b);
		});
		return a;
	})(segments);
	var uniquePoints = (function(points){
		var set = {};
		return points.filter(function(p){
			var key = p.x+","+p.y;
			if(key in set){
				return false;
			}else{
				set[key]=true;
				return true;
			}
		});
	})(points);

	// Get all angles
	var uniqueAngles = [];
	for(var j=0;j<uniquePoints.length;j++){
		var uniquePoint = uniquePoints[j];
		var angle = Math.atan2(uniquePoint.y-Player.y,uniquePoint.x-Player.x);
		uniquePoint.angle = angle;
		uniqueAngles.push(angle-0.00001,angle,angle+0.00001);
	}

	// RAYS IN ALL DIRECTIONS
	var intersects = [];
	for(var j=0;j<uniqueAngles.length;j++){
		var angle = uniqueAngles[j];

		// Calculate dx & dy from angle
		var dx = Math.cos(angle);
		var dy = Math.sin(angle);

		// Ray from center of screen to mouse
		var ray = {
			a:{x:Player.x,y:Player.y},
			b:{x:Player.x+dx,y:Player.y+dy}
		};

		// Find CLOSEST intersection
		var closestIntersect = null;
		for(var i=0;i<segments.length;i++){
			var intersect = getIntersection(ray,segments[i]);
			if(!intersect) continue;
			if(!closestIntersect || intersect.param<closestIntersect.param){
				closestIntersect=intersect;
			}
		}

		// Intersect angle
		if(!closestIntersect) continue;
		closestIntersect.angle = angle;

		// Add to list of intersects
		intersects.push(closestIntersect);

	}

	// Sort intersects by angle
	intersects = intersects.sort(function(a,b){
		return a.angle-b.angle;
	});

	// DRAW AS A GIANT POLYGON
    const gradient = ctx.createRadialGradient(Player.x,Player.y,100, Player.x,Player.y,250);

    // Add three color stops
    gradient.addColorStop(0, '#ffff80');
    gradient.addColorStop(1, '#000000');

	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(intersects[0].x,intersects[0].y);
	for(var i=1;i<intersects.length;i++){
		var intersect = intersects[i];
		ctx.lineTo(intersect.x,intersect.y);
	}
	ctx.fill();

    ctx.fillStyle = "#ffff80";
    ctx.strokeStyle = "#000";
    ctx.resetTransform();
    ctx.fillRect(cx - 10, cy - 10, 20, 20);
    ctx.strokeRect(cx - 10, cy - 10, 20, 20);
	// DRAW DEBUG LINES
	// ctx.strokeStyle = "#f55";
	// for(var i=0;i<intersects.length;i++){
	// 	var intersect = intersects[i];
	// 	ctx.beginPath();
	// 	ctx.moveTo(Player.x,Player.y);
	// 	ctx.lineTo(intersect.x,intersect.y);
	// 	ctx.stroke();
	// }
}
