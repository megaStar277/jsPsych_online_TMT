#  ![icon](https://liaa.dc.uba.ar/wp-content/uploads/2018/01/icon.png) jsPsych_online_TMT 

:brain: Digital version of the widely used Trail Making Test using [jsPsych](https://github.com/jspsych/jsPsych) library v6.1.0. Also:

* [jspsych-psychophysics](https://github.com/kurokida/jspsych-psychophysics) modified plugin.

* [Virtual chin rest](https://github.com/QishengLi/virtual_chinrest/) modified plugin.


The [Trail Making Test](https://en.wikipedia.org/wiki/Trail_Making_Test) is a neuropsychological test of visual attention and task switching. It consists of two parts in which the subject is instructed to connect a set of 25 dots as quickly as possible while still maintaining accuracy. The test can provide information about visual search speed, scanning, speed of processing, mental flexibility, as well as executive functioning. It is sensitive to detecting cognitive impairment associated with dementia, for example, Alzheimer's disease.

![Alt Text](https://github.com/GEJ1/jsPsych_online_TMT/blob/master/tmt_b_gif.gif)


Content
----------
* **TMT.html** - Main script with jsPsych experiment structure
* **analysis** - Matlab script for data analysis
  * [sigstar](https://github.com/raacampbell/sigstar) for lines and asterisks indicating significant differences between two groups 
  * [GetGoogleSpreadSheet](https://www.mathworks.com/matlabcentral/fileexchange/39915-getgooglespreadsheet)
* **stim_generator** - Matlab scripts for TMT stimuli generation. The stimuli are images with the TMT structure.

Credits
-------

[Applied Artificial Intelligence Laboratory](https://liaa.dc.uba.ar/), Departamento de Computación, Facultad de Ciencias Exactas y Naturales, Universidad de Buenos Aires and the Instituto de Investigación en Ciencias de la Computación, CONICET-UBA.
