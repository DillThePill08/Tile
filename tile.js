//to anyone reading my code i apologize heavily
let stepping = false //to know when stepping the interpreter should reset everything

let ggrid
let gsize
let exit = false //exit program if this is every set to true
let exitmsg = ""
let lastStepJump = false //last step was jump, force south movement
let count = 0 //how many commands have been executed during runtime

let input = ""
let out = ""
let mem = new Array(Math.pow(2, 16)).fill(0)
let stack = []
let pc = {rot:0}

function getTile(x, y) { //get tile of position, return empty if position is OOB
    return (ggrid[x] ?
        typeof ggrid[x][y] !== "undefined" ?
            ggrid[x][y]
        : 16
    : 16)
}

const rotStep = [ //which direction is one step in front with the given rotation
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
]

const rotNames = [
    "north",
    "east",
    "south",
    "west"
]

function getAdjacent(x, y, rotation = 0) { //rot: 0-north, 1-east, 2-south, 3-west
    let adjacent = new Array(4) //array of adjacent tiles
    for (let i = 0; i < 4; i++) {
        const step = rotStep[(i+rotation)%4] //relative position based on rotation
        adjacent[i] = getTile(x+step[0], y+step[1]) //index our tile
    }
    return adjacent
}

//step once forward, ignoreLogic moves forward regardless of path
const step = (ignoreLogic = false, useSouth = lastStepJump) =>{ 
    if (ignoreLogic) { //just go forward idc what the path is
        pc.pos.x += rotStep[pc.rot][0]
        pc.pos.y += rotStep[pc.rot][1]
    } else { //move with respect to paths
        let adj = getAdjacent(pc.pos.x, pc.pos.y, pc.rot)
        let validTiles = [] //tiles we can move to (non-empty tiles)
        
        if (!useSouth) { //assume we dont go south
            adj[2] = 16 //ignore tile behind pc unless specified
        }

        for (i in adj) { //push all non-empty indexes of adjacent tiles to validTiles
            if (adj[i] != 16) validTiles.push(i)
        }
        if (validTiles.length != 1) {exit = true; return} //if there isnt one spot to go then quit
        pc.rot = (pc.rot + parseInt(validTiles[0])) % 4 //set rotation to the only available direction, relative to pcrot
        
        step(true) //illogical step has been made logical
    }
    lastStepJump = false //disable laststepjump in case it was set
    
} 

//get value in top stack position. accomodate for undefined values.
const getStack = pos => (pos < stack.length ? stack[stack.length-1-pos] : 0)
    
//this one returns 16 bit memory location of 0x[s1][s2]
const get16bit = () => parseInt(getStack(1).toString(2).padStart("0", 4)+getStack(0).toString(2).padStart("0", 4), 2)

const calc = result => { //for add, sub, mul. they all work the same with different symbols.
    result = (result + 256) % 256
    stack.pop()
    stack.pop()
    stack.push(result)
    step()
}

const compare = val => { //move pc right or left if false or true
    pc.rot = (pc.rot + (val ? 1 : 3)) % 4 //3 is fancy for -1 with underflow
    step(true)
}

