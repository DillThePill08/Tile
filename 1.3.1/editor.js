var gridSize = [] //size de griddy
var tileSelect = [] //current subtile configuration
const binToCmd = {
    "": "  ",
    "0000": "░░",
    "0001": "░▄",
    "0010": "▄░",
    "0011": "▄▄",
    "0100": "░▀",
    "0101": "░█",
    "0110": "▄▀",
    "0111": "▄█",
    "1000": "▀░",
    "1001": "▀▄",
    "1010": "█░",
    "1011": "█▄",
    "1100": "▀▀",
    "1101": "▀█",
    "1110": "█▀",
    "1111": "██"
}
//==============================================================
function generateGrid(width, height) { //clear the grid with a new size
    gridSize = [width, height]
    
    const grid = document.getElementById("grid")
    grid.innerHTML = "" //clear children
    
    for (let y = 0; y < height; y++) {
        //generate new row
        const newRow = document.createElement("tr")
        newRow.id = "row" + y
        grid.appendChild(newRow)

        for (let x = 0; x < width; x++) {
            const newTile = document.createElement("td")
            newTile.classList.add("tile", "_")
            newTile.id = "x" + x + "y" + y
            newTile.onclick = function() { tileClick(this) }
            newRow.appendChild(newTile)
        }
    }
}
//==============================================================
function tileClick(tile) { //add the subtile config to grid tile
    tile.classList.replace(tile.classList[1], "_" + tileSelect.join(""))
}
//==============================================================
function empty() { //clear tile editor
    tileSelect = []
    for (i = 0; i < 4; i++) {
        const subtile = document.getElementById(i)
        subtile.style.borderColor = "#FFFFFF"
        subtile.style.backgroundColor = "#FFFFFF"
    }
}
//==============================================================
function subtileClick(subtile) {
    if (!tileSelect.length)  { //if we're clear then make it unclera
        for (i = 0; i < 4; i++) {
            document.getElementById(i).style.border = "1px solid"
            tileSelect[i] = 0
        }
    }
    //revese it
    let subVal = tileSelect[subtile.id]
    subtile.style.backgroundColor = subVal ? "#FFFFFF" : "#000000"
    tileSelect[subtile.id] = subVal ? 0 : 1
}
//==============================================================
function gridToMatrix() { //convert the grid's contents to an array
    let grid = []
    for (let x = 0; x < gridSize[0]; x++) {
        grid[x] = [] //create new row
        for (let y = 0; y < gridSize[1]; y++) {
            const element = document.getElementById("x" + x + "y" + y)
            //rebind class to value
            grid[x][y] = binToCmd[element.classList[1].substring(1)]
        }
    }
    return grid
}

