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

directorio = dir([tmt_online_path '\data\data_piloto']); 
dirnames = {directorio.name}; 
dirnames = dirnames(3:end);

%% Reading one csv 

% Hay que automatizar esto para que levante todos los archivos, recorriendo
% dirnames por ejemmplo

N_subj = 12;

my_csv = [tmt_online_path 'data\' dirnames{N_subj}];
% my_csv = [tmt_online_path 'data\' 'tmt-liaa-150.csv'];

% Levanto el csv como una tabla.
T = readtable(my_csv);  

%% Reading all CSVs

if 0 

    d=dirnames(1:end);   % dir struct of all pertinent .csv files
    n=length(d);  % how many there were

    my_csv = [tmt_online_path 'data\' 'tmt-liaa-197.csv'];
    t1 = readtable(my_csv);

    rt = t1.rt;

    my_csv = [tmt_online_path 'data\'];

    for i=1:n
      file  = strcat(my_csv, d(i));
      t2 = readtable(file{1});

    %   t1colmissing = setdiff(t2.Properties.VariableNames, t1.Properties.VariableNames);
    %   t2colmissing = setdiff(t1.Properties.VariableNames, t2.Properties.VariableNames);
    %   t1 = [t1 array2table(nan(height(t1), numel(t1colmissing)), 'VariableNames', t1colmissing)];
    %   t2 = [t2 array2table(nan(height(t2), numel(t2colmissing)), 'VariableNames', t2colmissing)];

        rt = [rt; t2.rt]; 

    %   data(i)= readtable(file{i});  % read each file
    end
end

%% LEVANTANDO LOS RT DE TODOS LOS SUJETOS
rt_A_todos = zeros(10,length(dirnames));
rt_B_todos = zeros(10,length(dirnames));

%Arranca en 2 porque el primero tiene menos trials por alguna razon.
for fili = 2:length(dirnames)
    my_csv = [tmt_online_path 'data\' dirnames{fili}];
    T = readtable(my_csv);
    trials = table2struct(T);
    response_time = zeros(20,1);
    % Va de 6 a 25 porque son las 20 filas que tienen los trials
    i = 1;
    for timi = 6:25
        response_time(i) = str2double(trials(timi).rt);
        i = i + 1;
    end
    
    rt   = zeros(floor(length(response_time)),1);
    rt_A = zeros(floor(length(response_time)/2),1);
    rt_B = zeros(floor(length(response_time)/2),1);


    %Separo trials A y B
    for tr = 1:length(response_time)
        rt(tr) = response_time(tr);
        if rem(tr , 2) == 1
            disp(['En el trial  ' num2str(tr)  ' entro a  rem(tr , 2) == 1'])
            rt_A(tr) = response_time(tr);
            disp(['rt_A  ' num2str(rt_A(tr)) ])
        else
            disp(['En el trial  ' num2str(tr)  ' entro a  rem(tr , 2) == 0'])
            rt_B(tr) = response_time(tr);
            disp(['rt_B  ' num2str( rt_B(tr)) ])
        end
    end
    
    
    rt_A_todos(:,fili) = nonzeros(rt_A);
    rt_B_todos(:,fili) = nonzeros(rt_B);
    
end


rt_A_reshape = reshape(rt_A_todos,[1,size(rt_A_todos,2)*size(rt_A_todos,1)]);
rt_A_reshape = nonzeros(rt_A_reshape);

%filtro muy altos y muy bajos
% rt_A_reshape = rt_A_reshape(rt_A_reshape<50000)
% rt_A_reshape = rt_A_reshape(rt_A_reshape>10000)

% Paso de ms a segundos
rt_A_reshape = rt_A_reshape/1000;

%Media
M_A = mean( rt_A_reshape , 'omitnan' );
mean_mean_A = mean(M_A)/1000;

% M_A_median = median( rt_A_reshape , 'omitnan' )/1000
% M_B_median = median( rt_B_reshape , 'omitnan' )/1000


rt_B_reshape = reshape(rt_B_todos,[1,size(rt_A_todos,2)*size(rt_A_todos,1)]);
rt_B_reshape = nonzeros(rt_B_reshape);

%filtro muy altos y muy bajos
% rt_B_reshape = rt_B_reshape(rt_B_reshape<50000)
% rt_B_reshape = rt_B_reshape(rt_B_reshape>10000)

% Paso de ms a segundos
rt_B_reshape = rt_B_reshape/1000;


% Media
M_B = mean( rt_B_reshape , 'omitnan' );
mean_mean_B = mean(M_B)/1000;



%% Box plot para todos los rt de A y todos los de B

figure(42)
x = [rt_A_reshape; rt_B_reshape];
g = [zeros(length(rt_A_reshape), 1); ones(length(rt_B_reshape),1)];
boxplot(x, g, 'labels',{'Trials A','Trials B'})
h=findobj(gca,'tag','Outliers'); % Get handles for outlier lines.
set(h,'Marker','o'); % Change symbols for all the groups.
set(h(1),'MarkerEdgeColor','b'); % Change color for one group
xlabel('Type of trial')
ylabel('Response time (seg)')
title('Todos los rt de A y B para el online')

[P,H,STATS] = ranksum(rt_A_reshape,rt_B_reshape)

%% Box plot para todos los promedios de A y promedios de B

M_B = nonzeros(mean( rt_B_todos , 'omitnan' )/1000);
M_A = nonzeros(mean( rt_A_todos , 'omitnan' )/1000);


figure(43)
x = [M_A; M_B];
g = [zeros(length(M_A), 1); ones(length(M_B),1)];
boxplot(x, g, 'labels',{'Trials A','Trials B'})
h=findobj(gca,'tag','Outliers'); % Get handles for outlier lines.
set(h,'Marker','o'); % Change symbols for all the groups.
set(h(1),'MarkerEdgeColor','b'); % Change color for one group
xlabel('Type of trial')
ylabel('Response time (seg)')
title('Todos los promedios de A y B para el online')

[P,H,STATS] = ranksum(M_A,M_B)

%% Box plot para datos de TMT papel

%Los cargo a manopla:
tmt_A = {0;29.5800000000000;34.1500000000000;31.3700000000000;33.7600000000000;0;35.3200000000000;
    32.0600000000000;24.2100000000000;22.3600000000000;25.6000000000000;26.9800000000000;29.2100000000000};

tmt_B = {0;71.3500000000000;47.3500000000000;75.0400000000000;40.2900000000000;0;52.6500000000000;
    46.6600000000000;46.0100000000000;35.2200000000000;44.6100000000000;41.5500000000000;34.5600000000000};

%de celda a matriz
tmt_A = nonzeros(cell2mat(tmt_A));
tmt_B = nonzeros(cell2mat(tmt_B));

figure(45)
x = [tmt_A; tmt_B];
g = [zeros(length(tmt_A), 1); ones(length(tmt_B),1)];
boxplot(x, g, 'labels',{'Part A','Part B'})
h=findobj(gca,'tag','Outliers'); % Get handles for outlier lines.
set(h,'Marker','o'); % Change symbols for all the groups.
set(h(1),'MarkerEdgeColor','b'); % Change color for one group
xlabel('Part')
ylabel('Completion time (seg)')
title('Todos los rt de A y B para el TMT en papel')

[P,H,STATS] = ranksum(tmt_A,tmt_B)


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
screen_size_px                  = trials(4).screen_size_px;

%Save response times
% This is hard coded to get the 20 values
response_time = zeros(20,1);
i = 1;
for timi = 6:25
    response_time(i) = str2double(trials(timi).rt);
    i = i + 1;
end

%Screen size to numbers
screen_size_array = strsplit(screen_size_px,{','},'CollapseDelimiters',true);

screen_size_final = zeros(1,length(screen_size_array));

for dimi = 1:length(screen_size_array)
    if rem(dimi , 2) == 1
        screen_size_final(dimi) = str2double(screen_size_array{dimi});
    end
end

screen_size_final = nonzeros(screen_size_final)';
    
%Saco los que no tienen data, en el csv aparece " en esa posicion.
% El problema con esto es que si en algun trial no hay dato de mouse
% borra la fila. Por eso agarre los tiempos de respuesta antes en
% response_time
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

% Meta-data
% resolucion de pantalla de la computadora donde se realizo el experimento
screen_size = screen_size_final; 


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
%       for tr = 5
        subplot(2,10,tr)
%         
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
            xlabel('witdth (px)')
            ylabel('heigth (px)')
            
    end
    
%% Analisis exploratorios


%% rt

rt   = zeros(floor(length(response_time)),1);
rt_A = zeros(floor(length(response_time)/2),1);
rt_B = zeros(floor(length(response_time)/2),1);

%rt   = Todos
%rt_A = Trials A
%rt_B = Trials B


% for tr = 1:length(trials)
for tr = 1:length(response_time)
    rt(tr) = response_time(tr);
    if rem(tr , 2) == 1
        disp(['En el trial  ' num2str(tr)  ' entro a  rem(tr , 2) == 1'])
        rt_A(tr) = response_time(tr);
        disp(['rt_A  ' num2str(rt_A(tr)) ])
    else
        disp(['En el trial  ' num2str(tr)  ' entro a  rem(tr , 2) == 0'])
        rt_B(tr) = response_time(tr);
        disp(['rt_B  ' num2str( rt_B(tr)) ])
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
% filtrar, habra una manera de elegir ese numero con algun criterio menos a ojo?:
rt = rt(rt>10);
% rt(~isnan(rt))
rt_A = rt_A(rt_A>10);
% rt_A(~isnan(rt_A))
rt_B = rt_B(rt_B>10);
% rt_B(~isnan(rt_B))

% estadistica basica para todos los datos de rt, para los de trials A y para
% los de trials B
mean_all = mean(rt);
std_all = std(rt);

mean_A = mean(rt_A);
std_A = std(rt_A);

mean_B = mean(rt_B);
std_B = std(rt_B);

disp(['En general tardó '      num2str(mean_all)    ' ± ' num2str(std_all) ' segundos' ])
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










    
    
    