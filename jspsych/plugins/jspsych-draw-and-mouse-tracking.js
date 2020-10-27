jsPsych.plugins['draw-and-mouse-tracking'] = (function(){

    var plugin = {};
  
    plugin.info = {
      name: 'draw-and-mouse-tracking',
      parameters: {
      }
    }
  
    plugin.trial = function(display_element, trial){
      //display_element is a HTML DOM element

      //saving data
      let trial_data = {
        //parameter_name = 'parameter value';
        words: trial.words
      };

      function show_stimulus(){
        display_element.innerHTML = '<p>' + trial.words + '</p>';

      };

      show_stimulus();

      // end trial
      jsPsych.finishTrial(trial_data);
    }
  
    return plugin;
  
  })();