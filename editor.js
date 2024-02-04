var tileSize = 24 //size to render every tile
var gridContent = [
    [16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16],
    [16, 16, 16, 16, 16]
] //16 = blank, 0-15 = binary
var gridSize = {x:5, y:5} //i'm storing size and content seperately
var tileSelected = 0

const $ = x => document.getElementById(x) 
const grid = $("grid")
const ctx = grid.getContext("2d")
const selector = $("selector")
const sctx = selector.getContext("2d")
const toBin = x => x.toString(2).padStart(4, "0")

//========================================================================
function renderTile(x, y, value) { //render a single tile on the grid
    const currX = x*tileSize
    const currY = y*tileSize
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(currX, currY, tileSize-2, tileSize-2) //clear all tile content to 16
    if (value != 16) {
        ctx.fillStyle = "#7F7F7F"
        ctx.fillRect(tileSize/2+currX-2, currY, 2, tileSize-2)
        ctx.fillRect(currX, tileSize/2+currY-2, tileSize-2, 2)
        const bin = toBin(value) //binary representation of value
        
        //draw black subtiles
        ctx.fillStyle = "#000000"
        const ss = tileSize/2-2 //subtile space
        const render = (i, rx, ry) => bin[i]=="1" ? ctx.fillRect(rx, ry, ss, ss) : 0 //index of binary, render x coord, render y coord
        render(0, currX, currY)
        render(1, currX+ss+2, currY)
        render(2, currX, currY+ss+2)
        render(3, currX+ss+2, currY+ss+2)
    }
} 
//========================================================================
function renderSelector() {
    sctx.fillStyle = "#FFFFFF"
    sctx.fillRect(0, 0, tileSize*2, tileSize*2)
    if (tileSelected != 16) { //to add the subtile dividers
        sctx.fillStyle = "#7F7F7F"
        sctx.fillRect(tileSize-1, 0, 2, tileSize*2)
        sctx.fillRect(0, tileSize-1, tileSize*2, 2)
        //draw subtiles
        const bin = toBin(tileSelected)
        const renderBin = (i, x, y) => {
            if (bin[i]=="1") {
                sctx.fillRect(x, y, tileSize-1, tileSize-1)
            }
        }
        sctx.fillStyle = "#000000"
        renderBin(0, 0, 0)
        renderBin(1, tileSize+1, 0)
        renderBin(2, 0, tileSize+1)
        renderBin(3, tileSize+1, tileSize+1)
    }
}
//========================================================================
function renderGrid() { //render the grid
    grid.width = gridSize.x * tileSize //resize x
    grid.height = gridSize.y * tileSize //resize y
    //clear grid to white
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, grid.width, grid.height) 
    ctx.fillStyle = "#000000"
    //draw outlines
    for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
            const nextX = (x+1)*tileSize
            const currX = x*tileSize
            const nextY = (y+1)*tileSize
            const currY = y*tileSize
            ctx.fillRect(nextX-2, currY, 2, tileSize)
            ctx.fillRect(currX, nextY-2, tileSize, 2)
        }
    }
    //draw tiles
    for (let col in gridContent) {
        for (let tile in gridContent[col]) {
            renderTile(col, tile, gridContent[col][tile])
        }
    }
    //draw selector tile
    selector.width = tileSize*2
    selector.height = tileSize*2
    renderSelector()
}
//========================================================================
const resize = () => {
    let x = Math.floor($("width").value)
    let y = Math.floor($("height").value)
    x = (x > 0 ? x : 1) //less than zero then set it to 1
    y = (y > 0 ? y : 1)
    gridSize = {x:x,y:y} //change stored size
    
    //resize y (add/remove rows)
    if (gridContent[0].length > gridSize.y) { //do we need to make the columns shorter
        for (col of gridContent) { //iterate over columns
            while (col.length > gridSize.y) { //while its too long
                col.pop()
            }
        }
    } else {
        for (col of gridContent) { //iterate over columns
            while (col.length < gridSize.y) { //while its too short
                col.push(16)
            }
        }
    }
    //resize x (add/remove columns)
    if (gridContent.length > gridSize.x) { //if the grid is too long
        while (gridContent.length > gridSize.x) { //while its too long
            gridContent.pop()
        }
    } else {
        const blankCol = new Array(gridSize.y).fill(16)
        while (gridContent.length < gridSize.x) { //while its too short
            gridContent.push([...blankCol]) //clone column
        }
    }
    renderGrid()
}

$("resize").addEventListener("click", resize)
//========================================================================
const size = $("size")
size.addEventListener("input", () => {
    //only change if the size set is greater or equal to 8px
    if (size.value >= 8 && size.value % 2 == 0) {
        tileSize = Math.floor(size.value)
        renderGrid()
    }
})
//========================================================================
grid.addEventListener("click", event => {
    const getPos = n => Math.floor(n / tileSize) //calculate which one was clicked
    let x = getPos(event.offsetX)
    let y = getPos(event.offsetY)
    gridContent[x][y] = tileSelected
    renderTile(x, y, gridContent[x][y])
})
//========================================================================
const posIndex = [ //x, y = which binary position
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
]

const toggleBit = pos => { //toggle bit in selector
    if (tileSelected == 16) tileSelected = 0  //if empty then set to 0
    
    let bin = toBin(tileSelected).split("") //current selected as binary
    bin[pos] = (bin[pos] == "1" ? "0" : "1") //invert bit
    tileSelected = parseInt(bin.join(""), 2) //reconstruct
    renderSelector()
}

