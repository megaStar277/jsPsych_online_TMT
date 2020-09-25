/*
 *  plugin based in  Qisheng Li 11/2019. /// https://github.com/QishengLi/virtual_chinrest
    Modified by Gustavo Juantorena 08/2020
 */

jsPsych.plugins['virtual-chin'] = (function() {

  var plugin = {};

  plugin.info = {
    name: "virtual-chin", 
    parameters: {
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
      },
      screen_size_px: {
        type: jsPsych.plugins.parameterType.INT,
        default: null,
        description: 'Screen size'
      },
      prompt_instructions: {
        type: jsPsych.plugins.parameterType.STRING,
        default: null,
        description: 'Any content here will be displayed above card image.'
      },
      // prompt_card: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   default: null,
      //   description: 'Any content here will be displayed above card image.'
      // },
      // prompt_blindspot: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   default: null,
      //   description: 'Any content here will be displayed below the stimulus.'
      // }
    }
  }
  
  plugin.trial = function(display_element, trial) {
   
    // Get screen size
    var w = window.innerWidth;
    var h = window.innerHeight;

    // console.log(w);
    // console.log(h);

    const screen_size_px = []
    screen_size_px.push(w)
    screen_size_px.push('x')
    screen_size_px.push(h)

    // console.log(screen_size_px)
    
    // data saving
    var trial_data = { //I need to modify this in order to save important data
      'viewing_distance_cm': trial.viewing_distance_cm,
      'cardWidth_px': trial.cardWidth_px,
      'screen_size_px': trial.screen_size_px
    };

    trial_data.screen_size_px = screen_size_px

  
  //Store all the configuration data in variable 'data'
  var data = {"dataType":"configurationData"};
      
      data["ballPosition"] = [];

      data["sliderClicked"] = false;

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

  
  function getCardWidth() {
      var cardWidthPx = $('#card').width();
      data["cardWidthPx"] = distanceSetup.round(cardWidthPx,2);
      // console.log(cardWidthPx)

      trial_data.cardWidth_px = cardWidthPx // add to trial_data

      return cardWidthPx
  }


  function configureBlindSpot() {

      drawBall();
      $('#page-size').remove();
      $('#blind-spot').css({'visibility':'visible'});
      // $(document).on('keydown', recordPosition);
      $(document).on('keydown', recordPosition);

  };

  $( function() {
      $( "#slider" ).slider({value:"50"});
  } );

  $(document).ready(function() {
      $( "#slider" ).on("slide", function (event, ui) {
          var cardWidth = ui.value + "%";
          $("#card").css({"width":cardWidth});
      });

      $('#slider').on('slidechange', function(event, ui){
          data["sliderClicked"] = true;
      });

  });


  //=============================
  //Ball Animation

  function drawBall(pos=180){
      // pos: define where the fixation square should be.
      var mySVG = SVG("svgDiv");
      const cardWidthPx = getCardWidth()
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
          console.log('entro de nuevo a recordPosition')

          data["ballPosition"].push(distanceSetup.round((ball.cx() + moveX),2));
          var sum = data["ballPosition"].reduce((a, b) => a + b, 0);
          var ballPosLen = data["ballPosition"].length;
          data["avgBallPos"] = distanceSetup.round(sum/ballPosLen, 2);
          var ball_sqr_distance = (data["squarePosition"]-data["avgBallPos"])/data["px2mm"];
          var viewDistance = ball_sqr_distance/Math.radians(angle)
          // console.log(Math.radians(angle))
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
                if (e.keyCode == 32)  {return false;} //32 is spacebar I CHANGE THAT
              });

              // Display data
              $('#info').css("visibility", "visible");
              $('#info-h').append(data["viewDistance_mm"]/10)


              //Estimated viewing distance in centimeters
              trial_data.viewing_distance_cm = (data["viewDistance_mm"]/10); // add to trial_data

              // console.log(data["viewDistance_mm"]/10);

              dist = Math.round(data["viewDistance_mm"]/10)

              // The trial must end 
              end_trial()
             
              
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


      // You can write functions here that live only in the scope of plugin.trial
      function show_stimulus(){

        // var new_html = '<div </div>';

        // // add prompt
        // if(trial.prompt !== null){
        //   new_html += trial.prompt;
        // }

        // // draw
        // display_element.innerHTML = new_html;


          // Promp
          var html = "<body><div id='content'><div id='page-size'><br><br><br><br><br><br>";
          
          html += "<p>Por favor repita la medición de la misma tarjeta, pero esta vez utilizando la barra deslizante.</p>";   
          
          html += "<b style='font-style: italic'>Asegúrese de poner la tarjeta sobre la pantalla.</b>";
          html += '<br><div id="container">';
          html += "<div id='slider'></div>";
          html += '<br> <img id="card" src="card.png" style="width: 50%"><br><br>';
          html +='<button id="btnBlindSpot" class="btn btn-primary">Presione aquí cuando termine!</button></div></div>';

        
          html += '<div id="blind-spot" style="visibility: hidden">';
          html += '<!-- <h2 class="bolded-blue">Task 2: Where’s your blind spot?</h2> -->';
          html += "<h3>Ahora vamos a estimar su distancia a la pantalla.</h3>";
          
          html += '<h3>Instrucciones</h3>';
          html += '<p>1. Coloque su dedo índice en la <b>barra espaciadora</b> </p>';
          html += '<p>2. Cierre su ojo derecho. <em> (Tip: Quizá le resulte más fácil tapándolo con su mano!)</em></p>';
          html += '<p>3. Usando su ojo izquierdo, haga foco en el cuadrado negro.</p>';
          html += '<p>4. Presione el botón de abajo para iniciar la animación de la pelotita roja. Esa <b style="color: red">pelotita roja</b> va a desaparecer de su vista en algún momento. Ni bien la deje de ver (siempre enfocando en el cuadrado negro) presione una vez la barra lo más rápidamente posible.</p><br>';
          html += '<p>Por favor repita el proceso <b>cinco</b> veces. Mantenga su ojo derecho cerrado y presione la barra espaciadora lo más rápidamente posible!</p><br>';
          html += '<button class="btn btn-primary" id="start" ">Empezar</button>';

          html += '<div id="svgDiv" style="width:1000px;height:200px;"></div>';
          html +=  "Presioná la barra <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> veces más!</div>";
         


          display_element.innerHTML = html; 

      
      //Event listeners for buttons

      document.getElementById("btnBlindSpot").addEventListener('click', function() {
        console.log('presionaste el boton 1');
        configureBlindSpot();
      });

      document.getElementById("start").addEventListener('click', function() {
        console.log('presionaste el boton 2');
        animateBall(); 
      });



        jsPsych.pluginAPI.getKeyboardResponse({ 
          callback_function: after_response,                           // we need to create after_response
          valid_responses: [trial.key],                             // valid_responses expects an array
          rt_method: 'performance',                                   // This is only relevant for RT in audio stimuli
          persist: false,                                             // true if you want to listen to more than one key
          allow_held_key: true                                       // false for a new key pressing in order to get a new response  
        }); 
      }
       

      function after_response(response_info){
        // rt.push(response_info.rt); // response time of the key
        end_trial();
      }

      function end_trial(){
        jsPsych.finishTrial(trial_data); // ends trial and save the data
        // display_element.innerHTML = ' '; // clear the display

        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        

      }
      show_stimulus();

    };

    return plugin;
  })();


