var tileSize = 24 //pixel size to render every tile
var gridContent = [
    [16,16,16,16,16],
    [16,16,16,16,16],
    [16,16,16,16,16],
    [16,16,16,16,16],
    [16,16,16,16,16]
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
//FUNCTIONS

function renderTile(x, y, value, green) { //render a single tile on the grid
    const currX = x*tileSize
    const currY = y*tileSize
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(currX, currY, tileSize-2, tileSize-2) //clear all tile content to 16
    if (value != 16) {
        ctx.fillStyle = (!value && green ? "#00FF00" : "#7F7F7F")
        ctx.fillRect(tileSize/2+currX-2, currY, 2, tileSize-2)
        ctx.fillRect(currX, tileSize/2+currY-2, tileSize-2, 2)
        const bin = toBin(value) //binary representation of value
        
        //draw black subtiles
        ctx.fillStyle = green ? "#00FF00" : "#000000"
        const ss = tileSize/2-2 //subtile space
        const render = (i, rx, ry) => bin[i]=="1" ? ctx.fillRect(rx, ry, ss, ss) : 0 //index of binary, render x coord, render y coord
        render(0, currX, currY)
        render(1, currX+ss+2, currY)
        render(2, currX, currY+ss+2)
        render(3, currX+ss+2, currY+ss+2)
    }
} 


function renderSelector() { //THE SINGLE TILE ON THE TOP OF THE PAGE
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


function renderGrid(dontRemoveSelectionBox) { //render the entire grid
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

    //remove selection box because it wont be rendered
    if (dontRemoveSelectionBox) return
    selectionBox.start.x = -1
    selectionBox.start.y = -1
    selectionBox.end.x = -1
    selectionBox.end.y = -1
}

//resize the grid
function resize() {
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

function renderSelectionBox(green) {
    let sx = selectionBox.start.x
    let sy = selectionBox.start.y
    let ex = selectionBox.end.x
    let ey = selectionBox.end.y
    
        //swap x and y to put lowest tile on start of rendering
    if (ex < sx) ex = [sx, sx = ex][0]
    if (ey < sy) ey = [sy, sy = ey][0]

    sx = sx * tileSize - 1
    sy = sy * tileSize - 1
    ex = (ex + 1) * tileSize -1
    ey = (ey + 1) * tileSize  -1
    
    ctx.setLineDash([2,2])
    ctx.strokeStyle = (green ? "#00FF00" : "#00FFFF")
    ctx.lineWidth = 2;
    ctx.moveTo(sx-1, sy) //draw the blue dotted box of selection
    ctx.lineTo(ex, sy)
    ctx.lineTo(ex, ey)
    ctx.lineTo(sx, ey)
    ctx.lineTo(sx, sy)
    ctx.stroke()
}

////////////////////////////////////////////////////////////
//EVENTS

$("resize").addEventListener("click", resize)


const size = $("size")
size.addEventListener("input", () => {
    //only change if the size set is greater or equal to 8px
    if (size.value >= 8 && size.value % 2 == 0) {
        tileSize = Math.floor(size.value)
        renderGrid()
    }
})


var leftMouseDown = false;
var rightMouseDown = false;

const getPos = n => Math.floor(n / tileSize) //calculate which one was clicked

var mouseTileX = 0
var mouseTileY = 0

var selectionBox = {
    start: {
        x: -1,
        y: -1
    },
    end: {
        x: -1,
        y: -1
    },
    set: function(sx,sy,ex,ey) {
        this.start.x = sx
        this.start.y = sy
        this.end.x = ex
        this.end.y = ey
    },
    anchor: function() { //swap start/end coords to anchor start to top left
        if (this.start.x > this.end.x) this.start.x = [this.end.x, this.end.x = this.start.x][0]
        if (this.start.y > this.end.y) this.start.y = [this.end.y, this.end.y = this.start.y][0]
    }
}

function drawOnGrid(clicked) {
   const x = mouseTileX
   const y = mouseTileY
    if (leftMouseDown) { //
        gridContent[x][y] = tileSelected

        if (selectionBox.start.x < 0) { //if everythings deselected i  think
            renderTile(x, y, gridContent[x][y])
        } else {
            renderGrid() //clear selection box
        }
    }
    if (rightMouseDown) {
        if (clicked) { //start new selection box
            selectionBox.start.x = mouseTileX
            selectionBox.start.y = mouseTileY
        }

        selectionBox.end.x = mouseTileX
        selectionBox.end.y = mouseTileY

        renderGrid(true) //"unrender" old selection box
        renderSelectionBox() //selectionBox.start.x,selectionBox.start.y,selectionBox.end.x,selectionBox.end.y
    }
    
}

grid.addEventListener("mousemove", event => {
        //check if the mouse changed tiles
    let newMouseTileX = getPos(event.offsetX)
    let newMouseTileY = getPos(event.offsetY)
    if ((newMouseTileX == mouseTileX) && (newMouseTileY == mouseTileY)) return
    mouseTileX = newMouseTileX
    mouseTileY = newMouseTileY
    drawOnGrid()
})

grid.addEventListener("mousedown", e => {
    if (e.altKey) { //right click most likely for screenshotting, remove sele
        if (selectionBox.start.x > 0) renderGrid()
        return
    }
    switch (e.button) {
        case 0: leftMouseDown = true; break;
        case 1: 
            tileSelected = gridContent[mouseTileX][mouseTileY]
            if (selectionBox.start.x > -1) { //remove selection box if active
                renderGrid() //re-renders grid and removes selection box
            } else {
                renderSelector()
            }
            break;
        case 2: rightMouseDown = true; break;
    }
    drawOnGrid(true)
})

grid.onmousedown=e=>{if(e.button==1)return!1} //middle click prevention that wont work in my already exisitng event somehow

document.body.onmouseup = e => {
    switch (e.button) {
        case 0: leftMouseDown = false; break;
        case 2: rightMouseDown = false; break;
    }
}


grid.addEventListener('contextmenu', e => {
    if (e.altKey) return
    e.preventDefault();
});


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

function fillSelectionBox(value) {
    if (selectionBox.start.x < 0) return
    selectionBox.anchor()
    for (let x = selectionBox.start.x; x <= selectionBox.end.x; x++) {
        for (let y = selectionBox.start.y; y <= selectionBox.end.y; y++) {
            gridContent[x][y] = value
        }
    }
    renderGrid(true)
    renderSelectionBox()
}

function pasteCode() {
    let code;
    async function fart() { //i have to await and async for navigator.clipboard.readtext() because it wont yield on its own
        try {
                //get code from clipboard 
            code = await navigator.clipboard.readText()
            const [contents, width, height] = importCode(code)
        
                //add copied code to start pos of selection on grid
            selectionBox.anchor()
            for (let x = 0; x < width && x + selectionBox.start.x < gridSize.x; x++) {
                for (let y = 0; y < height && y + selectionBox.start.y < gridSize.y; y++) {
                    gridContent[x + selectionBox.start.x][y + selectionBox.start.y] = contents[x][y]
                }
            }
                //render new selection box 
            renderGrid(true)
            selectionBox.end.x = selectionBox.start.x + width - 1
            selectionBox.end.y = selectionBox.start.y + height - 1
                //if selection hangs off bottom right  corner then fix it
            if (selectionBox.end.x >= gridSize.x) selectionBox.end.x = gridSize.x - 1
            if (selectionBox.end.y >= gridSize.y) selectionBox.end.y = gridSize.y - 1

            renderSelectionBox(true)
                    
        } catch (e) {
            //alert("Paste permission was denied i think")
            console.error(e.message)
        }
    }
    fart()
}

function copyCode() {
    let copied = []
        //create a new "hidden grid" of the selection area and compile it to a code
    selectionBox.anchor()
    for (let x = selectionBox.start.x; x <= selectionBox.end.x; x++) {
        copied.push([])
        for(let y = selectionBox.start.y; y <= selectionBox.end.y; y++) {
            copied[copied.length-1].push(gridContent[x][y])
        }
    }
    navigator.clipboard.writeText(exportToCode(copied, copied.length, copied[0].length))
    renderSelectionBox(true)
}

document.onkeydown = event => { //selector keybinds
    if (document.activeElement != $("body")) return

    switch (event.key) {
        case "q":           toggleBit(0); break;
        case "w":           toggleBit(1); break;
        case "a":           toggleBit(2); break;
        case "s":           toggleBit(3); break;
        case "e":           empty(); break;
        case "ArrowUp":     moveGrid(0); break;
        case "ArrowRight":  moveGrid(1); break;
        case "ArrowDown":   moveGrid(2); break;
        case "ArrowLeft":   moveGrid(3); break;
        case "-":           keyResize($("height"), -1); break;
        case "=":           keyResize($("height"), 1); break;
        case "[":           keyResize($("width"), -1); break;
        case "]":           keyResize($("width"), 1); break;
        case "\\":          stepInterpreter(); break;
        case "Delete": fillSelectionBox(16); break;
        case "Backspace": fillSelectionBox(tileSelected); break;

        case "c": //copy on griud
            if (!event.ctrlKey || selectionBox.start.x < 0) break
            copyCode()
            break
        ///////////////////////////
        case "v": 
            if (!event.ctrlKey || selectionBox.start.x < 0) break
            pasteCode()
            break
    }
}

//========================================================================

const b64keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

function importCode(code) {
    //decode from base64 first

    let decode = ""
    code = code.replace(/[^A-Za-z0-9\+\/\=]/g, "") //remove non-b64 chars

    for (let i = 0; i < code.length; i+=4) {
        enc1 = b64keys.indexOf(code[i]);
        enc2 = b64keys.indexOf(code[i+1]);
        enc3 = b64keys.indexOf(code[i+2]);
        enc4 = b64keys.indexOf(code[i+3]);

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 0b1111) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 0b11) << 6) | enc4;

        decode += String.fromCharCode(chr1)

        if (enc3 != 64) {
            decode += String.fromCharCode(chr2);
        }

        if (enc4 != 64) {
            decode += String.fromCharCode(chr3);
        }
    }
    //has been decoded
    try {
        const firstChar = decode.charCodeAt(0)
        let content;
        let width;
        let height;

        if (firstChar <= 2) { //version 2 code
            let codeIndex; //starting index relies on where header ends

            if (firstChar == 1) { //2 byte grid size
                width = decode.charCodeAt(1)+1
                height = decode.charCodeAt(2)+1
                codeIndex = 3
            } else { //4 byte grid size
                width = (decode.charCodeAt(1) << 8) + decode.charCodeAt(2) + 1
                height = (decode.charCodeAt(3) << 8) + decode.charCodeAt(4) + 1
                codeIndex = 5
            }
            //initialize content array
            content = new Array(width)

            for (i = 0; i < content.length; i++) {
                content[i] = new Array(height).fill(16)
            }

            let gridIndex = 0; //which tile to be modifieed on the grid
            function addTileToGrid(val) {
                content[gridIndex % width][Math.floor(gridIndex / width)] = val
                gridIndex++
            }

            let mode = 0 //0 = mode switch, 1 = 8bit, 2 = 4bit
            let untilIndicator = 0 //a countdown

            for (; codeIndex < decode.length; codeIndex++) {
                currentByte = decode.charCodeAt(codeIndex)

                if (!untilIndicator) mode = 0 //if the indicator is in 0 tiles (now) then the mode is in indicator mode
                
                switch (mode) { //indicator switch
                    case 0: //indicator switching now
                        switch (currentByte >> 6) {
                            case 0b01: //REPEAT
                                let repeatTile = decode.charCodeAt(++codeIndex)
                                if (repeatTile > 16) repeatTile = 16 //max out at 10000 / empty
                                for (let i = 0; i < (currentByte & 0b111111) + 1; i++) addTileToGrid(repeatTile)
                                break
                            case 0: //unused
                                break; 
                            default: //8 and 4 bit
                                mode = (currentByte >> 6) - 1
                                untilIndicator = (currentByte & 0b111111) + 1
                        }
                        break
                    case 1: //8bit mode
                        let eightBitVal = currentByte
                        if (eightBitVal > 16) eightBitVal = 16 //max out at 10000 / empty 
                        addTileToGrid(eightBitVal)
                        untilIndicator--
                        break
                    case 2: //4bit mode
                        const fourBitVal0 = currentByte >> 4
                        const fourBitVal1 = currentByte & 0b1111
                        //add first tile
                        addTileToGrid(fourBitVal0)
                        untilIndicator--
                        //if this isnt "the odd 4BIT byte right before the indicator" then add that too
                        if (untilIndicator) {
                            addTileToGrid(fourBitVal1)
                            untilIndicator--
                        }
                        break
                }
            }

        } else { //version 1 code
            getDimension = reg => {
                const n = parseInt(reg.exec(decode)[0])
                if (isNaN(n) || n < 1) throw reg.exec(decode)[0]
                return n
            }
    
            width = getDimension(/^\d+/) //get width
            height = getDimension(/(?<=;)\d+/) //get height
            const data = (/(?<=;).[^;]*$/.exec(decode) || [""])[0] //the content, if none then assume empty string
    
            //reset current content
            content = new Array(width)
    
            for (i = 0; i < width; i++) {
                content[i] = new Array(height) //fill with unique arrays
            }
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let char = data.charCodeAt(y*width + x).toString(2) //our character in the code
                    if (char == "10001") { //NOP character set to 0
                        char = "0"
                    } else if (isNaN(char)) { //we have run out of content, assume empty
                        char = "10000"
                    }
                    content[x][y] = parseInt(char, 2) //add tile to the grid column
                }
            }
        }

        return [content,width,height]
    } catch(x) {
        if (code) {
            alert("The code could not be imported.")
            console.error(x)
            return
        }
    }
}

