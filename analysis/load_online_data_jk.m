%% Load data
clear all 
close all
clc

% pc = 'liaa-laptop';
pc = 'gustavo-laptop';
% 
switch pc
    case 'gustavo-laptop'
        cd('C:\Users\Gustavo\Dropbox\TMT\analisis_online/');
        
    case 'juank-desktop'
        cd('/home/juank/Dropbox/TMT/analisis_online');
        
    case 'liaa-laptop'
        cd('/home/liaa/Dropbox/TMT/analisis_online')
end
        
file = which('load_online_data_GJ_copy.m');
tmt_online_path = file(1:end-26);
tmt_path = file(1:end-42);

% addpath
addpath(genpath(tmt_path));

%Go to directory
% cd tmt_online_path

directorio = dir([tmt_online_path 'data/data_piloto']); 
dirnames = {directorio.name}; 
dirnames = dirnames(3:end);

%% Load files
% tmtpaper = fun_importfile_TMTpaper('sujetxs TMT online.csv');
tmp = GetGoogleSpreadsheet('1F_tMFNAvaEqlmClwFecAjhbZqVsnph_Dz3w-VsOP_R4');
tmtpaper = struct('run_id',tmp(2:end,1),'mail',tmp(2:end,2),'TMTenpapelA',tmp(2:end,3),'TMTenpapelB',tmp(2:end,4),'Genero',tmp(2:end,5));
for i = 1:length(tmtpaper)
    tmtpaper(i).run_id = str2double(tmtpaper(i).run_id);
    tmtpaper(i).TMTenpapelA = str2double(tmtpaper(i).TMTenpapelA);
    tmtpaper(i).TMTenpapelB = str2double(tmtpaper(i).TMTenpapelB);
end

%Aca se va a guardar toda la info del experimento online
tmtonline=[];

%Arranca en 2 porque el primero tiene menos trials por alguna razon.
% for fili = 2:length(dirnames)

%Lo corro para un solo sujeto
for fili = 20
    
    my_csv = [tmt_online_path 'data/' dirnames{fili}];
    fprintf('Processing participant %s (%d/%d)\n',dirnames{fili},fili,length(dirnames))
    T = readtable(my_csv);

    [trials, subj_info, cfg] = fun_load_one_subject_TMTonline(T);

    rt  = [trials.rt];
    cond= {trials.stim_cond};
    rt_A= rt(strcmp(cond,'A'));
    rt_B= rt(strcmp(cond,'B'));

    % Se podrían filtrar outliers, en el codigo viejo esta comentado <10s y
    % >50s
    rt(rt<10) = nan;
    rt_A(rt_A<10) = nan;
    rt_B(rt_B<10) = nan;
    
    tmtonline(fili).run_id  = subj_info.run_id;
    tmtonline(fili).n_A     = sum(~isnan(rt_A));
    tmtonline(fili).n_B     = sum(~isnan(rt_B));
    tmtonline(fili).mrt_A   = nanmedian(rt_A);
    tmtonline(fili).mrt_B   = nanmedian(rt_B);
    
    indsu = find([tmtpaper.run_id]==tmtonline(fili).run_id);
    if (~isempty(indsu) && tmtpaper(indsu).TMTenpapelA~=0 && tmtpaper(indsu).TMTenpapelB~=0)
        tmtonline(fili).paperrt_A   = tmtpaper(indsu).TMTenpapelA;
        tmtonline(fili).paperrt_B   = tmtpaper(indsu).TMTenpapelB;
    else
        tmtonline(fili).paperrt_A   = nan;
        tmtonline(fili).paperrt_B   = nan;
    end
end

tmtonline(1) = [];

%% Scanpaths
tr = 8;
a = figure(100); clf
    set(gcf,'Color','w')
    set(gcf,'Position', [70 185 1175 775])
    hold on
        fun_plot_background_stim(tr,trials)
        plot([0 trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],...
            [0 0]-[trials(tr).szdy trials(tr).szdy],      'r--','LineWidth',2)
        plot([0 trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],...
            [trials(tr).szy trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],  'r--','LineWidth',2)
        plot([0 0]-[trials(tr).szdx trials(tr).szdx],...
            [0 trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],    'r--','LineWidth',2)
        plot([trials(tr).szx trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],...
            [0 trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],    'r--','LineWidth',2)
        plot(trials(tr).x,trials(tr).y,'r-','LineWidth',2)
    hold off

figure(101); clf
    set(gcf,'Color','w')
    set(gcf,'Position', [500 185 1175 775])
    cols = rainbow_colors(length(trials(tr).x));
    hold on
        fun_plot_background_stim(tr,trials)
        scatter(trials(tr).x,trials(tr).y,5,cols,'filled')
    hold off
    set(gca,'Visible','off')
    axis tight
%% Plot all scanpaths
for tr = 1:20
    