selector.addEventListener("click", event=>{
    const getPos = n => Math.floor(n / tileSize) //calculate which one was clicked
    let x = getPos(event.offsetX)
    let y = getPos(event.offsetY)

    let pos = 0 //position in binary
    
    for (i in posIndex) { //i refuse to use repetitive code
        if (x == posIndex[i][0] && y == posIndex[i][1]) { //match xy to posindex
            pos = i
            break
        }
    }
    toggleBit(pos)
})

const empty = () => { //empty selector
    tileSelected=16
    renderSelector()
}

$("empty").addEventListener("click", empty)

//========================================================================
const moveGrid = dir => { //cycle grid tiles
    switch (dir) {
        case 0: //up
            for (col of gridContent) {
                col.push(col.shift())
            }
            break
        case 1: //right
            gridContent.unshift(gridContent.pop())
            break
        case 2: //down
            for (col of gridContent) {
                col.unshift(col.pop())
            }
            break
        case 3: //left
            gridContent.push(gridContent.shift())
            break
    }
    renderGrid()
}

$("left").addEventListener("click", () => moveGrid(3))
$("right").addEventListener("click", () => moveGrid(1))
$("up").addEventListener("click", () => moveGrid(0))
$("down").addEventListener("click", () => moveGrid(2))

//========================================================================
const keyResize = (element, increment) => {
    let n = parseInt(element.value) + increment
    if (n < 1) n = 1 //dont go to 0
    element.value = n
    resize()
}

document.onkeydown = event =>{ //selector keybinds
    if (document.activeElement == $("body")) {
        switch (event.key) {
            case "q":
            toggleBit(0)
                break
            case "w":
            toggleBit(1)
                break
            case "a":
                toggleBit(2)
                break
            case "s":
                toggleBit(3)
                break
            case "e":
                empty()
                break
            case "ArrowUp":
                moveGrid(0)
                break
            case "ArrowRight":
                moveGrid(1)
                break
            case "ArrowDown":
                moveGrid(2)
                break
            case "ArrowLeft":
                moveGrid(3)
                break
            case "-":
                keyResize($("height"), -1)
                break
            case "=":
                keyResize($("height"), 1)
                break
            case "[":
                keyResize($("width"), -1)
                break
            case "]":
                keyResize($("width"), 1)
                break
        }
    }
}
//========================================================================

function importCode(code) {
    try {
        code = atob(code)
        getDimension = reg => {
            const n = parseInt(reg.exec(code)[0])
            if (isNaN(n) || n < 1) throw reg.exec(code)[0]
            return n
        }
        
        const width = getDimension(/^\d+/) //get width
        const height = getDimension(/(?<=;)\d+/) //get height
        const data = (/(?<=;).[^;]*$/.exec(code) || [""])[0] //the content, if none then assume empty string
        
        //set HTML elements
        $("width").value = width
        $("height").value = height
        //set internal grid size
        gridSize = {x:width, y:height}

        //reset current content
        gridContent = new Array(width)
        for (i = 0; i < width; i++) {
            gridContent[i] = new Array(height) //fill with unique arrays
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let char = data.charCodeAt(y*width + x).toString(2) //our character in the code
                if (char == "10001") { //NOP character set to 0
                    char = "0"
                } else if (isNaN(char)) { //we have run out of content, assume empty
                    char = "10000"
                }
                gridContent[x][y] = parseInt(char, 2) //add tile to the grid column
            }
        }
        renderGrid()
    } catch(x) {
        alert("The code could not be imported.")
        console.log(x)
    }
}

$("import").addEventListener("click", () =>{
    const code = prompt("Paste the code here:")
    importCode(code)
})

//========================================================================

const output = $("output")

$("export").addEventListener("click", () =>{
    let code = gridSize.x + ";" + gridSize.y + ";"
    
    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            let char = gridContent[x][y]
            if (char == 0) char = 17 //null bytes are turned into 10001
            code += String.fromCharCode(char)
        }
    }
    code = btoa(code.match(/[\s\S]+[^\u0010]/)[0]) //remove trailing empties, as they will be implied upon import
    output.value = code

    //set url parameter
    let searchParams = new URLSearchParams(window.location.search)
    searchParams.set("c", code)
    let newRelativePathQuery = window.location.pathname + '?' +  searchParams.toString()
    history.pushState(null, '', newRelativePathQuery)
})

//========================================================================

$("execute").addEventListener("click", () =>{
    const out = execute(gridContent, $("input").value)
    if (out[0] === false) { //its the error 
        output.value = out[1]
    } else {
        output.value = `Program stopped on ${out[0].x},${out[0].y}\n${out[1]}`
    }
})

//========================================================================

window.addEventListener("keydown", function(e) { //disable
    if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.key) > -1 && document.activeElement == $("body")) {
        e.preventDefault();
    }
}, false);

//========================================================================
let confirm = true
$("exitConfirm").addEventListener("click", () => confirm = !confirm)

window.onbeforeunload = function(e) {
    if (confirm) return "Do you want to exit this page?";
}
//=========================
//code url parameter
const code = new URLSearchParams(window.location.search).get("c")
if (code) {
    importCode(code)
}
renderGrid()