function loadMatrix(matrix) {
    generateGrid(matrix.length, matrix[0].length)
    for (let x = 0; x < matrix.length; x++) { //iterate over rows
        for (let y = 0; y < matrix[x].length; y++) { //iterate over rows
            let tile = document.getElementById("x"+x+"y"+y)
            
            //get the values, get the index of the value and match it to the key's index
            const bin = Object.keys(binToCmd)[Object.values(binToCmd).indexOf(matrix[x][y])]
            
            tile.classList.replace(tile.classList[1], "_" + (bin?bin:"")) //add the
        }
    }
}
//============================================================
function resize(mode) { //resize array (m1 = bottom right m2 = top left)
    //format size
    let size = document.getElementById("resizeBox").value.split(',', 2)
    
    let grid = gridToMatrix() //get the griddy array

    for (let i = 0; i < 2; i++) { //do this to both sizes
        
        const s = size[i] //the size
        let val = parseInt(s) //the size in question
        if (/^(\+|-)\d+/.test(s)) { // add or subtract size
            let rel = parseInt(s.match(/\d+/)[0]) //relative. set to the amount we change size
            if (/^-/.test(s)) {
                rel *= -1 //negative relative
            }
            val = gridSize[i] + rel //change the size finally
        }
        if (val < 1) { val = 1 } 
        size[i] = val
    }
    //i fucking hate this section it's so repetetive but i'm too fucking lazy to try to fix it so whoever reads this will have to deal with it
    //fuck you bitch
    
    //repetetive code calls for functions
    function modifyGrid(meth1, meth2, param, xMode) {
        
        let method = meth1
        if (mode) { //if it's top left
            method = meth2
        }
        if (xMode) {//if we're working with x
            while (grid.length != size[0]) { //repeat until right size
                grid[method](param)
            }
        } else { //if we're working with y
            for (let i = 0; i < grid.length; i++) {//iterate over columns
                while (grid[i].length != size[1]) { //repeat until right size
                    grid[i][method](param)
                }
            }
        }
        
    }
    // Y
    if (size[1] < grid[0].length) { //decrease rows
        modifyGrid("pop", "shift", null, false)
    } else { //increase columns
        modifyGrid("push", "unshift", Array(size[0]).fill("  "), false)
    }

    // X
    if (size[0] < grid.length) { //decrease amount of columns
        modifyGrid("pop", "shift", null, true)
    } else { //increase columns
        modifyGrid("push", "unshift", Array(size[1]).fill("  "), true)
    }
    loadMatrix(grid)
}
//=================================================================
function compile() { //compile grid for interpreter
    const grid = gridToMatrix()
    const input = document.getElementById("in").value
    document.getElementById("out").value = execute(grid, input)
}
//==============================================================
function encode() { //export a code
    let encode = gridSize[0] + ";"
        + gridSize[1] + ";" //initialize with sizes
    for (let y = 0; y < gridSize[1]; y++) {
        for (let x = 0; x < gridSize[0]; x++) {
            const element = document.getElementById("x" + x + "y" + y)
            
            let val = element.classList[1].substring(1)
            val = (!val ? "10000" : val == "0000" ? "10001" : val)
            encode += String.fromCharCode(parseInt(
                val, 2)) 
        }
    }
    document.getElementById("out").value = btoa(encode)

    //set URL with parameters
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set("code", btoa(encode))
    var newRelativePathQuery = window.location.pathname + '?' +  searchParams.toString()
    history.pushState(null, '', newRelativePathQuery)
    //[width];[height];[tile data]
}
//==============================================================
function decode() { //import a code
    const input = atob(document.getElementById('in').value)
    
    const size = [parseInt(input.match(/^.[^;]*/)[0]),
                 parseInt(input.match(/(?<=;).[^;]*/)[0])]
    generateGrid(size[0], size[1])

    document.getElementById("resizeBox").value = size[0] + "," + size[1]
    
    const data = input.match(/(?<=;).[^;]*$/)[0]
    for (let i = 0; i < data.length; i++) {
        //set binary data of tile
        let bindata = data.charCodeAt(i).toString(2)
        while (bindata.length < 4) {
            bindata = "0" + bindata
        }
        bindata = (bindata == "10000" ? "" : bindata == "10001" ? "0000" : bindata)
        
        const formuler = "x" + i % gridSize[0] + "y" + Math.trunc(i / gridSize[0])
        const tile = document.getElementById(formuler)
        tile.classList.replace(tile.classList[1], "_" + bindata)
    }
}
//==============================================================
document.addEventListener('DOMContentLoaded', function() { //main
    const code = new URLSearchParams(window.location.search).get("code")
    generateGrid(5, 5)
    if (code) {
        const inp = document.getElementById('in')
        inp.value = code
        try {decode(code)}
        finally {inp.value = ""}
    }
    
    //generate subtiles
    for (i = 0; i < 4; i++) {
        const newSub = document.createElement("td")
        newSub.id = i
        newSub.classList.add("subtile")
        newSub.onclick = function() { subtileClick(this) }
        
        newSub.style.borderColor = "#FFFFFF"
        newSub.style.backgroundColor = "#FFFFFF"

        document.getElementById(i < 2 ? "str0" : "str1").appendChild(newSub)
    }
})
//------------------------------------------------------------
window.onbeforeunload = function(e) {
  return "Do you want to exit this page?";
};