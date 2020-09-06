function fun_generate_one_stim(NN,stim,cfg,filename)
    if nargin < 4
        filename = 'test.jpg';
    end

    n   = stim(NN).n;   % Number of stimuli
    nx  = stim(NN).nx;  % Grid size (number of cells)
    ny  = stim(NN).ny;  % Grid size (number of cells)
    gs  = cfg.gridSize / nx;
    p   = stim(NN).p;   % Stimuli positions 

    if strcmp(cfg.PrintSize,'tight')
        cfg.screenXpixels   = cfg.gridSize + gs;
        cfg.screenYpixels   = cfg.gridSize + gs;
        cfg.windowRect      = [0 0 cfg.screenXpixels cfg.screenYpixels];
        cfg.xCenter         = cfg.screenXpixels/2;
        cfg.yCenter         = cfg.screenYpixels/2;
    end
    
    P   = p*gs + repmat([cfg.xCenter cfg.yCenter] - [cfg.gridSize cfg.gridSize]/2,n,1);
    clf; 
    set(gcf,'Position',[100 100 100+cfg.screenXpixels 100+cfg.screenYpixels]); 
    axes('Position',[0 0 1 1])
    set(gca,'Visible','off')
    set(gca,'XLim',[0 cfg.screenXpixels],'YLim',[0 cfg.screenYpixels]); 
    hold on
        for i = 1:n
            ht = text(P(i,1),P(i,2),stim(NN).content{i});
            set(ht,'Color','k','FontSize',cfg.FontSize,'FontName',cfg.FontName,...
                'HorizontalAlignment','center','VerticalAlignment','middle')
            hc = fun_plot_circle(P(i,1),P(i,2),cfg.sizeOval);
            set(hc,'Color','k','LineWidth',1.5)
        end
    hold off

    % control the image pixel size by manipulating the paper size and number of dots per inch
    output_size = [cfg.screenXpixels cfg.screenYpixels];%Size in pixels
    resolution = 100;%Resolution in DPI
    set(gcf,'paperunits','inches','paperposition',[0 0 output_size/resolution]);
    % use 300 DPI
    set(gca,'Color',cfg.grey*[1,1,1]); 
    set(gcf,'Color',cfg.grey*[1,1,1]); 
    set(gcf,'InvertHardCopy','Off');
    print(filename,'-djpeg',['-r' num2str(resolution)]);
