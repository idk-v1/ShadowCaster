var can = document.getElementById("can");
var ctx = can.getContext("2d");

var size = 75; //Width of tiles
var count = 0;
var done = false;
var ledcount = 0;
var led = ledcount;
var donecount = 0;

can.style.top = size / 2 + "px";
can.style.left = size / 2 + "px";
can.style.position = "fixed";
can.width = window.innerWidth - size;
can.height = window.innerHeight - size;

var w = Math.floor(can.width / size);
var h = Math.floor(can.height / size);

var tiles = new Array(w * h).fill(new btile());

bod = document.querySelector("body");
bod.style = "padding: 0; border: 0; margin: 0; overflow: hidden; background-color: #000;";

ctx.fillStyle = "#445566";
ctx.fillRect(0, 0, w * size, h * size);

var rndX = Math.floor(Math.random() * w);
var rndY = Math.floor(Math.random() * h);
/*
0 = UP
1 = RIGHT
2 = DOWN
3 = LEFT
*/

setInterval(tick, 0);
tiles[rndX + rndY * w] = new tile(rndX, rndY, 0);
led += (50 / (w * h));

function tick()
{
    render();
    update();
    count++;
    //console.log(count);
    if (count >= 2750 && !done)
    {
        for (var y = 0; y < h; y++)
        {
            for (var x = 0; x < w; x++)
            {
                update(x, y);
            }
        }
    }
}

function update(x, y)
{
    if (done) 
    {
        donecount++;
        if (donecount >= 500)
        {
            donecount = -1000000000000;
            location.reload();
        }
        return;
    }
    rndX = x;
    rndY = y;
    if (!x)
    {
        rndX = Math.floor(Math.random() * w);
        rndY = Math.floor(Math.random() * h);
    }
    if (true)
    {
        var yes = false;
        if (tiles[rndX + rndY * w - w] != undefined)
        {
            if (tiles[rndX + rndY * w - w].s)
            {
                yes = true;
            }
        }
        if (tiles[rndX + rndY * w + w] != undefined)
        {
            if (tiles[rndX + rndY * w + w].s)
            {
                yes = true;
            }
        }
        if (tiles[rndX + rndY * w - 1] != undefined)
        {
            if (tiles[rndX + rndY * w - 1].s && (rndX + rndY * w - 1) % w != w - 1)
            {
                yes = true;
            }
        }
        if (tiles[rndX + rndY * w + 1] != undefined)
        {
            if (tiles[rndX + rndY * w + 1].s && (rndX + rndY * w + 1) % w != 0)
            {
                yes = true;
            }
        }

        if (yes)
        {
            if (!tiles[rndX + rndY * w].s)
            {
                tiles[rndX + rndY * w] = new tile(rndX, rndY, led);
                led += (50 / (w * h));            
            }
        }

    }
    if (tiles.every(function(v) {return v.s == true})) done = true;
    if (done) console.log("DONE");
    ctx.fillStyle = "#fff";
    ctx.fillRect(rndX * size, rndY * size, size, size);
}

function render()
{
    ctx.fillStyle = "#44556611";
    if (done) ctx.fillStyle = "#00000004";
    ctx.fillRect(0, 0, w * size, h * size);
    for (var y = 0; y < h; y++)
    {
        for (var x = 0; x < w; x++)
        {
            ctx.fillStyle = "#000";
            ctx.fillStyle = "hsl(" + tiles[x + y * w].lead + "deg,100%,50%)";
            if (tiles[x + y * w].s) ctx.fillRect(x * size + size / 4, y * size + size / 4, size / 2, size / 2);
            if (tiles[x + y * w].u)
            {
                ctx.fillRect(x * size + size / 4, y * size, size / 2, size / 2);
            }
            if (tiles[x + y * w].r)
            {
                ctx.fillRect(x * size + size / 2, y * size + size / 4, size / 2, size / 2);
            }
            if (tiles[x + y * w].d)
            {
                ctx.fillRect(x * size + size / 4, y * size + size / 2, size / 2, size / 2);
            }
            if (tiles[x + y * w].l)
            {
                ctx.fillRect(x * size, y * size + size / 4, size / 2, size / 2);
            }
        
            ctx.strokeStyle = "#000";
            ctx.strokeRect(x * size, y * size, size, size);
        }
    }
}

function tile(x, y, lead)
{
    this.lead = lead;
    this.s = true;

    this.u = false;
    this.r = false;
    this.d = false;
    this.l = false;

    if (tiles[x + y * w - w] != undefined) this.u = tiles[x + y * w - w].d;
    if (tiles[x + y * w + 1] != undefined) this.r = tiles[x + y * w + 1].l;
    if (tiles[x + y * w + w] != undefined) this.d = tiles[x + y * w + w].u;
    if (tiles[x + y * w - 1] != undefined) this.l = tiles[x + y * w - 1].r;

    if (this.u === null) this.u = Math.floor(Math.random() * 5) >= 2 ? true : false;
    if (this.r === null) this.r = Math.floor(Math.random() * 5) >= 2 ? true : false;
    if (this.d === null) this.d = Math.floor(Math.random() * 5) >= 2 ? true : false;
    if (this.l === null) this.l = Math.floor(Math.random() * 5) >= 2 ? true : false;
    
    if (lead == ledcount)
    {
        this.u = true;
        this.r = true;
        this.d = true;
        this.l = true;
    }
}

function btile()
{
    this.u = null;
    this.r = null;
    this.d = null;
    this.l = null;
    this.s = null;
    this.lead = 0;
}