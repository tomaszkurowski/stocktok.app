$(document).off('click', '[data-action="advanced-charting-fullscreen"]');
$(document).on('click','[data-action="advanced-charting-fullscreen"]',function(){  

    $('body').toggleClass('advanced-charting-fullscreen');
    stock_chart.reflow();
    
    if ($('body').hasClass('advanced-charting-fullscreen')){
        
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }else{
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }        
    }
});
$(document).off('click', '[data-action="advanced-charting-sketchpad"]');
$(document).on('click','[data-action="advanced-charting-sketchpad"]',function(){  
    /*
    if (!me){
        $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">Advanced Drawing</div><div class="description">Sorry, feature only for logged users</div></div></div>');                            
        return;
    }*/
    if ($('.popup-advanced-charting-sketchpad').length){
        $('#popup').html(''); $('.popup-btn').remove(); 
        $('body').removeClass('with-popup'); 
        $('body').removeClass('with-blur'); 
        $('.quick-tools .actions > div').removeClass('active');
        return;
    }
    
    $('body').addClass('with-popup with-blur');                            
    $('.popup-btn').remove();
    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur'); $('.quick-tools .actions > div').removeClass('active'); });                            
    button({ class: 'icon-btn popup-btn icon-redo' }, function(){ if (sketchpad) sketchpad.redo(); });
    button({ class: 'icon-btn popup-btn icon-undo' }, function(){ if (sketchpad) sketchpad.undo(); });
    button({ class: 'icon-btn popup-btn icon-refresh' }, function(){ if (sketchpad) sketchpad.clear(); });  
   
    $.ajax({
        url:"/extensions/entities/views/popups/advanced-charting/sketchpad.html",
        cache:false,
        success: function(data){ $("#popup").html(data); },
        error: function(e){ if (config.debug) console.log(e); }
    });
    
    $('.quick-tools .actions > div').removeClass('active');
    $(this).addClass('active');
    
    $('#sketchpad').addClass('active');
        $.getScript('/media/js/external/sketchpad'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version,function(){
            sketchpad = new Sketchpad({
                element:    '#sketchpad',
                width:      $('.graph-container .stock-price').width(),
                height:     $('.graph-container .stock-price').height(),
                color:      settings.design.color_text,
                penSize:    3
            });            
        });
});

$(document).off('click', '[data-action="advanced-charting-drawing"]');
$(document).on('click','[data-action="advanced-charting-drawing"]',function(){ 
    /*
    if (!me){
        $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">Advanced Drawing</div><div class="description">Sorry, feature only for logged users</div></div></div>');                            
        return;
    }*/
    if ($('.popup-advanced-charting-drawing').length){
        $('#popup').html(''); $('.popup-btn').remove(); 
        $('body').removeClass('with-popup'); 
        $('body').removeClass('with-blur'); 
        $('.quick-tools .actions > div').removeClass('active');
        return;
    }    
    
    $('#sketchpad').removeClass('active');
    $('.quick-tools .actions > div').removeClass('active');
    $(this).addClass('active');
    stock_chart.update({
            stockTools: {
                gui: {
                    visible: false,
                    placed:  true,
                    buttons:[ 
                        'simpleShapes', 
                        'lines', 
                        'crookedLines', 
                        'measure', 
                        'advanced', 
                        'toggleAnnotations', 
                        //'separator', 
                        'verticalLabels', 
                        'flags',                             
                        'typeChange', 
                        'fullScreen',                                 
                        'zoomChange', // Not working    
                        'indicators',  // on hold       
                        'currentPriceIndicator', 
                        'saveChart' // Next phase
                    ]
                }
            }
        });
        generate_graph();

    $('body').addClass('with-popup with-blur');                            
    $('.popup-btn').remove();
    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur'); $('.quick-tools .actions > div').removeClass('active'); });                            
    button({ class: 'icon-btn popup-btn icon-refresh' }, function(){ generate_graph(); if (sketchpad) sketchpad.clear(); });  
    $.ajax({
        url:"/extensions/entities/views/popups/advanced-charting/drawing.html",
        cache:false,
        success: function(data){ $("#popup").html(data); },
        error: function(e){ if (config.debug) console.log(e); }
    });  
});

$(document).off('touchstart', '.highcharts-annotation');
$(document).on('touchstart','.highcharts-annotation',function(){
    $(this).click();
});

$(document).off('mousemove', '.highcharts-axis-resizer');
$(document).on('mousemove','.highcharts-axis-resizer',function(){    
    if (stock_chart.get('prices') && stock_chart.get('volume')){
        var ratio = parseInt(stock_chart.get('prices').height/(parseInt(stock_chart.get('prices').height)+parseInt(stock_chart.get('volume').height))*100);
        updateSettings('graph_showprices_ratio',ratio);
    }
});
$(document).off('click', '.toggleTool');
$(document).on('click','.toggleTool',function(){
    $('.quick-tools > *:not(.actions)').toggle();
    $('.quick-tools').toggleClass('active');
});
$(document).off('click', '#stock_chart_range');
$(document).on('input','#stock_chart_range',function(){
    change_graph_range($(this).val());
});

/* Check if this is really needed */
$(document).off('click', '[data-label="view_stock_edit"]');
$(document).on('click','[data-label="view_stock_edit"]',function(){
    stock_graph_adaptive_height();
    setTimeout(function() {
        stock_chart.reflow();
    }, 20); 
});

function change_graph_touch(){
    stock_chart.reflow();
}
function change_graph_grid(){
    $('#stock-price').attr('grid',settings.graph_grid);
}
change_graph_grid();
function change_graph_fullscreen(){
    $('body').toggleClass('stock-price-pro-mode');
    stock_graph_adaptive_height();
    stock_chart.reflow();
}
function change_graph_tools(){
    stock_chart.update({
        stockTools: {
            gui: {
                visible: settings.graph_tools === true ? true : false,
                placed: settings.graph_tools === true ? true : false
            }
        }
    });
    stock_graph_adaptive_height();
    stock_chart.reflow();    
}
function change_graph_labels(){
    stock_chart.update({ 
        xAxis: {
            title:  { enabled: settings.graph_labels },
            labels: { enabled: settings.graph_labels },
            tickLength: 3
        },
        yAxis: {
            title:  { enabled: settings.graph_labels },
            labels: { enabled: settings.graph_labels },
            tickLength: settings.graph_labels === true ? 3 : 0
        }
    });    
    stock_chart.reflow();
}

function change_graph_range(val=1){
    //$('.range-selector .labels span').removeClass('selected');
    //$('.range-selector .labels span[data-id='+val+']').addClass('selected');

    settings.stock_chart_range = val;
    localStorage.setItem('settings',JSON.stringify(settings));

    stock_chart.rangeSelector.clickButton((settings.stock_chart_range),true);                                    
}