%     a = figure(100); clf
%         set(gcf,'Color','w')
%         set(gcf,'Position', [70 185 1175 775])
%         hold on
%             fun_plot_background_stim(tr,trials)
%             plot([0 trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],...
%                 [0 0]-[trials(tr).szdy trials(tr).szdy],      'r--','LineWidth',2)
%             plot([0 trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],... 
%                 [trials(tr).szy trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],  'r--','LineWidth',2)
%             plot([0 0]-[trials(tr).szdx trials(tr).szdx],...
%                 [0 trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],    'r--','LineWidth',2)
%             plot([trials(tr).szx trials(tr).szx]-[trials(tr).szdx trials(tr).szdx],...
%                 [0 trials(tr).szy]-[trials(tr).szdy trials(tr).szdy],    'r--','LineWidth',2)
%             plot(trials(tr).x,trials(tr).y,'r-','LineWidth',2)
%         hold off
%     if tr ~= 8
    figure(tr); clf
        set(gcf,'Color','w')
        set(gcf,'Position', [500 185 1175 775])
        cols = rainbow_colors(length(trials(tr).x));
        hold on
            fun_plot_background_stim(tr,trials)
            scatter(trials(tr).x,trials(tr).y,5,cols,'filled')
        hold off
        set(gca,'Visible','off')
        axis tight
%     end
end

%% Figures
ind = find(~isnan([tmtonline.paperrt_A]));
figure(1); clf
    set(gcf,'Color','w')
    set(gcf,'Position',[950 290 670 670])
    subplot(1,2,1); 
        hold on
            title('Online')
            boxplot([[tmtonline(ind).mrt_A]' [tmtonline(ind).mrt_B]'])
        hold off
        box on
        set(gca,'XLim',[0.5 2.5],'XTick',[1 2],'XTickLabel',{'A','B'})
        set(gca,'YLim',[0 80],'YTick',[0:10:80])
        ylabel('Response time (s)')
    subplot(1,2,2); 
        hold on
            title('Paper')
            boxplot([[tmtonline(ind).paperrt_A]' [tmtonline(ind).paperrt_B]'])
        hold off
        box on
        set(gca,'XLim',[0.5 2.5],'XTick',[1 2],'XTickLabel',{'A','B'})
        set(gca,'YLim',[0 80],'YTick',[0:10:80],'YTickLabel',{})
        ylabel('Response time (s)')

[P,H,STATS] = ranksum([tmtonline(ind).mrt_A]',[tmtonline(ind).mrt_B]');
fprintf('RT A vs B (Online; RankSum): p = %0.4f, z = %0.2f, d.f. = %d\n',P,STATS.zval,length(ind)-1)
[P,H,STATS] = ranksum([tmtonline(ind).paperrt_A]',[tmtonline(ind).paperrt_B]');
fprintf('RT A vs B (Paper; RankSum): p = %0.4f, z = %0.2f, d.f. = %d\n',P,STATS.zval,length(ind)-1)

[P,H,STATS] = signrank([tmtonline(ind).mrt_A]',[tmtonline(ind).mrt_B]');
fprintf('RT A vs B (Online; SignRank): p = %0.4f, SignedRank = %0.2f, d.f. = %d\n',P,STATS.signedrank,length(ind)-1)
[P,H,STATS] = signrank([tmtonline(ind).paperrt_A]',[tmtonline(ind).paperrt_B]');
fprintf('RT A vs B (Paper; SignRank): p = %0.4f, SignedRank = %0.2f, d.f. = %d\n',P,STATS.signedrank,length(ind)-1)

figure(2); clf
    set(gcf,'Color','w')
    set(gcf,'Position',[950 290 670 670])
    subplot(1,2,1); 
        hold on
            plot([tmtonline(ind).mrt_A]',[tmtonline(ind).paperrt_A]','ro','MarkerSize',7,'lineWidth',2); hA=lsline();
            plot([tmtonline(ind).mrt_B]',[tmtonline(ind).paperrt_B]','bo','MarkerSize',7,'lineWidth',2); hB=lsline();
        hold off
        box on
        set(gca,'XLim',[0 80],'XTick',[0:10:80])
        set(gca,'YLim',[0 80],'YTick',[0:10:80])
        xlabel('RT online (s)')
        ylabel('RT paper (s)')
        legend([hA,hB],{'A','B'},'Location','SouthEast'); legend boxoff
        
[R,P] = corr([tmtonline(ind).mrt_A]',[tmtonline(ind).paperrt_A]','type','Spearman');
fprintf('RT Online vs Paper (A): rho = %0.2f, p = %0.4f, N = %d\n',R,P,length(ind))
[R,P] = corr([tmtonline(ind).mrt_B]',[tmtonline(ind).paperrt_B]','type','Spearman');
fprintf('RT Online vs Paper (B): rho = %0.2f, p = %0.4f, N = %d\n',R,P,length(ind))

    subplot(1,2,2); 
        hold on
            plot([tmtonline(ind).mrt_A]'./[tmtonline(ind).mrt_B]',...
                [tmtonline(ind).paperrt_A]'./[tmtonline(ind).paperrt_B]','ko','MarkerSize',7,'lineWidth',2); lsline()
        hold off
        box on
        xlabel('RT online (s)')
        ylabel('RT paper (s)')

[R,P] = corr([tmtonline(ind).mrt_A]'./[tmtonline(ind).mrt_B]',...
                [tmtonline(ind).paperrt_A]'./[tmtonline(ind).paperrt_B]','type','Spearman');
fprintf('RT Online vs Paper (A/B): rho = %0.2f, p = %0.4f, N = %d\n',R,P,length(ind))

        
        
    