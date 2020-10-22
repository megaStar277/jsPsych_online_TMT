jsPsych.plugins['plugin-name'] = (function(){

    var plugin = {};
  
    plugin.info = {
      name: 'plugin-name',
      parameters: {
      }
    }
  
    plugin.trial = function(display_element, trial){
      jsPsych.finishTrial();
    }
  
    return plugin;
  
  })();