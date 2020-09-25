function fun_plot_background_stim(tr,trials)
    plot([0 trials(tr).stim_cfg.screenXpixels],[0 0],'k-','LineWidth',2)
    plot([0 trials(tr).stim_cfg.screenXpixels],[trials(tr).stim_cfg.screenYpixels trials(tr).stim_cfg.screenYpixels],'k-','LineWidth',2)
    plot([0 0],[0 trials(tr).stim_cfg.screenYpixels],'k-','LineWidth',2)
    plot([trials(tr).stim_cfg.screenXpixels trials(tr).stim_cfg.screenXpixels],[0 trials(tr).stim_cfg.screenYpixels],'k-','LineWidth',2)
    for i = 1:trials(tr).stim.n
        ht = text(trials(tr).stim.P(i,1),trials(tr).stim.P(i,2),...
            trials(tr).stim.content{i});
        set(ht,'Color','k','FontSize',trials(tr).stim_cfg.FontSize,...
            'FontName',trials(tr).stim_cfg.FontName,...
            'HorizontalAlignment','center','VerticalAlignment','middle')
        hc = fun_plot_circle(trials(tr).stim.P(i,1),trials(tr).stim.P(i,2),...
            trials(tr).stim_cfg.sizeOval);
        set(hc,'Color','k','LineWidth',1.5)
    end
end
