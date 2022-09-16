{
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
var ctx = canvas.getContext("2d");
var cx;
var cy;
var stat = document.getElementById("stat");
stat.style = "top: 2.5%; left: 2.5%; color: #fff; position: fixed;";
canvas.width = Math.floor(window.innerWidth / 50) * 50;
canvas.height = Math.floor(window.innerHeight / 50) * 50;
cx = canvas.width / 2;
cy = canvas.height / 2;

var w = false;
var a = false;
var s = false;
var d = false;
var shift = false;

var TLcol = false;
var Tcol = false;
var TRcol = false;
var Rcol = false;
var BRcol = false;
var Bcol = false;
var BLcol = false;
var Lcol = false;

//ENEMIES
var ghosts = [];

// ghosts.push(new ghost(200, 500));
// ghosts.push(new ghost(400, 500));
// ghosts.push(new ghost(600, 500));
// ghosts.push(new ghost(800, 500));
ghosts.push(new ghost(1000, 500));

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
cube(500, 500);

//Game Loop
var last = performance.now();
var dt = 0;
var interval = setInterval(tick, 0);

// PLAYER
var Player = {
	x: 250,
	y: 250,
    xv: 0,
    yv: 0,
    speed: 3,
    blink: 0,
    ext: 0,
    light: true,
    health: 50,
    dead: false
};
document.addEventListener("keydown", function (e) 
{
    if (e.key == "w" || e.key == "W") w = true;
    if (e.key == "a" || e.key == "A") a = true;
    if (e.key == "s" || e.key == "S") s = true;
    if (e.key == "d" || e.key == "D") d = true;
    if (e.shiftKey) shift = true;
});
document.addEventListener("keyup", function (e) 
{
    if (e.key == "w" || e.key == "W") w = false;
    if (e.key == "a" || e.key == "A") a = false;
    if (e.key == "s" || e.key == "S") s = false;
    if (e.key == "d" || e.key == "D") d = false;
    if (!e.shiftKey) shift = false;
});
document.addEventListener("resize", function () 
{
    canvas.width = Math.floor(window.innerWidth / 50) * 50;
    canvas.height = Math.floor(window.innerHeight / 50) * 50;
    cx = canvas.width / 2;
    cy = canvas.height / 2;
});

function tick()
{
    var now = performance.now();
    dt += now - last;
    last = now;
    while (dt >= 1000 / 120)
    {
        dt -= 1000 / 120;
        update()
    }
    render();
}

function update()
{
    for (var g = 0; g < ghosts.length; g++)
    {
        if (Math.sqrt(Math.pow(ghosts[g].x - Player.x, 2) + Math.pow(ghosts[g].y - Player.y, 2)) < 200 || !shift)
        {
            if (ghosts[g].x > Player.x) ghosts[g].xv += -ghosts[g].speed;
            if (ghosts[g].x < Player.x) ghosts[g].xv += ghosts[g].speed;
            if (ghosts[g].y > Player.y) ghosts[g].yv += -ghosts[g].speed;
            if (ghosts[g].y < Player.y) ghosts[g].yv += ghosts[g].speed;
            if (Math.round(ghosts[g].x - Player.x) >= -10 && Math.round(ghosts[g].y - Player.y) >= -10 && Math.round(ghosts[g].x - Player.x) <= 10 && Math.round(ghosts[g].y - Player.y) <= 10)
            {
                Player.health -= ghosts[g].damage;
                ghosts[g].dead = true;
            }
        }
        else if (Math.sqrt(Math.pow(ghosts[g].x - Player.x, 2) + Math.pow(ghosts[g].y - Player.y, 2)) < 150)
        {
            if (ghosts[g].x > Player.x) ghosts[g].xv += -ghosts[g].speed;
            if (ghosts[g].x < Player.x) ghosts[g].xv += ghosts[g].speed;
            if (ghosts[g].y > Player.y) ghosts[g].yv += -ghosts[g].speed;
            if (ghosts[g].y < Player.y) ghosts[g].yv += ghosts[g].speed;
            if (Math.round(ghosts[g].x - Player.x) >= -10 && Math.round(ghosts[g].y - Player.y) >= -10 && Math.round(ghosts[g].x - Player.x) <= 10 && Math.round(ghosts[g].y - Player.y) <= 10)
            {
                Player.health -= ghosts[g].damage;
                ghosts[g].dead = true;
            }
        }
        ghosts[g].x += ghosts[g].xv;
        ghosts[g].y += ghosts[g].yv;
        ghosts[g].xv /= 5;
        ghosts[g].yv /= 5;
        if (ghosts[g].dead)
        {
            ghosts.splice(g, 1);
            g--;

        }
    }

    Player.yv = (Player.speed * s) - (Player.speed * w);
    Player.xv = (Player.speed * d) - (Player.speed * a);
    if (shift)
    {
        Player.yv /= 7;
        Player.xv /= 7;
        Player.y += Player.yv;
        Player.x += Player.xv;
        Player.yv /= 7;
        Player.xv /= 7;
    } else {
        Player.yv /= 2;
        Player.xv /= 2;
        Player.y += Player.yv;
        Player.x += Player.xv;
        Player.yv /= 2;
        Player.xv /= 2;
    }
    Player.ext += Math.max(Math.abs(Player.xv / 3), Math.abs(Player.yv / 3));
    Player.ext -= .25;
    if (Player.ext <= 0) Player.ext = 0;
    if (Player.ext > 75) Player.light = false;
    if (Player.health <= 0) 
    {
        Player.dead = true;
        Player.light = false;
    }

    //WARNING! COLLISIONS CODE MESS BELOW.
    {
        var tlcb = false;
        var tcb = false;
        var trcb = false;
        var rcb = false;
        var brcb = false;
        var bcb = false;
        var blcb = false;
        var lcb = false;

    for (var i = 0; i < segments.length; i++)
    {
        var tc = getIntersection({a: {x: Player.x - 10.0001, y: Player.y - 10}, b: {x: Player.x + 10, y: Player.y - 10}}, segments[i]);
        var rc = getIntersection({a: {x: Player.x + 10.0001, y: Player.y - 10}, b: {x: Player.x + 10, y: Player.y + 10}}, segments[i]);
        var bc = getIntersection({a: {x: Player.x + 10.0001, y: Player.y + 10}, b: {x: Player.x - 10, y: Player.y + 10}}, segments[i]);
        var lc = getIntersection({a: {x: Player.x - 10.0001, y: Player.y + 10}, b: {x: Player.x - 10, y: Player.y - 10}}, segments[i]);

        //GET TOP LEFT
        if (tc && lc) {
            if (tc.x < Player.x && tc.x >= Player.x - 20 && lc.y < Player.y && lc.y >= Player.y - 20) 
            {
                tlcb = true;
                Player.x++;
                Player.y++;
            }
        }
        //GET TOP
        if (rc && lc) 
        {
            if (rc.y < Player.y && rc.y >= Player.y - 20 && lc.y < Player.y && lc.y >= Player.y - 20) 
            {
                tcb = true;
                Player.y++;
            }
        }
        if (tc)
        {
            if (tc.x <= Player.x + 10 && tc.x >= Player.x - 10)
            {
                tcb = true;
                Player.y++;
            }
        }
        //GET TOP RIGHT
        if (rc && tc) {
            if (rc.y > Player.y && rc.y <= Player.y + 20 && tc.x < Player.x && tc.x >= Player.x - 20) 
            {
                trcb = true;
                Player.x--;
                Player.y++;
            }
        }

        //GET LEFT
        if (tc && bc) {
            if (tc.x < Player.x && tc.x >= Player.x - 20 && bc.x < Player.x && bc.x >= Player.x - 20) 
            {
                lcb = true;
                Player.x++;
            }
        }
    }
    if (tlcb) TLcol = true; else TLcol = false;
    if (tcb) Tcol = true; else Tcol = false;
    if (trcb) TRcol = true; else TRcol = false;

    if (lcb) Lcol = true; else Lcol = false;

    }
}

function render()
{
    stat.innerHTML = `Player<br>X: ${Player.x}<br>Y: ${Player.y}<br>XV: ${Player.xv}<br>YV: ${Player.yv}<br>BLINK: ${Player.blink}<br>EXTINGUISH: ${Player.ext} ${Player.light}<br>HEALTH: ${Player.health}<br><br>
    Top Left: ${TLcol}<br>
    Top: ${Tcol}<br>
    Top Right: ${TRcol}<br>
    Right: ${Rcol}<br>
    Bottom Right: ${BRcol}<br>
    Left: ${Lcol}`;
	// Clear canvas
    ctx.resetTransform();
    // TODO GIVE ALPHA FOR LOW HEALTH MODE
    ctx.fillStyle = `#000000${Math.round(Player.health * 2).toString(16)}`;
	ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.translate(-Player.x + cx, -Player.y + cy);
	// Draw segments
	//ctx.strokeStyle = "#fff";
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
    const gradient = ctx.createRadialGradient(Player.x ,Player.y,150, Player.x,Player.y,300);

    // Add three color stops
    gradient.addColorStop(0, `#ff${(50 + Player.health * 4).toString(16)}40`);
    gradient.addColorStop(1, '#00000000');


    //
    //  GET RANDOM NUMBER TIMER TO ON. 
    //
    Player.blink-=0.5;
    if (Player.blink <= -5)
    {
        Player.blink = Math.floor(Math.random() * 63 - Player.ext);
    } else if (Player.blink >= 0 && Player.light) {
        ctx.fillStyle = gradient;
	    ctx.beginPath();
	    ctx.moveTo(intersects[0].x,intersects[0].y);
	    for(var i=1;i<intersects.length;i++){
		    var intersect = intersects[i];
		    ctx.lineTo(intersect.x,intersect.y);
	    }
	    ctx.fill();
    }

    ctx.fillStyle = "#ffffff20";
    ctx.strokeStyle = "#000";
    for (var g = 0; g < ghosts.length; g++)
    {
        ctx.fillRect(ghosts[g].x - 10, ghosts[g].y - 10, 20, 20);
        ctx.strokeRect(ghosts[g].x - 10, ghosts[g].y - 10, 20, 20);
    }

    ctx.fillStyle = `#ff${(50 + Player.health * 4).toString(16)}40`;
    ctx.strokeStyle = "#000";
    ctx.resetTransform();
    ctx.fillRect(cx - 10, cy - 10, 20, 20);
    ctx.strokeRect(cx - 10, cy - 10, 20, 20);

    if (Player.dead)
    {
        ctx.fillStyle = "#480000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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

function cube(x, y)
{
    //	{a:{x:,y:}, b:{x:,y:}}
    segments.push({a:{x: x - 10, y: y - 10}, b:{x: x + 10, y: y - 10}});
    segments.push({a:{x: x + 10, y: y - 10}, b:{x: x + 10, y: y + 10}});
    segments.push({a:{x: x + 10, y: y + 10}, b:{x: x - 10, y: y + 10}});
    segments.push({a:{x: x - 10, y: y + 10}, b:{x: x - 10, y: y - 10}});
}

function ghost(x, y)
{
    this.x = x;
    this.y = y;
    this.xv = 0;
    this.yv = 0;
    this.speed = 1.25;
    this.damage = 10;
    this.dead = false;
}
}
