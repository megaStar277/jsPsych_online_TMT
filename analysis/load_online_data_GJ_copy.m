%% Load data
clear all 
close all
clc

% pc = 'juank-laptop';
pc = 'gustavo-laptop';

switch pc
    case 'gustavo-laptop'
        cd('C:\Users\Gustavo\Dropbox\TMT\analisis_online/');
        
    case 'juank-desktop'
        cd('/home/juank/Dropbox/TMT/analisis_online');
end
        
file = which('load_online_data_GJ_copy.m');
tmt_online_path = file(1:end-26);
tmt_path = file(1:end-42);

% addpath
addpath(genpath(tmt_path));

%Go to directory
% cd tmt_online_path

directorio = dir([tmt_online_path '\data']); 
dirnames = {directorio.name}; 
dirnames = dirnames(3:end);

%% Reading csv

% Hay que automatizar esto para que levante todos los archivos, recorriendo
% dirnames por ejemmplo

my_csv = [tmt_online_path 'data\' 'tmt-liaa-172.csv'];
% my_csv = [tmt_online_path 'data\' 'tmt-liaa-150.csv'];

% Levanto el csv como una tabla.
T = readtable(my_csv);  


%% Creando el trial

% survey-html-form = Datos del sujetx
% fullscreen  = va a pantalla completa
% resize = Primera vez donde hay que poner la tarjeta en la pantalla.
% virtual-chin = Segunda vez donde hay que poner la tarjeta + blindspot
% N veces psychophysics = Los trials del TMT
% html-keyboard-response = Pantalla de agradecimiento.

estructura_trial = {'survey-html-form';'fullscreen';'resize';'virtual-chin';'psychophysics';'psychophysics';'psychophysics';
                    'psychophysics';'psychophysics';'psychophysics';'psychophysics';'psychophysics';'psychophysics';
                    'psychophysics';'psychophysics';'html-keyboard-response'};

                
%Convierto a la tabla en struct (quiza no sea necesario levantarlo como tabla, pero es la solucion que encontre por ahora)
trials = table2struct(T);

%Guardo antes de borrar (el ultimo trial con el saludo no tiene info de
%utilidad, asi que no lo guardo) - Hay mas datos que no estoy guardando.
browser                         = trials(1).browser;
info_participante               = trials(1).responses;
fullscreen_on                   = trials(2).success;
resize_finalWidthPx             = trials(3).final_width_px;
resize_scaleFactor              = trials(3).scale_factor;
virtualChin_cardWidthPx         = trials(4).cardWidth_px;
virtualChin_ViewingDistanceCm   = trials(4).viewing_distance_cm;
  
%Saco los que no tienen data, en el csv aparece " en esa posicion
trials(arrayfun(@(x) contains(x.position, '"'),trials)) = [];

%Luego de iterar queda agregado a la estructura 'trials':
% xy: Coordenadas del mouse
% srate: sampling rate

        for tr = 1:length(trials)
            if ~isempty(trials(tr).position)    
                parentesis = strsplit(trials(tr).position,{'),('},'CollapseDelimiters',true);
                parentesis{1} = parentesis{1}(2:end);
                parentesis{end} = parentesis{end}(1:end-1);
                xy = nan(length(parentesis),2);

                for i = 1:length(parentesis)
                    xy(i,:) = sscanf(parentesis{i},'%d,%d')'; 
                    
                end
                trials(tr).xy = xy;
                trials(tr).srate = (trials(tr).rt - 1000) / size(trials(tr).xy,1); %Ojo con el srate porque cuenta desde que se presenta la cruz 
                                                                                   %(que en este caso duro 1000 ms)
            end
        end
  

%% Graficar 

% Meta-data (no estoy seguro para que se usa esto) -- Por lo visto es la
% resolucion de pantalla de la computadora donde se realizo el experimento
screen_size = [1600 900];  % De donde sacamos este dato para los sujetos?? Algo con el view distance? los pixeles?

% Ntr = 0
% for ele = 1:length(trials)
%     if ~isempty(trials(ele).position)
%         Ntr = Ntr + 1;
%     end
% end

Ntr = length(trials);

figure(1); clf
    set(gcf,'Color','w')
    for tr = 1:Ntr
%       for tr = 3
        subplot(2,10,tr)
        
            x = trials(tr).xy(:,1);
            y = trials(tr).xy(:,2);
            
            click_x = str2double(trials(tr).click_x);      
            click_y = str2double(trials(tr).click_y);
  
            cols = rainbow_colors(length(x));
            hold on
            
                plot(click_x,click_y,'ko','LineWidth',3,'MarkerSize',10)
                scatter(x,y,5,cols,'filled')
                
            hold off
            box on
            set(gca,'YDir','reverse','XAxisLocation','top')
            set(gca,'XLim',[0 screen_size(1)],'YLim',[0 screen_size(2)])
            
    end
    
%% Analisis exploratorios

%% rt

rt   = zeros(length(trials),1);
rt_A = zeros(length(trials)/2,1);
rt_B = zeros(length(trials)/2,1);

%rt   = Todos
%rt_A = Trials A
%rt_B = Trials B

for tr = 1:length(trials)
    rt(tr) = str2double(trials(tr).rt);
    if rem(tr , 2) == 1
        rt_A(tr) = str2double(trials(tr).rt);
    else
        rt_B(tr) = str2double(trials(tr).rt);
    end
end
        

%from ms to sec 
rt = rt/1000;
rt_A = nonzeros(rt_A/1000);
rt_B = nonzeros(rt_B/1000);

%Filtro los trials donde no se presento la imagen debido a un error. Eso se
%puede ver en los graficos, pero me imagino que podriamos usar algun filtro
%como por ejemplo que haya pasado mucho tiempo o que haya pocos datos de la
%posicion del mouse. Porque podria ser el caso de que la persona haya
%apretado el click dos veces seguidas y se le haya pasado el trial por
%ejemplo.

% En este caso los trials que tardaron menos de 10 segundos sirve para
% filtrar:
rt = rt(rt>10);
rt_A = rt_A(rt_A>10);
rt_B = rt_B(rt_B>10);

% estadistica basica para todos los datos de rt, para los de trials A y para
% los de trials B
mean_all = mean(rt);
std_all = std(rt);

mean_A = mean(rt_A);
std_A = std(rt_A);

mean_B = mean(rt_B);
std_B = std(rt_B);

disp(['En general tardó '        num2str(mean_all)  ' ± ' num2str(std_all) ' segundos' ])
disp(['En los trials tipo A tardó ' num2str(mean_A) ' ± ' num2str(std_A) ' segundos' ])
disp(['En los trials tipo B tardó ' num2str(mean_B) ' ± ' num2str(std_B) ' segundos' ])

%Histogramas

figure(2); clf

        subplot(1,3,1)
            histogram(rt,10,'Normalization','pdf')
            xlabel('Tiempo (s)')
            N_all = length(rt); %nro de trials de rt
            title(sprintf('Response time - ALL \n  N = %d', N_all))
            box on

        subplot(1,3,2)
            histogram(rt_A,5,'Normalization','pdf')
            xlabel('Tiempo (s)')
            N_A=length(rt_A); %nro de trials de rt A
            title(sprintf('Response time - A \n  N = %d', N_A))
            box on


        subplot(1,3,3)
            histogram(rt_B,5,'Normalization','pdf')
            xlabel('Tiempo (s)')
            N_B = length(rt_B); %nro de trials de rt B
            title(sprintf('Response time - B \n  N = %d', N_B))
            box on










    
    
    