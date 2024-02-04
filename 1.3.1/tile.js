/*

useful regex
/  |░░|▀░|░▀|▀▀|▄░|█░|▄▀|█▀|░▄|▀▄|░█|▀█|▄▄|█▄|▄█|██/gm

rotations:
0 - north
1 - east
2 - south
3 - west

*/

function yx_to_xy(code) { //human readable arrays converted to easier for programming arrays
    let formatted = []
    //iterate over rows
    for (let y = 0; y < code.length; y++) {
        //iterate over columns
        for (let x = 0; x < code[y].length; x++) {
            //create new column if not yet real
            if (typeof(formatted[x]) == "undefined") {
                formatted[x] = []
            }
            //add out thing
            formatted[x][y] = code[y][x]
        }
    }
    return formatted
}

function execute(code, input) {
    if (!input) { input = "" }
    
    //-----------------get start tiles---------------------------
    
    let startTiles = []
    for (let x = 0; x < code.length; x++) {
        for (let y = 0; y < code[x].length; y++) {
            if (code[x][y] == "██") {
                startTiles.push([x, y])
            }
        }
    }

    //stop if no start
    if (!startTiles.length) {
        return "Error: you put no start tiles!"
    }
    
    //-----------------define some functions---------------------
    /*
    valueToBin(tile)
    getTile(coords)
    rotate(rotation, direction)
    tileInDir(p, r, d)
    getSurrounding(coords, rotation)
    defaultMove(includeSouth)
    */

    
    //gets binary from tile
    function valueToBin(tile) {
        let value = ""
        switch (tile) {
            //ti tuoba od annog uoy era tahw dna?
            case "░░":
                value ="0000"
                break
            case "▀░":
                value ="1000"
                break
            case "░▀":
                value ="0100"
                break
            case "▀▀":
                value ="1100"
                break
            case "▄░":
                value ="0010"
                break
            case "█░":
                value ="1010"
                break
            case "▄▀":
                value ="0110"
                break
            case "█▀":
                value ="1110"
                break
            case "░▄":
                value ="0001"
                break
            case "▀▄":
                value ="1001"
                break
            case "░█":
                value ="0101"
                break
            case "▀█":
                value ="1101"
                break
            case "▄▄":
                value ="0011"
                break
            case "█▄":
                value ="1011"
                break
            case "▄█":
                value ="0111"
                break
            case "██":
                value = "1111"
                break
        }
        return value
    }
    
    function getTile(coords) { //get the tile's content, safe with out of bounds tiles
        if (code[coords[0]]) {
            if (code[coords[0]][coords[1]]) {
                return code[coords[0]][coords[1]]
            }
        }
        return "  "
    }
    
    //rotate clockwise direction
    function rotate(rotation, direction) {
        return (rotation + direction) % 4
    }

    //which direction offset from a tile for rotation
    const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]]

    //return the tile adjacent to the position, with global rotation and offset rotation
    function tileInDir(p, r, d) { //pos, rot, dir
        let newrot = rotate(r, d)
        return [
            p[0] + offsets[newrot][0],
            p[1] + offsets[newrot][1]
        ]
    }

    //return an array of every surrounding tile's positions, relative to rotation
    function getSurrounding(coords, rotation) {
        let tiles = []
        for (let i = 0; i < 4; i++) {
            tiles.push(tileInDir(coords, rotation, i))
        }
        return tiles
    }

    function defaultMove(includeSouth) {
        let surrCoords = getSurrounding(pcPos, pcRot) //get surr
        let realSurrValues = [] //for places we can go
        
        for (let i = 0; i < surrCoords.length; i++) { //loop tiles
            
            if (getTile(surrCoords[i]) != "  ") { //if it's not null
                if (i != 2) { //if we ain't south
                    realSurrValues.push([surrCoords[i], i])
                } else if (includeSouth) { //if it IS 2 and we include south
                    realSurrValues.push([surrCoords[i], i])
                }
            }
        }
        //we have an array of different places we can move
        if (realSurrValues.length != 1) {
            exit = "Incorrect quantity of paths to travel (" + realSurrValues.length + ") at tile (" + pcPos + ")"
            return
        }
        //only one
        pcPos = realSurrValues[0][0]
        pcRot = rotate(pcRot, realSurrValues[0][1])
    }
    
//-------------------set main loop vars---------------------
    let pcPos = startTiles[0]
    let pcRot = 0
    let stack = []
    let mem = []
    let out = ""
    let exit = false //when true, exit program
    let count = 0
    
    defaultMove(true) //first move

