function h = fun_plot_circle(x,y,r)
    if (length(r)==1 & length(x)>1)
        r = repmat(r,length(x),1);
    end
    th = 0:pi/50:2*pi;
    
    h = nan(length(x),1);
    for i = 1:length(x)
        xunit = r(i) * cos(th) + x(i);
        yunit = r(i) * sin(th) + y(i);
        h(i) = plot(xunit, yunit);
    end
end