function loadCodeToGrid(code) {
    const [contents, width, height] = importCode(code)

    if (!contents) return //fail; give up

    //set HTML elements
    $("width").value = width
    $("height").value = height
    //set internal grid size
    gridSize = {x:width, y:height}

    gridContent = contents
    renderGrid()
}

$("import").addEventListener("click", () =>{
    loadCodeToGrid(prompt("Paste the code here:"))
})

//========================================================================

const output = $("output")

function exportToCode(content, sizeX, sizeY, version = 2) {
    if (version == 2) {
            //HEADER
        let gridSize4bytes = sizeX > 255 || sizeY > 255 //if any dimension > 255 then use 4 bytes for grid size
        let code = []; //will be manually base64 encoded later

        if (gridSize4bytes) {
            code.push(2)
            code.push(Math.floor((sizeX - 1) / 256))
            code.push((sizeX - 1) % 256)
            code.push(Math.floor((sizeY - 1) / 256))
            code.push((sizeY - 1) % 256)
        } else {
            code.push(1)
            code.push(sizeX - 1)
            code.push(sizeY - 1)
        }

        //console.log(gridSize4bytes ? "4 byte size" : "two byte size")
        //console.log(`width: ${sizeX}`)
        //console.log(`height: ${sizeY}`)

        let gridIndex = 0 //read from top left to the right then down a row as this increments
        const getLinearValue = i => content[i % sizeX][Math.floor(i / sizeX)]

        let mode = 0 //0 == wildcard, 1 == 8bit, 2 == 4bit
        let lastMode = 0 //to detect if it was changed during the mode switcher
        let tileQueue = [] //while waiting for a mode switch, store the grid tiles here

        //declared outside of main loop for repeatMode to utilize
        let tilesMatching = 0   //how many tiles after gridIndex match the one ON gridIndex
        let currentValue = 0

        function addQueueToCode() {
            if (!tileQueue.length) return

            console.log((lastMode == 1 ? "EIGHT BIT * " : "FOUR BIT * ") + tileQueue.length + "")
            console.log(tileQueue)

            if (lastMode == 0) return //should never run normally
            const fourBitMode = lastMode == 2

            code.push((fourBitMode ? 0b11000000 : 0b10000000) + tileQueue.length - 1) //add indicator

            if (fourBitMode) { //4bit dump
                for (let i = 0; i < tileQueue.length; i += 2) {
                    code.push((tileQueue[i] << 4) + (tileQueue[i+1] || 0)) //first tile goes in high 4, next tile in low 4
                }
            } else { //8bit dunp
                for (let i = 0; i < tileQueue.length; i++) {
                    code.push(tileQueue[i])
                }
            }

            /*if (code.find(e => e == 256)) {
                console.log ("INTRUDER ALERT! 9 BIT INTEGER IS IN THE BASE!")
                gridIndex = 1000000
                return
            }*/

            tileQueue = []
        }


        function repeatMode() { //dump repeat indicator to code
            addQueueToCode()
            mode = 0
            console.log(`REPEAT: ${getLinearValue(gridIndex)} * ${tilesMatching}`)
            code.push(0b01000000 + tilesMatching - 1)
            code.push(currentValue)
            gridIndex += tilesMatching
        }

        //===============
        //TO DO: add save code dumping, 4BIT LENGTH IS IN TILES NOT BYTES,
        //ALSO TO DO: fix 4bit & 8bit from crashing if at the end of a grid?

        while (gridIndex < sizeX * sizeY) { //main loop to step through the program
            
            currentValue = getLinearValue(gridIndex) 
            if (typeof(currentValue) == "undefined") break //for when matchingtiles == 0 because of undefined

            tilesMatching = 0
            let matchingValue = currentValue //as we check each tile ahead, use this to keep track of if the chain was broken

            let tilesUntilEmpty = 0 //increment this during the check until its an empty tile
            let emptyTileReached = false

            lastMode = mode //to detect if it was changed during the mode switcher

            //get how many tiles match and how many tiles until it encounters empty
            for (let i = gridIndex; matchingValue !== false || !emptyTileReached; i++) {
                const value = getLinearValue(i)
                //console.log(value)
                if (value == 16 || value == undefined) emptyTileReached = true
                if (value != matchingValue) matchingValue = false

                if (!emptyTileReached) tilesUntilEmpty++;
                if (matchingValue !== false) tilesMatching++;
            }

            //cap at 64 matchings
            if (tilesMatching > 64) tilesMatching = 64

            //console.log("matching: "+ tilesMatching)
            //console.log("until empty: " + tilesUntilEmpty)
            
            //all the numbers being compared against were meticulously optimized for compression and wont be explained
            if (mode === 0) { // "wildcard" mode
                if (currentValue == 16) { //if empty
                    if (tilesMatching < 3) {
                        mode = 1 //8BIT MODE
                    } else {
                        repeatMode()
                    }
                } else { //if tile isnt empty
                    if (tilesUntilEmpty < 4) {
                        if (tilesMatching < 3) {
                            mode = 1 //8BIT MODE
                        } else {
                            repeatMode()
                        }
                    } else {
                        if (tilesMatching < 5) {
                            mode = 2 //4BIT MODE
                        } else {
                            repeatMode()
                        }
                    }
                }
            } else if (mode == 1) { //8BIT
                if (tilesMatching >= 4) {
                    repeatMode() //switch from 8BIT to REPEAT
                } else if (currentValue != 16 && tilesUntilEmpty >= 6) {
                    mode = 2 //switch to 4BIT
                }
            } else if (mode == 2) { //4BIT
                if (tilesMatching >= 7) {
                    repeatMode()
                } else if (currentValue == 16) {
                    if (tilesMatching >= 4) {
                        repeatMode()
                    } else {
                        mode = 1 //8BIT MODE
                    }
                }
            }


            if (mode != lastMode && mode) { //if a mode switch ocurred
                addQueueToCode()
                
            }

            //mode switch done

            if (tileQueue.length + tilesMatching > 64 && mode) { //cap the queue size
                tilesMatching = 64 - tileQueue.length
            }

            if (mode == 1) { //if on 8BIT mode
                tileQueue = tileQueue.concat(new Array(tilesMatching).fill(currentValue))
                gridIndex += tilesMatching
            } else if (mode == 2) { //if on 4BIT mode
                tileQueue = tileQueue.concat(new Array(tilesMatching).fill(currentValue))
                gridIndex += tilesMatching
            }

            if (tileQueue.length == 64) { //dump queue to code if 
                addQueueToCode()
                mode = 0
            }

            
        }
        addQueueToCode()

        //compiling done, encode to base64 (btoa is shitty and doesnt work)
        let b64code = ""

        for (let i = 0; i < code.length; i +=3 ) {
            //xx000000 xx001111 xx111122 xx222222 
            let enc1 = code[i] >> 2;
            let enc2 = ((code[i] & 0b11) << 4) | (code[i+1] >> 4);
            let enc3 = ((code[i+1] & 0b1111) << 2) | (code[i+2] >> 6);
            let enc4 = code[i+2] & 0b111111;

            if (code[i+1] === undefined) {
                enc3 = enc4 = 64;
            } else if (code[i+2] === undefined) {
                enc4 = 64;
            }

            b64code += b64keys.charAt(enc1) + b64keys.charAt(enc2) + b64keys.charAt(enc3) + b64keys.charAt(enc4) 
        }
        
        console.log(code)
        console.log(b64code)
        return b64code

    } else if (version == 1) { //the first code format i released
       let code = sizeX + ";" + sizeY + ";"
    
        for (let y = 0; y < sizeY; y++) {
            for (let x = 0; x < sizeX; x++) {
                let char = content[x][y]
                if (char == 0) char = 17 //null bytes are turned into 10001
                code += String.fromCharCode(char)
            }
        }
        code = btoa(code.match(/[\s\S]+[^\u0010]/)[0]) //remove trailing empties, as they will be implied upon import
        return code 
    }
    
}

