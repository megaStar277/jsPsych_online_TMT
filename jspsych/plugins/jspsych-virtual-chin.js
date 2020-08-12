/*
 *  plugin based in  Qisheng Li 11/2019. /// Virtual chin rest
    Modified by Gustavo Juantorena 08/2020
 */

jsPsych.plugins['virtual-chin'] = (function() {

  var plugin = {};

  plugin.info = {
    name: "virtual-chin", 
    parameters: {
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: 31 // SPACEBAR //  I change this , 31 it`s not space bar
      },
      viewing_distance: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      cardWidth_px: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      }
    }
  }
  
  plugin.trial = function(display_element, trial) {

    
    // data saving
    var trial_data = { //I need to modify this in order to save important data
      'viewing_distance': trial.viewing_distance,
      'cardWidth_px': trial.cardWidth_px
    };


// Copy from virtual_chinrest.js

//Store all the configuration data in variable 'data'
var data = {"dataType":"configurationData"};
data["ballPosition"] = [];
data["fullScreenClicked"] = false; // REMOVE
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
    console.log(cardWidthPx)

    trial_data.cardWidth_px = cardWidthPx // add to trial_data

    return cardWidthPx
}


function configureBlindSpot() {

    drawBall();
    $('#page-size').remove();
    $('#blind-spot').css({'visibility':'visible'});
    // $(document).on('keydown', recordPosition);
    $(document).on('keydown', recordPosition);

    // addEventListener('click', function() {
    //   console.log('apretaste la barra');
    //   recordPosition();
    // });

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



            // You can then DO SOMETHING HERE TO PROCEED TO YOUR NEXT STEPS OF THE EXPERIMENT. For example, add a button to go to the next page.
            display_element.innerHTML = `<p>Press space bar to start the experiment.</p>`

            //save data ... I guess data["viewDistance_mm"]/10

            trial_data.viewing_distance = (data["viewDistance_mm"]/10); // add to trial_data

            console.log(data["viewDistance_mm"]/10);

            // The trial must end 
            end_trial();

            return trial_data.viewing_distance;
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
      display_element.innerHTML = `<p>Please use any credit card that you have available (it can also be a grocery store membership 
        card, your drivers license, or anything that is of the same format), hold it onto the screen, and adjust the slider below to its size.</p>`    
      // we copy this from the plugin html-keyboard-response  without this the 
    // plugin begins and automatically ends. we tke off the var because 
    // we only want to listen to the first pressed key.

        var html = "<body><div id='content'><div id='page-size'>";
        // html += "<h3> Let’s find out what your monitor size is (click to go into <div onclick='fullScreen(); registerClick();' style='display:inline; cursor:pointer; color: red'><em><u>full screen mode</u></em></div>).</h2>";
        
        html += "<p>Please use any credit card that you have available (it can also be a grocery store membership card, your drivers license, or anything that is of the same format), hold it onto the screen, and adjust the slider below to its size.</p>";   
        html += "<p>(If you don't have access to a real card, you can use a ruler to measure image width to 3.37inch or 85.6mm, or make your best guess!)</p>";
        html += "<b style='font-style: italic'>Make sure you put the card onto your screen.</b>";
        html += '<br><div id="container">';
        html += "<div id='slider'></div>";
        html += '<br> <img id="card" src="card.png" style="width: 50%"><br><br>';
        html +='<button id="btnBlindSpot" class="btn btn-primary">Click here when you are done!</button></div></div>';

        html += '<div id="blind-spot" style="visibility: hidden">';
        html += '<!-- <h2 class="bolded-blue">Task 2: Where’s your blind spot?</h2> -->';
        html += '<h3>Now, let’s quickly test how far away you are sitting.</h3>';
        html += '<p>You might know that vision tests at a doctor’s practice often involve chinrests; the doctor basically asks you to sit away from a screen in a specific distance. We do this here with a “virtual chinrest”.</p>';
        
        html += '<h3>Instructions</h3>';
        html += '<p>1. Put your finger on <b>space bar</b> on the keyboard.</p>';
        html += '<p>2. Close your right eye. <em>(Tips: it might be easier to cover your right eye by hand!)</em></p>';
        html += '<p>3. Using your left eye, focus on the black square.</p>';
        html += '<p>4. Click the button below to start the animation of the red ball. The <b style="color: red">red ball</b> will disappear as it moves from right to left. Press the “Space” key as soon as the ball disappears from your eye sight.</p><br>';
        html += '<p>Please do it <b>five</b> times. Keep your right eye closed and hit the “Space” key fast!</p><br>';
        html += '<button class="btn btn-primary" id="start" ">Start</button>';

        html += '<div id="svgDiv" style="width:1000px;height:200px;"></div>';
        html +=  "Hit 'space' <div id='click' style='display:inline; color: red; font-weight: bold'>5</div> more times!</div>";

        // html += "<div id='info' style='visibility:hidden'>";
        
        // html += '<h3 id="info-h">Estimated viewing distance (cm): </h3>'; // info-h appends data in recordPosition function
        // html += "<p id='info-p'>View more output data in the Console in your browser's developer/inspector view.</p></div></div></body>";

    display_element.innerHTML = html; //
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
                
            //     <div id="container">
            //         <div id="slider"></div>
            //         <br>
            //         <img id="card" src="card.png" style="width: 50%">
            //         <br><br>
            //         <button class="btn btn-primary" onclick="configureBlindSpot()">Click here when you are done!</button>
            //     </div>
            // </div>
    

    function after_response(response_info){
      // rt.push(response_info.rt); // response time of the key
      
      end_trial();
    }

    function end_trial(){
      // trial_data.viewingDistance=   JSON.stringify(viewingDistance); // best practice for saving in jsPsych. It is a JSON instead of array.
      jsPsych.finishTrial(trial_data); // ends trial and save the data
      display_element.innerHTML = ' '; // clear the display

    }
    show_stimulus();

  };

  return plugin;
})();


