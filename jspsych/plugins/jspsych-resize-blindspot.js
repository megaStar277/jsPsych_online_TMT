/**
* jspsych-resize
* Steve Chao
*
* plugin for controlling the real world size of the display
*
* documentation: docs.jspsych.org
*
**/

jsPsych.plugins["resize"] = (function() {

    var plugin = {};
  
    plugin.info = {
      name: 'resize',
      description: '',
      parameters: {
        item_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Item height',
          default: 1,
          description: 'The height of the item to be measured.'
        },
        item_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Item width',
          default: 1,
          description: 'The width of the item to be measured.'
        },
        prompt: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Prompt',
          default: null,
          description: 'The content displayed below the resizable box and above the button.'
        },
        pixels_per_unit: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Pixels per unit',
          default: 100,
          description: 'After the scaling factor is applied, this many pixels will equal one unit of measurement.'
        },
        starting_size: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Starting size',
          default: 100,
          description: 'The initial size of the box, in pixels, along the larget dimension.'
        },
        button_label: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Button label',
          default:  'Continue',
          description: 'Label to display on the button to complete calibration.'
        },
        viewing_distance_cm: {
          type: jsPsych.plugins.parameterType.INT,
          default: 0
        },
        cardWidth_px: {
          type: jsPsych.plugins.parameterType.INT,
          default: 0
        },
        pixels_per_unit: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Pixels per unit',
          default: 100,
          description: 'After the scaling factor is applied, this many pixels will equal one unit of measurement.'
        }
      }
    }
  
    plugin.trial = function(display_element, trial) {


      //RESIZE PART
  
      var aspect_ratio = trial.item_width / trial.item_height;
      
  
      // variables to determine div size
      if(trial.item_width >= trial.item_height){
        var start_div_width = trial.starting_size;
        var start_div_height = Math.round(trial.starting_size / aspect_ratio);
      } else {
        var start_div_height = trial.starting_size;
        var start_div_width = Math.round(trial.starting_size * aspect_ratio);
      }
  
      // create html for display
      var html ='<div id="jspsych-resize-div" style="border: 2px solid steelblue; height: '+start_div_height+'px; width:'+start_div_width+'px; margin: 7px auto; background-color: lightsteelblue; position: relative;">';
      html += '<div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: steelblue; width: 10px; height: 10px; border: 2px solid lightsteelblue; position: absolute; bottom: 0; right: 0;"></div>';
      html += '</div>';
      html +='<button id="btnBlindSpot" class="btn btn-primary">Click here when you are done!</button></div></div>';
      if (trial.prompt !== null){
        html += trial.prompt;
      }
      html += '<a class="jspsych-btn" id="jspsych-resize-btn">'+trial.button_label+'</a>';

      // blidspot game
      html += '<div id="blind-spot" style="visibility: hidden">';
          html += '<!-- <h2 class="bolded-blue">Task 2: Where’s your blind spot?</h2> -->';
          html += "<h3>Now, let's quickly test how far away you are sitting.</h3>";
          html += "<p>You might know that vision tests at a doctor's practice often involve chinrests; the doctor basically asks you to sit away from a screen in a specific distance. We do this here with a 'virtual chinrest'.</p>";
          
          html += '<h3>Instructions</h3>';
          html += '<p>1. Put your finger on <b>space bar</b> on the keyboard.</p>';
          html += '<p>2. Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></p>';
          html += '<p>3. Using your left eye, focus on the black square.</p>';
          html += '<p>4. Click the button below to start the animation of the red ball. The <b style="color: red">red ball</b> will disappear as it moves from right to left. Press the Space key as soon as the ball disappears from your eye sight.</p><br>';
          html += '<p>Please do it <b>five</b> times. Keep your right eye closed and hit the Space key fast!</p><br>';
          html += '<button class="btn btn-primary" id="start" ">Start</button>';

          html += '<div id="svgDiv" style="width:1000px;height:200px;"></div>';
          html +=  "Hit 'space' <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> more times!</div>";


      // render
      display_element.innerHTML = html;

      document.getElementById("btnBlindSpot").addEventListener('click', function() {
        console.log('presionaste el boton 1');
        scale();
        configureBlindSpot();
      });

      document.getElementById("start").addEventListener('click', function() {
        console.log('presionaste el boton 2');
        animateBall(); 
      });

  
      // listens for the click
      document.getElementById("jspsych-resize-btn").addEventListener('click', function() {
        scale();
        end_trial(); //en lugar de esto nos tiene que mandar a blindspot
      });
  
      var dragging = false;
      var origin_x, origin_y;
      var cx, cy;
  
      var mousedownevent = function(e){
        e.preventDefault();
        dragging = true;
        origin_x = e.pageX;
        origin_y = e.pageY;
        cx = parseInt(scale_div.style.width);
        cy = parseInt(scale_div.style.height);
      }
  
      display_element.querySelector('#jspsych-resize-handle').addEventListener('mousedown', mousedownevent);
  
      var mouseupevent = function(e){
        dragging = false;
      }
  
      document.addEventListener('mouseup', mouseupevent);
  
      var scale_div = display_element.querySelector('#jspsych-resize-div');
  
      var resizeevent = function(e){
        if(dragging){
          var dx = (e.pageX - origin_x);
          var dy = (e.pageY - origin_y);
  
          if(Math.abs(dx) >= Math.abs(dy)){
            scale_div.style.width = Math.round(Math.max(20, cx+dx*2)) + "px";
            scale_div.style.height = Math.round(Math.max(20, cx+dx*2) / aspect_ratio ) + "px";
          } else {
            scale_div.style.height = Math.round(Math.max(20, cy+dy*2)) + "px";
            scale_div.style.width = Math.round(aspect_ratio * Math.max(20, cy+dy*2)) + "px";
          }
        }
      }
  
      document.addEventListener('mousemove', resizeevent);
  
      // scales the stimulus
      var scale_factor;
      var final_height_px, final_width_px;
        
        function scale() {
        final_width_px = scale_div.offsetWidth;
        //final_height_px = scale_div.offsetHeight;
  
        var pixels_unit_screen = final_width_px / trial.item_width;
  
        scale_factor = pixels_unit_screen / trial.pixels_per_unit;
        document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
        
      };

      // BLINDSPOT PART

      //Store all the configuration data in variable 'data'
      var data = {"dataType":"configurationData"};
          
          data["ballPosition"] = [];

        

          (function ( distanceSetup, $ ) {  // jQuery short-hand for $(document).ready(function() { ... });

          distanceSetup.round = function(value, decimals) {
              return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
          };
    
          distanceSetup.px2mm = function(cardImageWidth) {
              const cardWidth = 85.6; //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
              var px2mm = cardImageWidth/cardWidth;
              data["px2mm"] = distanceSetup.round(px2mm, 2);
              return px2mm; 
          };
    
      }( window.distanceSetup = window.distanceSetup || {}, jQuery));


      // const cardWidthPx = getCardWidth() // Asi estaba originalmente pero lo vamos a cambiar por final_width_px

      const cardWidthPx = final_width_px; // tomamos el dato de resize y lo usamos aca
      // trial_data.cardWidth_px = cardWidthPx // Agregamos a trial.data


      function configureBlindSpot() {

        drawBall();
        $('#page-size').remove();
        $('#blind-spot').css({'visibility':'visible'});
        // $(document).on('keydown', recordPosition);
        $(document).on('keydown', recordPosition);
  
      };

      //Ball Animation

  function drawBall(pos=180,final_width_px){
    // pos: define where the fixation square should be.
    var mySVG = SVG("svgDiv");
    const cardWidthPx = final_width_px
    const rectX = distanceSetup.px2mm(cardWidthPx)*pos;
    
    const ballX = rectX*0.6 // define where the ball is
    var ball = mySVG.circle(30).move(ballX, 50).fill("#f00"); 
    window.ball = ball;
    var square = mySVG.rect(30, 30).move(Math.min(rectX - 50, 950), 50); //square position
    data["squarePosition"] = distanceSetup.round(square.cx(),2);
    data['rectX'] = rectX
    data['ballX'] = ballX
};


function animateBall(){
    ball.animate(7000).during(
        function(pos){
            moveX = - pos*data['ballX'];
            window.moveX = moveX;
            moveY = 0;
            ball.attr({transform:"translate("+moveX+","+moveY+")"});

        }
    ).loop(true, false).
    after(function(){
        animateBall();
    });

    //disbale the button after clicked once.
    $("#start").attr("disabled", true);
};

function recordPosition(event, angle=13.5) {
    // angle: define horizontal blind spot entry point position in degrees.
    if (event.keyCode == '32') { //Press "Space"

        data["ballPosition"].push(distanceSetup.round((ball.cx() + moveX),2));
        var sum = data["ballPosition"].reduce((a, b) => a + b, 0);
        var ballPosLen = data["ballPosition"].length;
        data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
        var ball_sqr_distance = (data["squarePosition"]-data["avgBallPos"])/data["px2mm"];
        var viewDistance = ball_sqr_distance/Math.radians(angle)
        console.log(Math.radians(angle))
        data["viewDistance_mm"] = distanceSetup.round(viewDistance, 2);

        //counter and stop
        var counter = Number($('#click').text());
        counter = counter - 1;
        $('#click').text(Math.max(counter, 0));
        if (counter <= 0) {

            ball.stop();

            // Disable space key
            $('html').bind('keydown', function(e)
            {
              if (e.keyCode == 32) {return false;} //32 is spacebar
            });

            // // Display data
            // $('#info').css("visibility", "visible");
            // $('#info-h').append(data["viewDistance_mm"]/10)


            //Estimated viewing distance in centimeters
            trial_data.viewing_distance_cm = (data["viewDistance_mm"]/10); // add to trial_data

            console.log(data["viewDistance_mm"]/10);

            dist = Math.round(data["viewDistance_mm"]/10)

            // The trial must end 
            end_trial();

            // You can then DO SOMETHING HERE TO PROCEED TO YOUR NEXT STEPS OF THE EXPERIMENT. For example, add a button to go to the next page.
            // display_element.innerHTML = `<p>"Press space bar to start the experiment.</p>`
            display_element.innerHTML =
              "<p style='font-size:160%;'> When you are ready, please press space bar to start the experiment.</p>" +
              `<p style='font-size:160%;'>  Your viewing distance is about ${dist.toString()} cm </p>`

            return trial_data.viewing_distance_cm;
        }

        ball.stop();
        animateBall();
    }
}

//helper function for radians
// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};



      //FINAL PART
      
      // function to end trial
      function end_trial() {
  
        // clear document event listeners
        document.removeEventListener('mousemove', resizeevent);
        document.removeEventListener('mouseup', mouseupevent);
        
        
        // clear the screen
        display_element.innerHTML = '';
        
        
  
        // finishes trial
  
        var trial_data = {
          'final_height_px': final_height_px,
          'final_width_px': final_width_px,
          'scale_factor': scale_factor,
          'viewing_distance_cm': trial.viewing_distance_cm 
        }
  
        jsPsych.finishTrial(trial_data);
      }
    };
  
    return plugin;
  })();