let board = document.getElementById("Map")
let boxcursor = 0
let doPath = false
let forceStop = false

let start = null
let end = null

var myMap
// initialize the map
function init(board_height, board_width){
    doPath = false
    board.innerHTML = ""
    myMap = new Array(board_height)

    for(let i=0; i<board_height; i++){
        myMap[i] = []
        for(let j=0; j<board_width; j++){
            myMap[i][j] = new square(i, j)
            board.appendChild(myMap[i][j].box)
        }
    }
    board.style.gridTemplateColumns = "repeat(" + board_width + ", 1fr)"
}

//check mouse down
mouseDown = false;
board.onmousedown = (e) => {
    mouseDown = true; 
    e.preventDefault();
};
board.onmouseup = (e) => {
    mouseDown = false; 
    e.preventDefault();
};
board.onmouseleave = (e) => {
    mouseDown = false; 
    e.preventDefault();
};

// class of square
class square{
    constructor(x, y){
        this.box = document.createElement("div")
        this.box.setAttribute("id","square")
        this.box.addEventListener("mousedown", () => {
            mouseDown = true; 
            this.changeType()
        })
        this.box.addEventListener("mouseup", () => {
            mouseDown = false; 
            this.changeType();
        })
        this.box.addEventListener("mouseenter", () => {
            this.changeType()
        })
        this.box.addEventListener("mouseleave", () => {
            this.changeType()
            this.datatemp = this.data
            this.draw()
        })
        this.datatemp = 0
        this.data = 0
        this.draw()
        this.x = x
        this.y = y
        this.visited = false
        this.prev = null
        this.step = 0
        this.mark = false
    }
    draw(){
        let opacity = 1
        if(this.datatemp != this.data){
            opacity = 0.5
        }
        this.box.outline = "none"
        switch(this.datatemp){
            case 0: // unvisited path
                this.box.style.backgroundColor = "rgba(255, 255 ,255," + opacity + ")"
                break
            case 1: // visited path
                this.box.style.backgroundColor = "rgba(200, 247, 197," + opacity + ")"
                break
            case 2: // wall 
                this.box.style.backgroundColor = "rgba(119, 136, 153," + opacity + ")"
                break
            case 3: // start
                this.box.style.backgroundColor = "rgba(30, 176, 224," + opacity + ")"
                if(opacity == 1){
                    if(start != null && start != this){
                        start.instantChange(0)
                    }
                    start = this
                }
                this.box.outline = "1px solid black"
                break
            case 4: // end
                this.box.style.backgroundColor = "rgba(255, 76, 48," + opacity + ")"
                if(opacity == 1){
                    if(end != null && end != this){
                        end.instantChange(0)
                    }
                    end = this
                }
                break
            case 5: // path answer  
                this.box.style.backgroundColor = "rgba(0, 230, 64," + opacity + ")"
                break
            default:
                this.box.style.backgroundColor = "white"
                break
        }
    }

    instantChange(color){
        this.data = color
        this.datatemp = color
        this.draw()
    }

    forceChange(color){
        this.data = color
        this.datatemp = color
        this.draw()
        this.box.animate(
            [{transform: "scale(0.7)"},
            {transform: "scale(1.2)"},
            {transform: "scale(1)"}],
            {
                duration: 200,
                iterations: 1,
                direction: 'alternate'
            }
        )
    }

    changeType(){
        this.datatemp = boxcursor
        if(mouseDown){
            if(this == start) start = null
            if(this == end) end = null
            this.data = this.datatemp
        }
        this.draw()
        if(mouseDown){
            this.box.animate(
                [{transform: "scale(0.7)"},
                {transform: "scale(1.2)"},
                {transform: "scale(1)"}],
                {
                    duration: 200,
                    iterations: 1,
                    direction: 'alternate'
                }
            )
            if(doPath == true){
                if(start == null || end == null){
                    setUnvisit(0)
                    doPath = false
                }
                else{
                    forceStop = true;
                    if(found == true){
                        aStar(0)
                    }  
                }
                
            }
        }
    }
}

