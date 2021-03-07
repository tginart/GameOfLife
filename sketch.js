let w
let columns
let rows
let board
let button
let timer = 3
let count_down = 15
let state = 'stopped'

let gdata
let status = ''


// using ngrok for testing purposes
let server_name = 'https://6298d0206225.ngrok.io'
//server_name = 'https://us-central1-crypto-174821.cloudfunctions.net/gameoflife'

function setup() {
  createCanvas(800, 640);
  w = 12; // width of cells in pixels
  columns = 32
  rows = 32

  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      board[i][j] = 0
    }
  }

  button_start = createButton('start');
  button_start.position(400, 0);
  button_start.mousePressed(function() {

    state = 'running'
    // send cell pattern to server
    send_cells()
  });
  button_stop = createButton('stop');
  button_stop.position(450, 0);
  button_stop.mousePressed(function() {
    state = 'stopped'
  });

  button_getdata = createButton('get data')
  button_getdata.position(400,30)
  button_getdata.mousePressed(function(){
    request_data()
  })

  button_state = createButton('state');
  button_state.position(400, 90);
  button_state.mousePressed(function() {
    
  });
  button_data = createButton('...');
  button_data.position(530, 90);
  button_data.mousePressed(function() {
    
  });
  
  

  button_random = createButton('Random');
  button_random.position(400, 120);
  button_random.mousePressed(function() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        board[i][j] = random([0, 1])
      }
    }
    

  });

  button_clear = createButton('Clear');
  button_clear.position(400, 150);
  button_clear.mousePressed(function() {
    console.log('button_clear')
    clear_board()
  })

  button_sliders = createButton('Sliders')
  button_sliders.position(400, 180)
  button_sliders.mousePressed(function() {

    clear_board()
    for (let i = 5; i < 20; i += 4) {
      board[i + 1][i + 1] = 1
      board[i + 2][i + 2] = 1
      board[i + 3][i + 2] = 1
      board[i + 1][i + 3] = 1
      board[i + 2][i + 3] = 1
    }

  })

  
  setInterval(timeIt, 1 * 1000);

  loadJSON(server_name + '/data', cbData, 'json')
  button_data.html(`waiting for data`)

}

function request_data(){
  loadJSON(server_name + '/data', cbData, 'json')
  button_data.html('waiting for data..')
}

function send_cells() {
  let cells = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      cells.push(board[i][j])
    }
  }

  httpPost(server_name + '/setcells',
    "json", {
      'cells': cells
    })

  button_data.html(`waiting for data`)
}


function clear_board() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      board[i][j] = 0
    }
  }
}

function timeIt() {

  timer--

  //button_countdown.html(`collecting data in ${timer}`)
  if (timer > 0) {
    return
  }
  // slow down over time
  timer = count_down
  if (count_down == 15) {
    count_down = 30
  } else if (count_down == 30) {
    count_down = 60
  }



  if (state == 'stopped') {
    loadJSON(server_name + '/data', cbData, 'json');
    return
  }

  if (state == 'running') {
    loadJSON(server_name + '/step', cbStep, 'json');
    loadJSON(server_name + '/data', cbData, 'json');

  }
}
function cbStep(data){
  console.log('cbStep',data)
}
    
function cbSetCellsError(response) {
  console.log("cbSetCellsError", response)
}

function draw() {
  background(255);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if ((board[i][j] == 1)) {
        fill(0);
      } else {
        fill(255);
      }
      stroke(0);
      rect(i * w, j * w, w - 1, w - 1);
    }
  }
  
  button_state.html(`state: ${state} ${timer}`)  

  
  fill(color(0, 0, 255));
  textSize(16)
  let posx = 400
  let posy = 220
  if (gdata) {
    text(`Network: ${gdata.network}`,posx,posy)
  
s = `Sender Address: ${gdata.caller_address}
Balance ${gdata.caller_balance} eth
Latest Block ${gdata.block}
Last Transaction Block ${gdata.myblock}`
    text(s,posx,posy+20)
   
  }
 
  text(`status: ${status}`,10,400)

}

// allow user to select their own cells..
function mousePressed(event) {

  let i = int(mouseX / w)
  let j = int(mouseY / w)
  if (i >= 0 && i < rows && j >= 0 && j < columns) {
    if (board[i][j]) {
      board[i][j] = 0
    } else {
      board[i][j] = 1
    }
  }

}

function cbData(data) {
  
  console.log(data)
  
  if (data.cells) {
    let cells = data.cells

    let index = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        board[i][j] = cells[index++]

      }
    }
  }


  gdata = data
  button_data.html('...')
  
  if (data.code) {
    status = data.code
  }
  
}