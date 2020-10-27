jsPsych.plugins['draw-and-mouse-tracking'] = (function(){

    var plugin = {};
  
    plugin.info = {
      name: 'draw-and-mouse-tracking',
      parameters: {

      }
    }
  
    plugin.trial = function(display_element, trial){
    //display_element is a HTML DOM element

        const elm_jspsych_content = document.getElementById('jspsych-content');
        const style_jspsych_content = window.getComputedStyle(elm_jspsych_content); // stock
        default_maxWidth = style_jspsych_content.maxWidth;
        elm_jspsych_content.style.maxWidth = 'none'; // The default value is '95%'. To fit the window

        let new_html =
          '<canvas id="myCanvas" class="jspsych-canvas" width=' +
          trial.canvas_width +
          " height=" +
          trial.canvas_height +
          ' style="background-color:' +
          trial.background_color +
          ';"></canvas>';

          
          jsPsych.pluginAPI.setTimeout(function() {
            
            let start_time;
            start_time = performance.now();
     
   
      // ***************************** logica de dibujar (para abajo) ****************************************
          
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

          }, trial.response_start_time); // cierra todo jsPsych.pluginAPI.setTimeout(function()

       // ***************************** logica de dibujar (para arriba) *****************************


      //saving data
      let trial_data = {
        //parameter_name = 'parameter value';
        words: trial.words
      };

      function show_stimulus(){
        display_element.innerHTML = '<p>' + trial.words + '</p>';

        //I want to show an image here
        // I don't want an automatic finish of the trial
      };

      show_stimulus();


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

         // function to end trial when it is time
      var end_trial = function() {
      // console.log(default_maxWidth)
      document.getElementById('jspsych-content').style.maxWidth = default_maxWidth; // restore
      // window.cancelAnimationFrame(frameRequestID); //Cancels the frame request
      //window.removeEventListener("mousedown", mouseDownFunc);
      canvas.removeEventListener("mouseup", mouseUpFunc);

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      if (typeof response.clickX !== 'undefined'){
        var trial_data = {
          "rt": response.rt,
          "response_type": trial.response_type,
          // "stimulus": trial.stimuli,
          "key_press": response.key,
          "avg_frame_time": elapsedTime/sumOfStep,
          "position_x": response.positionX,
          "position_y": response.positionY,
          "click_x": response.clickX,
          "click_y": response.clickY,
          "position": pos_tracking,
          "cursor time": cursor_time
        };

      } else {
        var trial_data = {
          "rt": response.rt,
          "response_type": trial.response_type,
          // "stimulus": trial.stimuli, 
          "key_press": response.key,
          "avg_frame_time": elapsedTime/sumOfStep,
          "mousePositionX": response.positionX, 
          "mousePositionY": response.positionY,
          "position": pos_tracking,
          "cursor time": cursor_time
        };

      }

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
    }
  
    return plugin;
  
  })();