$("export").addEventListener("click", () =>{
    const code = exportToCode(gridContent, gridSize.x, gridSize.y)
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
    if (out[0]) { //its not the error 
        output.value = `Program stopped on ${out[1].x},${out[1].y}\n${out[2]}`
    } else {
        output.value = out[2]
    }
})

function stepInterpreter() {
    const out = stepExec(gridContent, $("input").value, $("increment").value)
    if (out[0] == 0) { //its the error 
        output.value = out[1]
    } else if (out[0] == 1) {
        output.value = `Current position: ${out[1].x},${out[1].y}\n${out[2]}`
        renderGrid() //clear last green tile
        renderTile(out[1].x,out[1].y,gridContent[out[1].x][out[1].y],true)
    } else {
        output.value = `Program stopped on ${out[1].x},${out[1].y}\n${out[2]}`
        renderGrid() //clear last green tile
    }
}

$("step").addEventListener("click", () =>{
    stepInterpreter()
})

$("reset").addEventListener("click", () =>{
    const out = resetInterpreter()
    output.value = ""
    renderGrid() //clear last green tile
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
const urlCode = new URLSearchParams(window.location.search).get("c")
renderGrid() //this is just in case it didn't load with save codes/ save code failed to load

if (urlCode) {
    loadCodeToGrid(urlCode)
}