init(35, 69)

// edit painter
function set(thing){
    let path = document.getElementById("path")
    let wall = document.getElementById("wall")
    let start = document.getElementById("start")
    let end = document.getElementById("end")
    let find = document.getElementById("astr")
    
    let cur = null
    switch(thing){
        case "Path":
            boxcursor = 0
            cur = path
            break
        case "Wall":
            boxcursor = 2
            cur = wall
            break
        case "Start":
            boxcursor = 3
            cur = start
            break
        case "End":
            boxcursor = 4
            cur = end
            break
        case "Clear":
            clearMap()
            cur = null
            break
        case "Find":
            if(end == null || start == null){
                break
            }
            if(bardown == true){
                gobar()
            }
            console.log("SEARCJJ")
            aStar(20)
            cur = find
            break
        case "Maze":
            forceStop = true
            doPath = false
            found = false
            start = null
            end = null
            for(let i=0; i<myMap.length; i++){
                for(let j=0; j<myMap[i].length; j++){
                    if(j%2 == 1 && i%2 == 1){
                        myMap[i][j].instantChange(0)
                        myMap[i][j].mark = false
                    }
                    else myMap[i][j].instantChange(2)
                }
            }
            cur = null
            makemaze(1,1)
            myMap[1][1].forceChange(3)
            myMap[33][67].forceChange(4)
            break
        default:
            break
    }
    if(cur != find && cur != null){
        path.classList.remove("clicked")
        wall.classList.remove("clicked")
        start.classList.remove("clicked")
        end.classList.remove("clicked")
    }
    if(cur != null){
        cur.classList.add("clicked")
    }
    if(doPath == false){
        find.classList.remove("clicked")
    }
    
}


async function clearMap(){
    console.log("Clear")
    doPath = false;
    forceStop = true;
    for(let i=0; i<myMap.length; i++){
        for(let j=0; j<myMap[i].length; j++){
            deleteMap(i, j)
        }
    }
    start = null
    end = null
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function deleteMap(x, y){
    await delay(getRandomInt(1000))
    myMap[x][y].forceChange(0);
}

function setUnvisit(ms){
    for(let i=0; i<myMap.length; i++){
        for(let j=0; j<myMap[i].length; j++){
            myMap[i][j].visited = false;
            if(myMap[i][j].data == 5 || myMap[i][j].data == 1){
                if(ms == 0) myMap[i][j].instantChange(0)
                else myMap[i][j].forceChange(0)
                myMap[i][j].step = 0
            }
        }
    }
}

// algortithm
function abs(num){
    if(num < 0) return num * -1
    return num
}

class priority_queue{
    constructor(){
        this.size = 0
        this.arr = []
    }

    valid(block){
        if((block.data == 0 || block.data == 3 || block.data == 4) && block.visited == false)
            return true
        else return false
    }

    shiftDown(idx){
        let min = idx
        let left = idx*2 + 1
        let right = idx*2 + 2
        if(left < this.size && this.cmpf(left, min)){
            min = left
        }
        if(right < this.size && this.cmpf(right, min)){
            min = right
        }
        if(min != idx){
            this.swap(min, idx)
            this.shiftDown(min)
        }
    }

    shiftUp(idx){
        if(idx == 0){
            return
        }
        let parent = Math.floor((idx - 1) / 2)
        if(this.cmpf(idx, parent)){
            this.swap(idx, parent)
            this.shiftUp(parent)
        }
    }

    push(block, blockprev){
        if(!this.valid(block)){
            if(block.data == 0 && block.step > blockprev.step + 1){
                block.step = blockprev.step + 1
                block.prev = blockprev
                for(let i=0; i<this.size; i++){
                    if(this.arr[i] == block){
                        this.shiftUp(i);
                        return;
                    }
                }
            }
            return
        }
        block.visited = true
        if(blockprev != null) block.step = blockprev.step + 1
        else block.step = 0
        this.arr.push(block)
        this.size++
        this.shiftUp(this.size-1)
        block.prev = blockprev
    }

    pop(){
        let retval = this.arr[0]
        this.swap(0, this.size - 1)
        this.size--
        this.arr.pop()
        this.shiftDown(0)
        return retval
    }

    isEmpty(){
        if(this.size == 0)
            return true
        else return false
    }

    swap(idx1, idx2){
        let temp = this.arr[idx1]
        this.arr[idx1] = this.arr[idx2]
        this.arr[idx2] = temp
    }

    cmpf(idx1, idx2){
        if(this.calculateHeuristic(idx1) <= this.calculateHeuristic(idx2))
            return true
        return false
    }

    calculateHeuristic(idx){
        let block = this.arr[idx]
        return abs(block.x - end.x) + abs(block.y - end.y) + block.step
    }
}

function delay(time){
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, time);
    })
}