//-------------------------main loop-----------------------
    //*deep breath* here we go
    do {
        let stack_3rd = (stack[stack.length-3] || 0)
        let stack_2nd = (stack[stack.length-2] || 0)
        let stack_top = (stack[stack.length-1] || 0)
        
        switch (getTile(pcPos)) {
            case "  ": //empty
                exit = true
                break
            case "░░": //nop
                defaultMove()
                break
            case "▀░": //push
                //ah shit. here we go again.
                let LR = [ //left right
                    tileInDir(pcPos, pcRot, 3), //left
                    tileInDir(pcPos, pcRot, 1) //right
                ]
                let v = [ //values
                    getTile(tileInDir(LR[0], pcRot, 3)),
                    getTile(LR[0]), 
                    getTile(LR[1]),
                    getTile(tileInDir(LR[1], pcRot, 1))
                ]

                //reverse to make higher btis left and lower bits right
                if (pcRot == 2 || pcRot == 3) { 
                    v.reverse()
                } 

                let bin = "" //just used as the number

                function b(n1, n2) { //bin, num1 num2, converts 
                    if (n2) {
                        bin = parseInt(valueToBin(v[n1])+valueToBin(v[n2]), 2)
                    } else {
                        bin = parseInt(valueToBin(v[n1]), 2)
                    }
                }
                //probably a way better way to do this. but i dont care enough.

                const em = "  " //EMpty

                //this could look a whole lot better but who cares.
                if (v[0] != em && v[1] != em && v[2] == em) { //11 0X
                    b(0, 1)
                } else if (v[0] == em && v[1] != em && v[2] != em && v[3] == em) { //01 10
                    b(1, 2)
                } else if (v[1] == em && v[2] != em && v[3] != em) { //X0 11
                    b(2, 3)
                } else if (v[0] == em && v[1] != em && v[2] == em) { //01 0X
                    b(1) 
                } else if (v[1] == em && v[2] != em && v[3] == em) { //X0 10
                    b(2)
                } else {
                    bin = 0
                }
                //and funally we can push
                stack.push(bin)
                //move forward one
                pcPos = tileInDir(pcPos, pcRot, 0)
                break
            case "░▀": //read
                let val = (mem[stack_2nd * 256 + stack_top] || 0) //push mem address of last stack val or 0
                stack.pop()
                stack.pop()
                stack.push(val)
                defaultMove()
                break
            case "▀▀": //output
                out += String.fromCharCode(stack_top)
                stack.pop()
                defaultMove()
                break
            case "▄░": //subtract
                let diff = (stack_2nd - stack_top + 256) % 256
                stack.pop()
                stack.pop()
                stack.push(diff)
                defaultMove()
                break
            case "█░": //add
                let sum = (stack_2nd + stack_top) % 256
                stack.pop()
                stack.pop()
                stack.push(sum)
                defaultMove()
                break
            case "▄▀": //multiply
                let prod = (stack_2nd * stack_top) % 256
                stack.pop()
                stack.pop()
                stack.push(prod)
                defaultMove()
                break
            case "█▀": //divide
                if (stack_top == 0) {
                    exit = "Error: cannot divide by 0"
                } else {
                    let quot = Math.floor(stack_2nd / stack_top) % 256
                    let rem = (stack_2nd % stack_top) % 256
                    stack.pop()
                    stack.pop()
                    stack.push(quot)
                    stack.push(rem) //if only
                    defaultMove()
                }
                
                break
            case "░▄": //write
                mem[stack_2nd * 256 + stack_top] = stack_3rd
                defaultMove()
                break
            case "▀▄": //random
                let surr = getSurrounding(pcPos, pcRot) //surrounding
                let valid = [] //for valid tiles we can get to
                for (let tile = 0; tile < 4; tile++) {
                    if (tile != 2 && getTile(surr[tile]) != "  ") {
                        valid.push(tile)
                    }
                }
                
                if (valid.length == 0) { //who puts a random as an execution stop dawg what the
                    exit = "Incorrect quantity of paths to travel (0) at tile (" + pcPos + ")"
                } else { //if you're civil
                    pcRot = rotate(pcRot, valid[Math.floor(Math.random() * valid.length)]) //randomize 
                    pcPos = tileInDir(pcPos, pcRot, 0)
                }
                break
            case "░█": //input
                stack.push((input.charCodeAt(stack_2nd * 256 + stack_top) % 256) || 0)
                defaultMove()
                break
            case "▀█": //equals
                if (stack_2nd == stack_top) {
                    pcRot = rotate(pcRot, 1)
                } else {
                    pcRot = rotate(pcRot, 3)
                }
                pcPos = tileInDir(pcPos, pcRot, 0)
                break
            case "▄▄": //jump
                
                pcPos = tileInDir(tileInDir(pcPos, pcRot, 0), pcRot, 0)
                break
            case "█▄": //less
                if (stack_2nd < stack_top) {
                    pcRot = rotate(pcRot, 1)
                } else {
                    pcRot = rotate(pcRot, 3)
                }
                pcPos = tileInDir(pcPos, pcRot, 0)
                break
            case "▄█": //greater
                if (stack_2nd > stack_top) {
                    pcRot = rotate(pcRot, 1)
                } else {
                    pcRot = rotate(pcRot, 3)
                }
                pcPos = tileInDir(pcPos, pcRot, 0)
                break
            case "██": //start
                console.log("Command: "+count+"\nPosition: "+pcPos.join(", ")+"\nStack: ["+stack.join(", ")+"]\nMemory: ")
                console.log(mem)
                defaultMove()
                break
        }
        count++ //keep track of how many commands have been executed
    } while (!exit)
    return "Program stopped on " + pcPos + "\n" + out
} 


/*
console.log(execute(yx_to_xy([
    ["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "░░", "░░", "░░"],
    ["  ", "▄░", "▄▀", "▄▀", "▄█", "▄▀", "░█", "▄░", "▄░", "▄▀", "▄▀", "▄▀", "▄▀", "░▀", "  ", "  ", "▄▄", "  ", "░░"],
    ["  ", "░▄", "░▀", "▀▀", "▄░", "██", "▄█", "░░", "▀▀", "██", "▀▀", "▀▀", "░█", "▀░", "  ", "  ", "  ", "  ", "█░"],
    ["██", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▀░", "▄▄", "  ", "▀▀", "▀░", "▀█"]
    
])))
*/