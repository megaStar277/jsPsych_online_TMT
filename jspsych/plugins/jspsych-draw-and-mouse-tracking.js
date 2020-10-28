jsPsych.plugins['draw-and-mouse-tracking'] = (function(){

    var plugin = {};
  
    plugin.info = {
      name: 'draw-and-mouse-tracking',
      parameters: {
        canvas_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Canvas width',
          default: window.innerWidth,
          description: 'The width of the canvas.'
        },
        canvas_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Canvas height',
          default: window.innerHeight,
          description: 'The height of the canvas.'
        },
        background_color: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Background color',
          default: 'grey',
          description: 'The background color of the canvas.'
        },
        response_ends_trial: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response ends trial',
          default: true,
          description: 'If true, trial will end when subject makes a response.'
        },
        trial_duration: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Trial duration',
          default: null,
          description: 'How long to show trial before it ends.'
        }
        
      }
    }
    
    let default_maxWidth;
    
    plugin.trial = function(display_element, trial){
      //display_element is a HTML DOM element
      
      const elm_jspsych_content = document.getElementById('jspsych-content');
      const style_jspsych_content = window.getComputedStyle(elm_jspsych_content); // stock
      default_maxWidth = style_jspsych_content.maxWidth;
      elm_jspsych_content.style.maxWidth = 'none'; // The default value is '95%'. To fit the window
      
      // draw
      
      let new_html =
      '<canvas id="myCanvas" class="jspsych-canvas" width=' +
      trial.canvas_width +
      " height=" +
      trial.canvas_height +
      ' style="background-color:' +
      trial.background_color +
      ';"></canvas>';
      
      display_element.innerHTML = new_html;
  
      var canvas = document.getElementById('myCanvas'); 
      const ctx = canvas.getContext('2d');
      const centerX = canvas.width/2; // OJO, ACA MODIFIQUE
      const centerY = canvas.height/2; // OJO, ACA MODIFIQUE
  
      let start_time;
   
    // trial time init
    start_time = performance.now();
  
    //***************************** logica de dibujar (para abajo) ****************************************
        
    canvas.addEventListener("mouseup", mouseUpFunc);
    
    canvas.addEventListener('mousedown', e => {
      //  console.log('entro a mousedown');
        x = e.offsetX;
        y = e.offsetY;
        isDrawing = true;
      });  

    canvas.addEventListener( "mousemove", function(e){
      // console.log('entro a mouseMove');
      if (isDrawing === true) {
        // console.log('entro al IF de mouseMove');
        drawLine(ctx, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
        }
      mouseMove(e);
    });

    canvas.addEventListener('mouseup', e => {
      if (isDrawing === true) {
        drawLine(ctx, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
      }
    });

    // ***************************** logica de dibujar (para arriba) *****************************
        // chequear que poniendolo aca se resetee en cada trial
        let pos_tracking = []; 
        let cursor_time        = [];

        //Estas funciones las agregue yo (de aca para abajo) *********************************************
        function mouseMove(e){

          var x = e.clientX;
          var y = e.clientY;
          var coor = "(" + x + "," + y + ")";
          console.log(coor);
          pos_tracking.push(coor); 	//Save coor in array pos_tracking
          
          //timer for cursor 
         
          // var startTime = Date.now();
          
          let startTime = Math.round(performance.now()) ;
    
          //start_time was declared at begining of the trial
          
          let time_in_trial = Math.round(startTime - start_time)
         
          // console.log("T1: " + startTime);
          // console.log("T2: " + Math.round(start_time));
          // console.log("T1 - T2: " + time_in_trial);
          
          //cursor time is an array with the time measurement for every [x,y] position relative to the start of the trial
          cursor_time.push(time_in_trial); 
         
          }
         
        function drawLine(ctx, x1, y1, x2, y2) {
          // console.log('entre a DRAWLINE');
    
          ctx.beginPath();
          ctx.strokeStyle = 'green'; // drawLine color
          ctx.lineWidth = 2;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2) 
          ctx.stroke();
          ctx.closePath(); // ojo que por ahi hay que comentar esto
         }
  
    
        function mouseUpFunc(e){ //ex mouseDownFunc
          
          let release_click_time;
          
          release_click_time = performance.now();

          if (isDrawing === true) {
            drawLine(ctx, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            isDrawing = false;
          }
      // e.preventDefault(); // check this
    
      after_response({ // callback function
        key: -1,
        rt: release_click_time - start_time,
        clickX: e.offsetX,
        clickY: e.offsetY,
        pos_tracking: pos_tracking,
        cursor_time: cursor_time   
    });
  }
  
  

    if ( ! canvas || ! canvas.getContext ) {
      alert('This browser does not support the canvas element.');
      return;
    }
  
    //Fixation cross
    function present_cross(stim){
      ctx.beginPath();            
      ctx.lineWidth = stim.line_width;
      ctx.lineJoin = stim.lineJoin;
      ctx.miterLimit = stim.miterLimit;
      ctx.strokeStyle = stim.line_color;
      const x1 = stim.currentX;
      const y1 = stim.currentY - stim.line_length/2;
      const x2 = stim.currentX;
      const y2 = stim.currentY + stim.line_length/2;                
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      const x3 = stim.currentX - stim.line_length/2;
      const y3 = stim.currentY;
      const x4 = stim.currentX + stim.line_length/2;
      const y4 = stim.currentY;                
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }

     // store response
     var response = { 
      rt: null,
      clickX: null,
      clickY: null,
    };



    // function to end trial when it is time
    var end_trial = function() {
      document.getElementById('jspsych-content').style.maxWidth = default_maxWidth; // restore
      //window.removeEventListener("mousedown", mouseDownFunc);
      canvas.removeEventListener("mouseup", mouseUpFunc);

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

    // gather the data to store for the trial

      var trial_data = {
        "rt": response.rt,
        "click_x": response.clickX, //por que viene de repose si ahi no hay clickX ?
        "click_y": response.clickY,
        "position": pos_tracking,
        "cursor time": cursor_time
      };


    // clear the display
    display_element.innerHTML = '';

    // move on to the next trial
    jsPsych.finishTrial(trial_data,cursor_time);

    };

    var after_response = function(info) {
    
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    
    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
  
  })();