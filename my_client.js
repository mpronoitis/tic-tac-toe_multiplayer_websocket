    var socket = io.connect('https://192.168.2.12:443');
    //var socket = io.connect('https://0074851377d3.ngrok.io');
    
    var username = prompt('What\'s your username?');
    let my_Turn;

    socket.emit('new_client', username);

      
   let canvas = document.createElement('canvas');
  //let canvas = document.getElementById('tic-tac');
    canvas.setAttribute('id','tic-tac');
    document.body.appendChild(canvas);
    let ctx = document.getElementById('tic-tac').getContext('2d');
    let x = 0;
    let id_x;
    

    window.addEventListener('load', () => {
    drawBoard();
    })


    const restartBtn = document.querySelector('#restart-game');
    const width = 600;
    const height = 500;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    let game_over = false;
    let board = [];

    const sectionSize = width/3; //size of a cell
    const sectionHeight = height/3;

    let player ; //to 1 symbolizei ton paixti me to 'X'

    let finded_Rect = [{x:0,y:0,row:0,col:0,value:''}];

    
    document.title = username + ' - ' + document.title;

    // When a message is received it's inserted in the page
    socket.on('message', function(data) {
      insertMessage(data.username, data.message)
    })
    // When a new client connects, the information is displayed
    socket.on('new_client', function(username) {
        $('#chat_zone').prepend('<p><em>' + username + ' has joined the chat!</em></p>');
      })
      // When the form is sent, the message is sent and displayed on the page
      $('#chat_form').submit(function() {
        var message = $('#message').val();
        socket.emit('message', message);  // Sends the message to the others
        insertMessage(username, message); // Also displays the message on our page
        $('#message').val('').focus();    // Empties the chat form and puts the focus back on it
        return false; // Blocks 'classic' sending of the form
      });
      // Adds a message to the page
      function insertMessage(username, message) {
        var date = new Date();
        $('#chat_zone').prepend('<p>'+date.toLocaleTimeString()+' <strong>' + username + '</strong> ' + message + '</p>');
      }

    function drawBoard() {
      
        drawLines(sectionSize,0,sectionSize,height);

        drawLines(width - sectionSize,0,width - sectionSize,height);

        drawLines(0,height - (height *2)/3,width,height - (height*2)/3);

        drawLines(0,height - (height)/3,width,height - (height)/3);

        for (let i=0;i<3;i++) {
            for(let j=0;j<3;j++) {
                board.push({
                    x: j*sectionSize,
                    y: i*sectionHeight,
                    row: i,
                    col: j,
                    value: '',
                });
            }
        }
    }


    socket.on('display-winner', addMessageLosser);

    socket.on('move.made',newDrawing);

    socket.on('game.begin', function(data) {
            player = data.symbol;
            my_Turn = player === 'X';
            renderTurnMessage();
               
        })

    function addMessageLosser(data) {
        game_over = data.game;
    }


    function setUp() { //epanafora paixnidiou 
    ctx.fillStyle = "#fff";
    for(let i=0;i<3;i++) {
        for(let j=0;j<3;j++) {
            ctx.fillRect(j*sectionSize,i*sectionHeight,sectionSize,sectionHeight);
        }
    }

    game_over = false;
    board = [];
    renderTurnMessage();
   
    drawBoard();
    }

    function getMousePosition(event) {//parakolouthw thn thesh tou pontikiou
        console.log(event.offsetX + event.offsetY);
        return {
            x: event.offsetX,
            y: event.offsetY
        }
    };
    canvas.addEventListener('click', () => {
        if(!my_Turn) {
            return;
        }
        
        if(game_over) {
            return;
        }
        let mouse_position = getMousePosition(event);
        //console.log('x ' +mouse_position.x + 'y ' +mouse_position.y);
        let boardRect = board.find(cell => {

            let xCordinate = sectionSize * cell.col;
            let yCordinate = sectionHeight * cell.row;

            if(mouse_position.x>= xCordinate && mouse_position.x<=xCordinate + sectionSize &&
            mouse_position.y>=yCordinate && mouse_position.y<= yCordinate + sectionHeight) {
                return true;
            return false;
            } 
            
        });
        finded_Rect =  boardRect; //fined_Rect καθε φορα ειναι το τρεχων cell πανω στο οποιο πατησαμε
        console.log(finded_Rect);

        if(finded_Rect.value!=='') {//ama ksanapathsw kai exei sxhma mhn to zwgrafiseiw
            return;
        }
        
        if (player === 'X') {
            checkMove('X',finded_Rect.row,finded_Rect.col);
            drawX(finded_Rect.x,finded_Rect.y); 
            
        }  
        else {
            checkMove('O',finded_Rect.row,finded_Rect.col);
            drawO(finded_Rect.x,finded_Rect.y); 
            
        }
        var data = {
            mouseX: finded_Rect.x,
            mouseY: finded_Rect.y,
            value: player,
            board: board,
            turn: my_Turn
            
        }

        var message = {
          ssl: 'Geia'
        }
        socket.emit('make-move', data);
        socket.emit('begin',message);
     
 })


    function checkMove(value,row,col) {
        //console.log(value,row,col);
        
        let cellToChange = board[row*3 + col];
        if(cellToChange.value === '') {
            cellToChange.value = value;//an den exei timh bale tou auti poy ebale o xrhsths
        }
        // pithanoi sindiasmoi gia na exoyme nikiti 
        
        check_Winner(0,1,2);
        check_Winner(3,4,5);
        check_Winner(6,7,8) 

        check_Winner(0,3,6)
        check_Winner(1,4,7)   
        check_Winner(2,5,8) 

        check_Winner(0,4,8)  //kiria diagwnios kai deutereousa
        check_Winner(6,4,2)
        
    }

    function renderTurnMessage() {
    
    if (!my_Turn) {
        
        $("#messages").text("Your opponent's turn");

    } else {
        
        $("#messages").text("Your turn.");
    }
    }

    function check_Winner(x,y,z) {
    
        if(board[x].value !== '' && board[y].value !== '' && board[z].value !== '') {
            // if(!game_over && board.every(rect => rect.value!=='')) { //an ola ta kelia exoyn parei times kai den exei ginei true exoume isopalia
                // var drawer = {
                //     game:game_over
                // }
                //addMessage(`It's a draw`);
                // socket.emit('display-winner',drawer);
                // $("#messages").text("Game Drawn!");
            // renderTurnMessage();
                
        //  }
            if(board[x].value === board[y].value && board[y].value === board[z].value) {
                game_over = true; 
                
            }
            var winner = {
                    game: game_over,
                    turn: my_Turn
                };
            if(game_over) {
            
                socket.emit('display-winner', winner);
                
            }
        }  
    }
    function newDrawing(data) {
        if (data.value=='X') {
            drawX(data.mouseX,data.mouseY);
        }
        if (data.value=='O') {
            drawO(data.mouseX,data.mouseY);
        }

        board = data.board; // ενημέρωση του τρέχοντος board    
        my_Turn = data.value !== player; // για να παίζουν εναλλαξ κάθε φορά
        
        if(!game_over) {
            if(board.every(rect => rect.value!=='')) {
                $("#messages").text("Game Drawn!"); 
            } else {
                renderTurnMessage();
            }    
        } else {
            if (my_Turn) {
        $("#messages").text("Game over. You lost.");
        // Show the message for the winner
        } else {
        $("#messages").text("Game over. You won!");
        

        }
        }
    }

    function drawLines(startX,startY,endX,endY) {
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(endX,endY);
        ctx.stroke();

    }
    function drawO(x,y) {
        ctx.save();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#01bBC2";
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.arc(x + sectionSize/2,y + sectionHeight/2,sectionSize/4,0,2*Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    function drawX(x,y) {
        ctx.save();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#f1be32";
        let offset_x = sectionSize / 5;
        let offset_y = sectionHeight/5;

        drawLines(x + offset_x,y+offset_y,sectionSize - offset_x + x,sectionHeight - offset_y + y);
        drawLines(x + offset_x * 4,y+offset_y,sectionSize - offset_x*4 + x,sectionHeight - offset_y + y);
        ctx.restore();
    }

    function getBoardState() {
        return board;
    }

    var localStream;

    var localVideo = document.getElementById("localVideo");
    var remoteVideo = document.getElementById("remoteVideo");
  
    var callButton = document.getElementById("callButton");
  
    callButton.disabled = true;
    callButton.onclick = call;
  
  navigator.getUserMedia = navigator.getUserMedia || //represents a stream of audio or video , can contain multiple tracks 
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    
  navigator.getUserMedia({ //ζηταμε permissions apo ton browser για καμερα μικροφωνο
    audio: true,
    video: true
    
    }, gotStream, //note that we are adding both audio and video
  
    function(error) {
      console.log('navigator.getUserMedia error: ', error);
    });
  
  var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
  
  var pc = new RTCPeerConnection({ //RTCPeerConnection is an API for making WebRTC calls to stream video and audio, and exchange data.
    "iceServers": []
  });
  
  function gotStream(stream) {
    localVideo.srcObject = stream; // UPDATED
    localStream = stream;
    callButton.disabled = false;
    pc.addStream(stream);
  }
  
  pc.onicecandidate = function(event) { //process to find ICE candidates // αφου εχει μπει ο STUN server
    console.log(event);
    if (!event || !event.candidate) {
      return;
    } else {
      socket.emit("video call", { //οταν μπει ο πρωτος candidate ειδοποιουμε τον σερβερ
        type: "iceCandidate",
        "candidate": event.candidate
      });
    }
  };
  
  var remoteStream;
  
  pc.onaddstream = function(event) { //αφου εχουν βρεθει οι Ice candidates βαζουμε στο remote stream 
    remoteStream = event.stream;
    var remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.stream; // UPDATED
    remoteVideo.play();
  };
  
  socket.on("video call", function(data) {
    console.log(data);
  
    switch (data.type) {
      case "iceCandidate":
        console.log("case : iceCandidate");
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
  
      case "offer":
        console.log("case : offer");
        // pc.setRemoteDescription(new SessionDescription(data.description), function() { // DEPRECATED ON FIREFOX
        //   console.log("failure callback");
        // });
        pc.setRemoteDescription(new SessionDescription(data.description)).then(()=>{console.log("failure callback")}); // UPDATE FOR FIREFOX
        pc.createAnswer(function(description) {
          pc.setLocalDescription(new SessionDescription(description));
  
          socket.emit("video call", {
            type: "answer",
            "description": description
          });
        }, function() {
          console.log("failure callback")
        });
        break;
  
      case "answer":
        console.log("case : answer");
        // pc.setRemoteDescription(new SessionDescription(data.description), function() { // DEPRECATED ON FIREFOX
        //   console.log("failure callback");
        // });
        pc.setRemoteDescription(new SessionDescription(data.description)).then( function() { // UPDATE FOR FIREFOX
          console.log("failure callback");
        });
        break;
  
    }
  });
  
  function call() {
  
    console.log("Calling another peer");
    console.log(pc.iceConnectionState);
    console.log(pc);
    if (pc.iceConnectionState == "closed") {
      pc = new RTCPeerConnection({
        "iceServers": []
      });
      pc.addStream(localStream);
      console.log(pc);
    }
  
    pc.createOffer(function(description) { //αφου εχει εγκατασταθει ο signaling server // createOffer ->1) offer 2)answer
      console.log("Creating offer for the other peer");
      // pc.setLocalDescription(new SessionDescription(description), function() { // DEPRECATED ON FIREFOX
      //   console.log("failure callback");
      // });
      pc.setLocalDescription(new SessionDescription(description)).then( function() { // UPDATE FOR FIREFOX
        console.log("failure callback"); //sending to another peer media stream etc
      });
      socket.emit("video call", {
        type: "offer",
        "description": description
      });
    }, function() {
      console.log("failure callback");
    });
  };
      /********************** datachannel*********************/
      var dataChannelOptions = {
        ordered: false, // do not guarantee order
        maxRetransmitTime: 3000, // in milliseconds
      };
  
      // Establish your peer connection using your signaling channel here
      var dataChannel = pc.createDataChannel("test_datachannel", dataChannelOptions);
  
      pc.ondatachannel = function(ev) {
      console.log('Data channel is created!');
      
        ev.channel.onopen = function() {
          console.log('Data channel is open and ready to be used.');
          dataChannel.send('Hello World!');
      },
      
        ev.channel.onerror = function(error) {
          console.log("Data Channel Error:", error);
      },
      
        ev.channel.onmessage = function(event) {
          console.log("Got Data Channel Message:", event.data);
      },
      
        ev.channel.onclose = function() {
          console.log("The Data Channel is Closed");
        };
      };
      



