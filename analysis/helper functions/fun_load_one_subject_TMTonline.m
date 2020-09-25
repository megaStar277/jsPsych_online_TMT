function [trials,subj_info,cfg] = fun_load_one_subject_TMTonline(T)
% 1. Loads information from a table 
% 2. Parse the data
% 3. Generates a 'trial' struct
% 4. Takes position of cursor 
% 5. Add stimuli from 'stim_thr040_nooverlap_100trials_20181127.mat'
% 6. Scale stimuli
%           szx  - x resized
%           szy  - y resized  
%           px   - x pixels 
%           py   - y pixels
%           cx   - x click position in scaled screen
%           cy   - y click position in scaled screen
%           dx   - x position in scaled screen
%           dy   - y position in scaled screen

    try
        trials              = table2struct(T);
        
        % {trials.trial_type} = {{'survey-html-form'}    {'fullscreen'}    {'resize'}    {'virtual-chin'}    {'psychophysics'} ...}
        subj_info.run_id    = trials(1).run_id;
        cfg.run_id          = trials(1).run_id;
        
        indTrial = find(strcmp({trials.trial_type},'survey-html-form'));    
        if ~isempty(indTrial)
            str=trials(indTrial).responses;
            str(strfind(str,'-'))=[];
            str(strfind(str,'"'))=[];
            str(strfind(str,'{'))=',';
            str(strfind(str,'}'))=',';
            indend=strfind(str,',');
            indini=strfind(str,':');
            for i = 1:length(indini)
                if strcmp( str( (indend(i)+1):(indini(i)-1) ) , 'age' )
                    subj_info.( str( (indend(i)+1):(indini(i)-1) ) ) = str2double( str( (indini(i)+1):(indend(i+1)-1) ) );
                else
                    subj_info.( str( (indend(i)+1):(indini(i)-1) ) ) = str( (indini(i)+1):(indend(i+1)-1) );
                end
            end

            subj_info.recorded_at   = trials(indTrial).recorded_at;
            subj_info.ip            = trials(indTrial).ip;
            subj_info.user_agent    = trials(indTrial).user_agent;
            subj_info.device        = trials(indTrial).device;
            subj_info.browser       = trials(indTrial).browser;
            subj_info.browser_version = trials(indTrial).browser_version;
            subj_info.platform      = trials(indTrial).platform;
            subj_info.platform_version = trials(indTrial).platform_version;
            trials(indTrial) = [];
        end

        indTrial = find(strcmp({trials.trial_type},'resize'));    
        if ~isempty(indTrial)
            if strcmp(trials(indTrial).final_height_px,'"')
                cfg.final_height_px = nan;
            else
                cfg.final_height_px = str2double(trials(indTrial).final_height_px);
            end
            if strcmp(trials(indTrial).final_width_px,'"')
                cfg.final_width_px  = nan;
            else
                cfg.final_width_px  = str2double(trials(indTrial).final_width_px);
            end
            cfg.scale_factor        = str2double(trials(indTrial).scale_factor);
            trials(indTrial) = [];
        end
        
        indTrial = find(strcmp({trials.trial_type},'virtual-chin'));    
        if ~isempty(indTrial)
            cfg.viewing_distance_cm = str2double(trials(indTrial).viewing_distance_cm); 

            cfg.cardWidth_px        = str2double(trials(indTrial).cardWidth_px);
            str = trials(indTrial).screen_size_px;
            ind = strfind(str,',');
            cfg.screen_size_px  = [str2double( str( 1:ind(1)-1 ) ), ...
                                    str2double( str( ind(2)+1:end ) )];
            trials(indTrial) = [];
        end

        tmp         = find(strcmp({trials.trial_type},'psychophysics'));
        indTrial    = tmp(1);
        if ~isempty(indTrial)
            cfg.avg_frame_time      = str2double(trials(indTrial).avg_frame_time);
            trials(indTrial) = [];
        end

        indTrial = find(strcmp({trials.trial_type},'fullscreen'));    
        if ~isempty(indTrial)
            trials(indTrial) = [];
        end
        
        indTrial = find(strcmp({trials.trial_type},'html-keyboard-response'));    
        if ~isempty(indTrial)
            trials(indTrial) = [];
        end

        trials = rmfield(trials,{'responses',...
            'recorded_at','ip','user_agent','device',...
            'browser','browser_version',...
            'platform','platform_version',...
            'final_height_px','final_width_px','scale_factor',...
            'viewing_distance_cm','cardWidth_px','screen_size_px',...
            'avg_frame_time',...
            'stimulus'});

        for tr = 1:length(trials)
            matchStr    = regexp(trials(tr).position,'(\d+,\d+)','match');
            matchStr2   = regexp(matchStr,'\d+','match');
            trials(tr).x = nan(1,length(matchStr));
            trials(tr).y = nan(1,length(matchStr));
            for i = 1:length(matchStr)
                trials(tr).x(i)     = str2double(matchStr2{i}{1});
                trials(tr).y(i)     = str2double(matchStr2{i}{2});
            end
            
            trials(tr).rt           = str2double(trials(tr).rt)/1000;

            trials(tr).click_x      = str2double(trials(tr).click_x);
            trials(tr).click_y      = str2double(trials(tr).click_y);
            
            trials(tr).stim_cond    = trials(tr).file_name(end-4);
            trials(tr).stim_list    = trials(tr).file_name( strfind(trials(tr).file_name,'cond'):(strfind(trials(tr).file_name,'/stim_')-1) );
            trials(tr).stim_num     = str2num(trials(tr).file_name( (strfind(trials(tr).file_name,'/stim_')+6):(end-6) ));
            
        end
        
        trials = rmfield(trials,{'position','position_x','position_y',...
                            'mousePositionX','mousePositionY'});
        

        % Add stim
        load('../stim_online/stim_thr040_nooverlap_100trials_20181127.mat')

        stim_cfg = [];
        % Colors
        stim_cfg.white           = 1;
        stim_cfg.black           = 0;
        stim_cfg.grey            = 0.5000;

        % Screen
        stim_cfg.screenXpixels   = 1024;
        stim_cfg.screenYpixels   = 768;
        stim_cfg.windowRect      = [0 0 stim_cfg.screenXpixels stim_cfg.screenYpixels];
        stim_cfg.xCenter         = stim_cfg.screenXpixels/2;
        stim_cfg.yCenter         = stim_cfg.screenYpixels/2;
        stim_cfg.PrintSize       = 'expanded'; % 'tight';

        % Grid
        stim_cfg.sizeOval        = 10;
        stim_cfg.FontSize        = 10;
        stim_cfg.FontName        = 'Helvetica';
        stim_cfg.gridSize        = 660;

        % Stimuli content
        stim_cfg.stim_A          = {'1'  '2'  '3'  '4'  '5'  '6'  '7'  '8'  '9'  '10'  '11'  '12'  '13'  '14'  '15'  '16'  '17'  '18'  '19'  '20'};
        stim_cfg.stim_B          = {'1'  'A'  '2'  'B'  '3'  'C'  '4'  'D'  '5'  'E'  '6'  'F'  '7'  'G'  '8'  'H'  '9'  'i'  '10'  'J'};


        addpath('../stim_online/')
        for tr = 1:length(trials)
            NN = trials(tr).stim_num;

            trials(tr).stim_cfg = stim_cfg;
            if strcmp(trials(tr).stim_cond,'A')
                stim(NN).content = stim_cfg.stim_A;
            elseif strcmp(trials(tr).stim_cond,'B')
                stim(NN).content = stim_cfg.stim_B;
            end

            trials(tr).stim     = stim(NN);
            trials(tr).stim.P   = fun_generate_one_stim(NN,stim,stim_cfg,[],0);
        end
        
        % Scale path
        for tr = 1:length(trials)
            szx = cfg.screen_size_px(1)/cfg.scale_factor; %scale_factor = (pixels_unit_screen / trial.pixels_per_unit)*1.4
            szy = cfg.screen_size_px(2)/cfg.scale_factor;
            px  = trials(tr).x/cfg.scale_factor;
            py  = (cfg.screen_size_px(2)-trials(tr).y)/cfg.scale_factor;
            cx  = trials(tr).click_x/cfg.scale_factor;
            cy  = (cfg.screen_size_px(2)-trials(tr).click_y)/cfg.scale_factor;

            dx = (szx - trials(tr).stim_cfg.screenXpixels) / 2;
            dy = (szy - trials(tr).stim_cfg.screenYpixels) / 2;

            px  = px - dx;
            py  = py - dy;
            cx  = cx - dx;
            cy  = cy - dy;

            trials(tr).original_x       = trials(tr).x;
            trials(tr).original_y       = trials(tr).y;
            trials(tr).original_click_x = trials(tr).click_x;
            trials(tr).original_click_y = trials(tr).click_y;

            trials(tr).szx              = szx;
            trials(tr).szy              = szy;
            trials(tr).szdx             = dx;
            trials(tr).szdy             = dy;
            trials(tr).x                = px;
            trials(tr).y                = py;
            trials(tr).click_x          = cx;
            trials(tr).click_y          = cy;
        end
        
    catch ME
        keyboard
    end
    

end