function executeTile() {
    switch (getTile(pc.pos.x, pc.pos.y)) {
        case 0: //no-op
            step()
            break
        case 1: //write
            mem[get16bit()] = getStack(2)
            step()
            break
        case 2: //subtract
            calc(getStack(1) - getStack(0))
            break
        case 3: //jump
            step(true)
            step(true)
            lastStepJump = true //this is so you can turn 180
            break
        case 4: //read
            let value = mem[get16bit()]
            stack.pop()
            stack.pop()
            stack.push(value)
            step()
            break
        case 5: //input
            stack.push((input.charCodeAt(get16bit()) % 256) || 0)
            step()
            break
        case 6: //multiply
            calc(getStack(1) * getStack(0))
            break
        case 7: //greater
            compare(getStack(1) > getStack(0))
            break
        case 8: //push
            //get relative side tiles
            const getSidePos = relative => { //get tile one step in relative direction
                const pos = rotStep[(pc.rot + relative) % 4]
                return [pc.pos.x + pos[0], pc.pos.y + pos[1]]
            }
            const left = getSidePos(3)
            const right = getSidePos(1)
            
            let data = [ //possible data positions
                getAdjacent(...left, pc.rot)[3],
                getTile(...left),
                getTile(...right),
                getAdjacent(...right, pc.rot)[1]
            ]
            //reverse if pc is left or down, put significant bits to the left
            if ([2, 3].indexOf(pc.rot) > -1) {
                data.reverse()
            }
            
            //0: tile == empty
            //1: tile != empty
            //2: does not matter
            const configArray = [
                //eight bits
                [1, 1, 0, 2],
                [2, 1, 1, 2],
                [2, 0, 1, 1],
                //four bits
                [0, 1, 0, 2],
                [2, 0, 1, 0]
            ]
            
            val = 0 //default push value 
            
            for (config of configArray) {
                match = true
                for (i = 0; i < 4; i++) {
                    if ((config[i] == 0 && data[i] != 16) || (config[i] == 1 && data[i] == 16)) {
                        match = false
                        break
                    }
                }
                //if it doesn't match then skip to next config
                if (!match) continue
                
                let bin = ""
                for (i = 0; i < 4; i++) {
                    if (config[i] == 1) bin += data[i].toString(2).padStart(4, "0")
                }
                val = parseInt(bin, 2)
                break
            } 
            stack.push(val)
            step(true)
            break
        case 9: //random
            let adj = getAdjacent(pc.pos.x, pc.pos.y, pc.rot)
            adj[2] = 16 //ignore tile behind pc
            
            let validTiles = [] //tiles we can move to (non-empty tiles)
            
            for (i in adj) { //push all non-empty indexes of adjacent tiles to validTiles
                if (adj[i] != 16) validTiles.push(parseInt(i))
            } //yes i recycled this code from the step function
            
            if (!validTiles.length) { //no place to go
                exit = true //exit
            } else {
                //add random index from validTiles to rotation
                pc.rot = (pc.rot + validTiles[Math.floor(Math.random()*validTiles.length)]) % 4
                step(true) //we already evaluated the logic
            }
            break
        case 10: //add
            calc(getStack(1) + getStack(0))
            break
        case 11: //less
            compare(getStack(1) < getStack(0))
            break
        case 12: //output
            out += String.fromCharCode(getStack(0))
            stack.pop()
            step()
            break
        case 13: //equals
            compare(getStack(1) == getStack(0))
            break
        case 14: //divide
            const s1 = getStack(0)
            const s2 = getStack(1)
            if (!s1) { //division by zero error
                exit = true
            } else {
                stack.pop()
                stack.pop()
                stack.push(Math.trunc(s2 / s1))
                stack.push(s2 % s1)
                step()
            }
            break
        case 15: //debug
            console.log(`Instruction: ${count}\nPosition: ${pc.pos.x}, ${pc.pos.y}\nDirection:${rotNames[pc.rot]}\nStack: [${stack.join(",")}]\nMemory:`)
            console.log(mem)
            step()
            break
        default: //empty or anything else that shouldnt be there
            exit = true
            break
    }
    count++
}

//-----------------------------------------------------------------
function init() { //initialize interpreter
    pc = {rot:0} //pos will be defined when finding the initial starting pos, rot will be initialized
    
    //find start tile
    for (let x = 0; x < gsize.x; x++) {
        for (let y = 0; y < gsize.y; y++) {
            if (getTile(x, y) == 15) { //if position is a start tile
                pc.pos = {x:x, y:y}
                break
            }
        }
        if (typeof pc.pos != "undefined") {
            break //break if we found the start tile
        }
    }
    if (typeof pc.pos == "undefined") { //if there are no start tiles
        exit = true
        exitmsg = "Error: there are no start tiles."
        return
    }

    exit = false
    lastStepJump = false

    step(false, true) //first move from start tile

    //program variables
    out = ""
    mem = new Array(Math.pow(2, 16)).fill(0)
    stack = []
    count = 0
}
//---------------------------------------------------------------------------
function execute(newGrid, newInput) {
    ggrid = newGrid
    gsize = {x:ggrid.length, y:ggrid[0].length} //grid width and height
    stepping = false
    input = newInput
    init()
    if (exit) { //init failed
        return [true, pc.pos,""]
    }

    while (!exit) {
        executeTile()
    }
    return [true, pc.pos, out]
}

function stepExec(newGrid, newInput) { //stepping the interpreter
    ggrid = newGrid
    gsize = {x:ggrid.length, y:ggrid[0].length} //grid width and height
    input = newInput

    if (!stepping) {
        init()
        if (exit) { //init failed
            return [2, pc.pos,""]
        }
        stepping = true
        return [1,pc.pos, out] //1 = currently stepping
    }
    executeTile()
    if (exit) {
        stepping = false
        return [2,pc.pos, out] //2 = done
    }
    return [1,pc.pos, out]
}

function resetInterpreter() {
    stepping = false
    return [pc.pos, out] //2 = done
}

/*
const string = "Hello, World!".split("").reverse().join("")
let arr = []
for (let i = 0; i < string.length; i++) {
    arr.push([string[i], ...string.charCodeAt(i).toString(2).padStart(8, "0").match(/.{4}/g)])
}
console.log(arr)
*/