function bfs(){
    
}

async function aStar(ms){
    forceStop = false
    if(end == null || start == null) return
    doPath = true;
    let Queue = new priority_queue()
    setUnvisit(ms)
    Queue.push(start, null)   
    found = false

    while(Queue.isEmpty() == false && forceStop == false){
        let cur = Queue.pop()
        if(cur.data == 1) continue
        if(cur.data == 0){
            if(ms != 0){
                await delay(ms)
                cur.forceChange(1)
            }
            else cur.instantChange(1)
        }
        if(cur.x == end.x && cur.y == end.y){
            found = true
            break;
        }
        else{
            if(cur.x > 0){
                Queue.push(myMap[cur.x - 1][cur.y], cur)
            } 
            if(cur.x < myMap.length - 1){
                Queue.push(myMap[cur.x + 1][cur.y], cur)
            }
            if(cur.y > 0){
                Queue.push(myMap[cur.x][cur.y - 1], cur)
            }
            if(cur.y < myMap[0].length - 1){
                Queue.push(myMap[cur.x][cur.y + 1], cur)
            }
        }
    }
    console.log("Done, " + Queue.size)
    if(forceStop == true) {
        forceStop = false;
        aStar(0);
    }
    else if(!found){
        console.log("Not Found")
        found = true
    }
    else{
        console.log("Found")
        drawPath(end, ms)
    }

}

async function drawPath(block, ms){
    if(block == start){

    }
    else if(block == end){
        drawPath(block.prev, ms)
    }
    else{
        if(ms != 0){
            await drawPath(block.prev, ms)
            block.forceChange(5)
        }
        else{
            drawPath(block.prev, ms)
            block.instantChange(5)
        }
        
    }
    return delay(ms)
}

bar = document.getElementById("bar")
barbut = document.getElementById("dropbut")
bardown = false

function gobar(){
    if(!bardown){
        bar.style.top = "10px"
        barbut.style.transform = "scaleY(-1)"
    }
    else{
        bar.style.top = "-85px"
        barbut.style.transform = "scaleY(1)"
    }
    bardown = !bardown
}

async function makemaze(x, y){
    let num = [0, 1, 2, 3];
    let max = 4;
    myMap[x][y].mark = true
    while(max){
        let idx = getRandomInt(max)
        switch(num[idx]){
            case 0:
                if(x + 2 < 35){
                    if(myMap[x+2][y].mark) break
                    myMap[x+1][y].instantChange(0)
                    makemaze(x+2, y)
                }
                break
            case 1:
                if(x - 2 > 0){
                    if(myMap[x-2][y].mark) break
                    myMap[x-1][y].instantChange(0)
                    makemaze(x-2, y)
                }
                break
            case 2:
                if(y + 2 < 69){
                    if(myMap[x][y+2].mark) break
                    myMap[x][y+1].instantChange(0)
                    makemaze(x, y+2)
                }
                break
            case 3:
                if(y - 2 > 0){
                    if(myMap[x][y-2].mark) break
                    myMap[x][y-1].instantChange(0)
                    makemaze(x, y-2)
                }
                break
            default:
                break
        }
        max--;
        num[idx] = num[max];
    }
}