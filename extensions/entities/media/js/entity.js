var current_stock  = '';
var current_market = '';
var entity = {};
var stock;
var stock_chart;
var market = mvc.view;
var symbol = mvc.controller;   

function reload_stock_price(){
    
    stock.daily_change            = parseFloat(stock.price - stock.open);
    stock.daily_change_percentage = parseFloat(((stock.price - stock.open) / stock.open) * 100).toFixed(2);
    
    $('.results-info .current-price').text(format_price(stock.price));
    $('.results-info .previous-price').text(format_price(stock.previous_price));
    
    $('.results-info .price-preview:not(.tooltip-hover) .price').text(format_price(stock.price));
    $('.results-info .price-preview:not(.tooltip-hover) .date').text(stock.last_updated_at);
    
    $('.results-info .current-volume').text(format_price(stock.volume));
    $('.results-info .daily-change').text(format_price(stock.daily_change,4));
    if (stock.daily_change>0){ $('.results-info .daily-change').attr('data-color','profit'); }
    if (stock.daily_change<0){ $('.results-info .daily-change').attr('data-color','loss'); }
    $('.results-info .daily-change-percentage').text(stock.daily_change_percentage);
    
    if (stock.daily_change_percentage>0){ $('.results-info .daily-change-percentage').attr('data-color','profit'); }
    if (stock.daily_change_percentage<0){ $('.results-info .daily-change-percentage').attr('data-color','loss'); }
    
    if (stock.historical && !stock.open){
        var last_element = stock.historical.length-1;
        stock.open_price = stock.historical[last_element][2];
    }
    $('.results-info .daily-max').text(format_price(stock.high),2);
    $('.results-info .daily-min').text(format_price(stock.low),2);
    $('.results-info .open-price').text(format_price(stock.open));
    return;
}

function generate_graph(){
    
    if (stock.intraday && stock.historical){
        
        if (settings.graph_type === 'ohlc'){
            stock.all_prices = stock.historical                        
        }else{
            if (stock.intraday !== 1){
                stock.historical[stock.historical.length-1][4]=stock.intraday[0][4]
                stock.all_prices = stock.historical.concat(stock.intraday);
            }else{
                stock.all_prices = stock.historical;
            }
        }                              
        if (config.debug) console.log('All prices');
        if (config.debug) console.log(stock.all_prices);        
        stock_chart.series[0].remove();
        stock_chart.addSeries({
            data: stock.all_prices,
            type: settings.graph_type,
            name: 'Prices',
            tooltip: {
                valueDecimals: 2,
                pointFormat: '{point.y}'
            }
        });       
        
        switch(settings.graph_type){
            case 'line':
                stock_chart.update({ 
                    plotOptions: { series: { lineWidth:settings.graph_line, color: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [ [0, '#00e691'], [0.5, '#0091e6'], [1, '#e63900'] ] } }},
                    rangeSelector: { 
                        selected: settings.stock_chart_range,
                        verticalAlign: 'bottom',
                        floating:true,
                        y:30,
                        buttons: [
                        {
                            type: 'day', count: 1, text: '1d',
                            dataGrouping: { units: [['hour', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',0); }}                            
                        },
                        {
                            type: 'week', count: 1, text: '1w',
                            dataGrouping: { units: [['hour', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',1); }}
                        },
                        {
                            type: 'month', count: 3, text: '3m',
                            dataGrouping: { units: [['day', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',3); }}
                        }, {
                            type: 'month', count: 6, text: '6m',
                            dataGrouping: { units: [['day', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',4); }}
                        },   
                        {
                            type: 'year', count: 1, text: '1y',
                            dataGrouping: { units: [['day', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',6); }}
                        }, {
                            type: 'all', text: 'All',
                            dataGrouping: { units: [['month', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',7); }}
                        }]
                    }                    
                });                    
            break;
            case 'ohlc':
            case 'candlestick':
                stock_chart.update({ 
                    plotOptions: { series: { lineWidth:1 }, color: {}, ohlc: { color: '#e63900', upColor:'#00e691' },candlestick: { color: '#e63900', upColor:'#00e691' } },
                    rangeSelector: { 
                        selected: settings.stock_chart_range,
                        verticalAlign: 'bottom',
                        floating:true,
                        y:30,
                        buttons: [
                        {
                            type: 'day', count: 1, text: '1d',
                            dataGrouping: { units: [['hour', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',0); }}                            
                        },
                        {
                            type: 'week', count: 1, text: '1w',
                            dataGrouping: { units: [['hour', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',1); }}
                        },
                        {
                            type: 'month', count: 1, text: '1m',
                            dataGrouping: { units: [['day', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',3); }}
                        }, {
                            type: 'month', count: 2, text: '2m',
                            dataGrouping: { units: [['day', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',4); }}
                        },   
                        {
                            type: 'year', count: 3, text: '1y',
                            dataGrouping: { units: [['month', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',6); }}
                        }, {
                            type: 'All', text: 'All',
                            dataGrouping: { units: [['year', [1]]] },
                            events: { click: function() { localStorage.setItem('stock-graph-range',7); }}
                        }]
                    }
                });
                $('.range-selector [data-id="3"]').text('1m');
                $('.range-selector [data-id="4"]').text('2m');
                $('.range-selector [data-id="5"]').text('1y');
                $('.range-selector [data-id="6"]').text('All');            
            break;
            case 'area':
                stock_chart.update({ 
                    plotOptions: { series: { lineWidth:settings.graph_line, color: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [ [0, settings.design.color_base], [0.5, settings.design.color_base], [1, settings.design.color_base] ] } }}
                });            
            break;
        }
        
        stock_graph_adaptive_height();
        stock_chart.reflow();                                    
        stock_chart.rangeSelector.clickButton((settings.stock_chart_range-1),true);              
    }                     
}
function main_info_tab(tabName,tabCode,tabIcon,tabInfoContent){
    var tabInfo = $('.template-info-tab.hide').clone().removeClass('hide');
    if (window.innerWidth>996) $(tabInfo).addClass('active');
    tabInfo.find('h2').text(tabName);
    tabInfo.find('.tab-content').attr('id','entity-'+tabCode);
    tabInfo.find('.tab-header').prepend('<div class="icon '+tabIcon+'"></div>');
    $('.entity-main-info-container').append(tabInfo);    
    var tooltips = [];
    tooltips['MarketCapitalization'] = "Refers to the <b>total value of all a company's shares</b> of stock. It is calculated by multiplying the price of a stock by its total number of outstanding shares.<br /><br />For example, a company with 20 million shares selling at $50 a share would have a market cap of $1 billion.";
    tooltips['EBITDA'] = "EBITDA stands for <b>E</b>arnings <b>B</b>efore Interest, <b>T</b>axes, <b>D</b>epreciation, and <b>A</b>mortization and is a metric used to evaluate a company’s operating performance. It can be seen as a proxy for cash flow from the entire company’s operations.";
    tooltips['PERatio'] = "The price-to-earnings ratio, or P/E ratio, is a metric to express how much investors are paying per every $1 of earnings.<br /><br />The market price (P) of a share of stock is the amount that investors are willing to pay to own it. <br /><br />Earnings per share (E) is a company's earnings over the last twelve months, divided by the average number of shares outstanding.<br /><br />If a company's shares are trading at $100 and its earnings per share is $5, then its P/E ratio would be 20. That means that a buyer of the share is investing $20 for every $1 of earnings.";
    tooltips['PEGRatio'] = "The price/earnings to growth ratio (PEG ratio) is a stock's price-to-earnings (P/E) ratio divided by the growth rate of its earnings for a specified time period. The PEG ratio is used to determine a stock's value while also factoring in the company's expected earnings growth, and it is thought to provide a more complete picture than the more standard P/E ratio.";
    tooltips['DividendShare'] = "A dividend is the distribution of some of a company's earnings to a class of its shareholders, as determined by the company's board of directors. Common shareholders of dividend-paying companies are typically eligible as long as they own the stock before the ex-dividend date.";
    tooltips['DividendYield'] = "The dividend yield, expressed as a percentage, is a financial ratio (dividend/price) that shows how much a company pays out in dividends each year relative to its stock price.";
    tooltips['ReturnOnAssetsTTM']='This value is the Income After Taxes for the trailing twelve months divided by the Average Total Assets, expressed as a percentage. Average Total Assets is calculated by adding the Total Assets for the 5 most recent quarters and dividing by 5.';    
    tooltips['EPSEstimateCurrentYear'] = "An earnings estimate is an analyst's forecast for a public company's future quarterly or annual earnings per share (EPS). Investors rely heavily on earnings estimates to gauge a company's performance and make investment decisions about it.";
    tooltips['OperatingMarginTTM']='This value measures the percent of revenues remaining after paying all operating expenses. It is calculated as the trailing 12 months Operating Income divided by the trailing 12 months Total Revenue, multiplied by 100';
    tooltips['ReturnOnEquityTTM']='This value is the Income Available to Common Stockholders for the trailing twelve months divided by the Average Common Equity and is expressed as a percentage. Average Common Equity is calculated by adding the Common Equity for the 5 most recent quarters and dividing by 5.';
    tooltips['RevenueTTM'] = "TTM revenue refers to a company's revenue over the trailing twelve months (TTM) of operations. This financial measure is sometimes overlooked by buyers who are focused more on a company's profitability and ability to generate EBITDA.<br /><br />However, it can be useful to determine if a company has seen top line growth and where the revenue growth is coming from. The trailing twelve months should be reviewed particularly if there has been a catalyst during the period such as an acquisition or introduction of a new product.";
    tooltips['BookValue']="The book value of a company is the net difference between that company's total assets and total liabilities, where book value reflects the total value of a company's assets that shareholders of that company would receive if the company were to be liquidated.";    
    tooltips['EarningsShare']="Earnings per share (EPS) is calculated as a company's profit divided by the outstanding shares of its common stock. The resulting number serves as an indicator of a company's profitability. It is common for a company to report EPS that is adjusted for extraordinary items and potential share dilution.<br /><br />The higher a company's EPS, the more profitable it is considered to be.";  
    $.each(tabInfoContent, function(label,value){          
        var tabInfoRow=$('.template-info-tab-row.hide').clone().removeClass('hide');
        // Mappings
        switch(label){
            case 'Sector':   value = value = '<a href="/entities/find-by?sector='+value+'">'+value+'</a>'; break;
            case 'Industry': value = value = '<a href="/entities/find-by?industry='+value+'">'+value+'</a>'; break;
            case 'MarketCapitalization': if (value===null) break; value = format_price(value); break;
            case 'MarketCapitalizationMln': return;
            case 'EBITDA': if (value===null) break; value=format_price(value); break;
            case 'RevenueTTM': if (value===null) break; value=format_price(value); break;
            case 'GrossProfitTTM': if (value===null) break; value=format_price(value); break;
            case 'BookValue': if (value===null) break; value=format_price(value); break;                        
            case 'profitMargin': if (value===null) break; value=value+ '%'; break;            
            case 'OperatingMarginTTM': if (value===null) break; value=value+ '%'; break;
            case 'ReturnOnAssetsTTM': if (value===null) break; value=value+ '%'; break;
            case 'ReturnOnEquityTTM': if (value===null) break; value=value+ '%'; break;                                   
            case 'WebURL': if (value===null) break; value = '<a href="'+value+'">'+value+'</a>'; break;
            case 'UpdatedAt': return;   
            case 'LogoURL': return;
            case 'Phone': if (value===null) break; value= '<a href="tel:'+value+'">'+value+'</a>'; break;
            case 'Description': if (value === null) break; value = '<div class="description-popup" data-value="'+value+'">'+(value.length>255 ? value.slice(0,255)+'... <span class="icon icon-navigate_next"></span>' : value)+'</div>'; break;
            case 'Address': if (value===null) break; value='<a href="https://www.google.com/maps?q='+value+'">'+value+'</a>'; break;
        } 
        if (label === 'CountryISO' && value !== 'NA'){
            label='Country';
            value='<img src="/media/img/flags/'+value+'.png" class="flag" alt="flag-'+value+'" loading="lazy" />';
        }
        
        if (tabCode === 'officers'){
            tabInfoRow.addClass('only-value');
            tabInfoRow.find('.value').html(value.Name+'<br /><span>'+value.Title+'</span>');
            tabInfoRow.find('.value').prepend('<div class="icon-btn icon-navigate_next1"></div>').bind('click',function(){
                window.open('https://www.google.com/search?q='+value.Name,'_blank');
            });;
            $('#entity-'+tabCode).append(tabInfoRow); 

        }else{
            tabInfoRow.addClass(label);
            tabInfoRow.find('.field-value').html(label);
            tabInfoRow.find('.value').html(value);
            if (tooltips[label]) tabInfoRow.addClass('with-tooltip').find('.tooltip-info').html(tooltips[label]);

            if (label==='Description') tabInfoRow.addClass('only-value'); 
            if (value && typeof value !== 'object' && value !== 'Unknown' && value !== 'NA' && value !== '<img src="/media/img/flags/NA.png" class="flag" alt="flag-'+value+'" loading="lazy" />') $('#entity-'+tabCode).append(tabInfoRow);
        }                         
    });
}
function widget_financial_graph(id,widget){
    if ($('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"]').length === 0){      
        var template = $('.template-widget > .widget').clone();
        $(template).attr('data-id',id);
        $(template).attr('data-type','financial_graph');
                                        
        $.each(widget, function(key,value){
            $(template).find('.edit [data-id="'+key+'"]').val(value);
        });          
        $('.page-view:not(.slick-cloned) .widgets').append($(template));   
    }  
    if (!widget.hasOwnProperty('scope') && !widget.hasOwnProperty('range')) return;
    if (widget.scope===null || widget.range===null) return;
    var title = (widget.scope).replace(/([A-Z])/g, ' $1').trim()+ ' ('+widget.range+')';
    $('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"]').find('.title h2').text(title);
    if (config.debug) console.log('Widget');
    if (config.debug) console.log(entity);
    var categories  = [];
    var data        = [];
    if (entity.info.Financials && entity.info.Financials.hasOwnProperty('Income_Statement')){   
        $('.widget[data-id="'+id+'"]').css('minHeight','300px');      
        $.each(entity.info.Financials.Income_Statement[widget.range], function(label,value){ 
            categories.push(label.substring(0,4)); 
            data.push(value[widget.scope]);
        });                                                
        categories.reverse();
        data.reverse();
        var options = {
            series: [{ data: data, name: widget.scope+" [Usd]"}],
            xaxis: {
                axisBorder:{ color: settings.design.color_bg },
                categories: categories,
                tickAmount: 4,
                labels:{
                    offsetY: 10
                }
            },
            yaxis: {
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { 
                    show: false,
                    formatter: function (value) {
                        return format_price(value) + " $";
                    },
                    offsetX: -10,
                    offsetY: 10
                }
              },
            colors: [settings.design.color_base],
            chart: {
                height: 300,
                type: (widget.chartType) ? widget.chartType : 'line',                       
                toolbar: { show: false },
                fontFamily: 'gotham-regular',
                foreColor: settings.design.color_label
            },
            dataLabels: {
                enabled:false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            grid: {
                borderColor: settings.design.color_bg,
                strokeDashArray: 2,
                padding:{
                    top:0,
                    right:0,
                    bottom:-10,
                    left:-12
                }
            },
            tooltip: {
                custom: function ({series, seriesIndex, dataPointIndex, w}) {   
                    if (config.debug) console.log('w');
                    if (config.debug) console.log(w);
                    $('[data-type="financial_graph"][data-id="'+id+'"] .x').html(w.globals.categoryLabels[dataPointIndex]);
                    $('[data-type="financial_graph"][data-id="'+id+'"] .y').text(format_price(series[seriesIndex][dataPointIndex],2));                                            
                    return;
                }
            },
        };
        $('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"] .graph').html('');
        new ApexCharts(document.querySelector('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"] .graph'), options).render();
        //graph.render();
    }else{
        $('.widget[data-id="'+id+'"]').hide();
    }
}
   
function stock_graph_adaptive_height(){
    if ($(window).width()>996){
        return;
    };                     
    if ($('.results-info').hasClass('editable')){ return; }
    if (!$('.results-info').hasClass('collapsed')){ return; }
    var optimal_graph_height = 10;
    optimal_graph_height += $('.footer-container').outerHeight();
    optimal_graph_height += $('.range-selector').outerHeight();
    if (!$('body').hasClass('stock-price-pro-mode')){
        optimal_graph_height += $('.results-info').outerHeight(); 
        optimal_graph_height += 25; 
    }
    optimal_graph_height += 20;               
    optimal_graph_height += ($('.editable .edit-view-actions').outerHeight() ? $('.editable .edit-view-actions').outerHeight()+15 : 0);         
    $('.chart.stock-price-container').height('calc(100vh - '+optimal_graph_height+'px)');        
}


$(document).ready(function(){
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (widgets.hasOwnProperty('results_info') && widgets.results_info.hasOwnProperty('collapsed') && widgets.results_info.collapsed === 'false'){
        $('.widget.results-info').removeClass('collapsed').find('.content').show();
    }else{
        $('.widget.results-info').addClass('collapsed');
    }        
});
$(document).ready(function(){
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (widgets.hasOwnProperty('results_info') && widgets.results_info.hasOwnProperty('hidden_fields')){
        $.each(widgets.results_info.hidden_fields,function(key,id){
            $('.results-info').find('.'+id).toggleClass('hide');
            $('.results-info').find('.label-'+id).toggleClass('hide');
            $('.results-info .edit input#v-'+id).prop('checked',false);
        });
    }
    $(':not(.slick-cloned) .changer-v2 select').each(function(){
        var id = $(this).attr('id');
        if (settings.hasOwnProperty($(this).attr('id'))){
            $(this).val(settings[id]);
        }
        if (config.debug) console.log('value selected: '+id+' '+settings[id]);
        if (config.debug) console.log(settings);
    });
});
function change_graph_touch(){
    switch (settings.graph_touch){
        case 'tooltip':
            stock_chart.update({ 
                xAxis: { crosshair: { snap: true } },
                yAxis: { crosshair: { snap: true } },
                tooltip: { enabled: true },
            });
            break;
        case 'ruler':
            stock_chart.update({ 
                xAxis: { crosshair: { snap:false } },
                yAxis: { crosshair: { snap:false } },
                tooltip: { enabled: false },
            });
            break;
        case 'void':
            stock_chart.update({ 
                xAxis: { crosshair: false },
                yAxis: { crosshair: false },
                tooltip: { enabled: false },
            });
            break;
    }
    stock_chart.reflow();
}
function change_graph_grid(){
    // Grid lines are controlled in CSS
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
                visible: settings.graph_tools === 'true' && !ios && !mobile ? true : false,
                placed: settings.graph_tools === 'true' && !ios && !mobile ? true : false
            }
        }
    });
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
    $('.range-selector .labels span').removeClass('selected');
    $('.range-selector .labels span[data-id='+val+']').addClass('selected');

    settings.stock_chart_range = val;
    localStorage.setItem('settings',JSON.stringify(settings));

    stock_chart.rangeSelector.clickButton((settings.stock_chart_range-1),true);                                    
}
function get_notes(){
    if (me){
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/me/notes',
                symbol: stock.symbol,
                market: stock.market
            },
            type: 'GET',
            dataType: 'JSON',
            cache: false,
            success: function(response){
                $('.my-notes .tab-content .notes').html('');
                
                if (!response.notes.length){
                    return;
                }
                
                $('.my-notes .counter').text(response.notes.length).addClass('active');
                
                $.each(response.notes, function(i,note){                        
                    let el = $('<div class="note"></div>');  
                    $(el).append('<div class="date label">'+note.created_at+'</div>');
                    $(el).append('<div class="body">'+note.body+'</div>');
                    $(el).prepend('<div class="actions"></div>');
                    $(el).find('.actions').append('<div class="icon-btn icon-settings" data-action="note-edit"></div>');
                    $(el).find('.actions').append('<div class="icon-btn icon-bin" data-action="note-delete"></div>');
                    
                    $(el).find('[data-action="note-delete"]').bind('click',function(){
                        $.ajax({
                            url: config.api_url,
                            data: { 
                                endpoint: '/me/notes',
                                id:note.id
                            },
                            type: 'DELETE',
                            dataType: 'JSON',
                            cache: false,
                            success: function(response){                  
                                get_notes();
                            }
                        }); 
                    });
                    $(el).find('[data-action="note-edit"]').bind('click',function(){
                        $('body').toggleClass('with-popup');                            
                        if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
                        $.ajax({
                            url:"/extensions/entities/views/popups/notes.html",
                            cache:false,
                            success: function(data){ 
                                $("#popup").html(data); 
                                $('.popup-notes #new-note').val(note.body).attr('data-id',note.id);
                            },
                            error: function(e){ if (config.debug) console.log(e); }
                        });                        
                    });                    
                    $('.my-notes .tab-content .notes').append(el);
                });
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
    }
}

              
$(document).ready(function(){
    
    if (mobile || ios) $('.graph-tools').hide();
    
    get_currencies(function(){
    $.ajax({
        url: config.api_url,
        data: { endpoint: '/entity', symbol: symbol, market:market },
        type: 'GET',
        dataType: 'JSON',
        cache:false,
        success: function(response){
            if (config.debug) console.log('entity');
            if (config.debug) console.log(response);
            stock = response.entity;

            if (market==='gpw') stock.currency = 'pln';
            else stock.currency = 'usd';

            $('.heading.stock-view .results-info-title h2').text(stock.symbol);
            $('.heading.stock-view-menu h2').text(stock.symbol);
            $('.heading.stock-view-dashboard-adjust-view h2').text(stock.symbol);

            $('.stock-view .results-info h2').text(stock.name);               
            $('.stock-view .results-info .logo-container').html((stock.logo ? '<img src="'+stock.logo+'" class="logo" alt="logo-'+stock.symbol+'" loading="lazy" height="auto" width="auto" />' : '<div class="logo no-img">'+stock.symbol+'</div>'));
            if (stock.market === 'forex'){
                $('.stock-view .results-info .logo-container').append('<img src="https://data.stocktok.online/logos/forex/nextGen/usd.webp?cache=632392078b3fa" class="secondary-logo" alt="logo-ron" loading="lazy" height="auto" width="auto" />');
            }

            if (stock.cover){
                $('.results-info').addClass('with-cover').prepend('<img src="'+stock.cover+'" class="cover" alt="cover-'+stock.symbol+'" loading="lazy" />');
            }

            $('.stock-view .results-info-table .value.symbol').text(stock.symbol);
            $('.stock-view .results-info-table .value.market').text(stock.market);

            if (stock.sector){ $('.stock-view .results-info-table .value.sector').html('<a href="/entities/find-by?sector='+stock.sector+'">'+stock.sector+'</a>').show();  }else{ $('.stock-view .results-info-table .value.sector, .stock-view .results-info-table .label-sector').hide(); }
            
            if (stock.industry){ $('.stock-view .results-info-table .value.industry').html('<a href="/entities/find-by?industry='+stock.industry+'">'+stock.industry+'</a>').show();
            }else{ $('.stock-view .results-info-table .value.industry, .stock-view .results-info-table .label-industry').hide(); }
            
            if (stock.low){ $('.stock-view .results-info-table .value.daily-min').text(format_price(stock.low));
            }else{ $('.stock-view .results-info-table .value.daily-min, .stock-view .results-info-table .label-daily-min').hide(); }
            
            if (stock.high){ $('.stock-view .results-info-table .value.daily-min').text(format_price(stock.high));
            }else{ $('.stock-view .results-info-table .value.daily-max, .stock-view .results-info-table .label-daily-max').hide(); }            
            
            if (!stock.volume){ $('.stock-view .results-info-table .value.current-volume, .stock-view .results-info-table .label-current-volume').hide(); }

            $('.stock-view .results-info .price-preview .price').text(format_price(stock.price));
            $('.stock-view .results-info .price-preview .currency').text(stock.currency);
            $('.stock-view .results-info .price-preview .date').text(format_date(Date.parse(stock.last_updated_at)));


            $('.page.stock-view .symbol').text(stock.symbol);

            $('.range-selector .labels span').removeClass('selected');
            $('.range-selector .labels span[data-id='+settings.stock_chart_range+']').addClass('selected');   
            $('.range-selector input').val(settings.stock_chart_range);
            $('.range-selector .labels span').bind('click',function(){
                let val = parseInt($(this).attr('data-id'));
                change_graph_range(val);
                $('#stock_chart_range').val(val);
            });

            if (stock.market === 'forex'){
                button({ 
                    class: 'icon-btn icon-calculator' }, 
                    function(){
                        $('body').toggleClass('with-popup');                            
                        if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); toggleHeading(); });                                                    
                        $.ajax({
                            url:"/extensions/entities/views/popups/calculator.html",
                            cache:false,
                            success: function(data){
                                                                
                                $("#popup").html(data);
                                $('#cc-currency1').append('<option value="'+stock.symbol+'" selected="SELECTED">'+stock.symbol+'</option>');
                            },
                            error: function(e){ if (config.debug) console.log(e); }
                        });
                    }
                );                        
            }    
            
            button({ 
                class: 'icon-btn icon-search2' }, 
                function(){ location.href='/entities'; });  

            if (me){
                button({ 
                    class: 'icon-btn icon-shopping_cart' }, 
                    function(){ 
                        var item = {};
                            item.market_currency    = stock.currency;       
                            item.symbol             = stock.symbol;
                            item.market             = stock.market;
                            item.price              = stock.price;
                            //item.last_updated_at    = $(this).parents('.item').find('.updated-at').text();
                            item.logo               = $('.results-info .logo-container').html();               

                        buy_sell_popup({ action:'buy', item:item });                     
                    }
                );                            
                button({ 
                    class: 'icon-btn '+(!stock.observed ? 'add-to-observed' : 'remove-from-observed')+' icon-bookmark'+(!stock.observed ? '_outline' : '1' ) }, 
                    function(el){ 
                        if (!stock.observed){

                            $.ajax({
                                url: config.api_url,
                                data: { endpoint:'/wallet/observed', 
                                        market:stock.market,
                                        symbol:stock.symbol
                                    },
                                type: 'POST',
                                dataType: 'JSON',
                                success: function(response){
                                    $('.add-to-observed').addClass('icon-bookmark1').removeClass('icon-bookmark_outline');                                        
                                    $('.add-to-observed').addClass('remove-from-observed').removeClass('add-to-observed');                                        
                                    stock.observed = true;
                                },
                                error: function(response){                            
                                    if (config.debug) console.log(response);
                                }
                            });                                                              
                        }else{
                            $.ajax({
                                url: config.api_url,
                                data: { 
                                    endpoint:'/wallet/observed', 
                                    symbol: stock.symbol,
                                    market: stock.market
                                },
                                type: 'DELETE',
                                dataType: 'JSON',

                                success: function(response){
                                    $('.remove-from-observed').addClass('icon-bookmark_outline').removeClass('icon-bookmark1');
                                    $('.remove-from-observed').addClass('add-to-observed').removeClass('remove-from-observed');
                                    stock.observed = false;
                                },
                                error: function(response){                            
                                    if (config.debug) console.log(response);
                                } 
                            });                               
                        }
                    }
                );  
            }
            $('.find-in .google').bind('click',function(){
                window.open('https://www.google.com/search?q='+stock.name,'_blank');
            });
            $('.find-in .youtube').bind('click',function(){
                window.open('https://www.youtube.com/results?search_query='+stock.name,'_blank');
            });
            $('.find-in .twitter').bind('click',function(){
                window.open('https://twitter.com/search?src=typed_query&q='+stock.name,'_blank');
            });                    
            if (stock.website){
                button({ 
                    class: 'icon-btn icon-web_asset' }, 
                    function(){
                        window.open(stock.website,'_blank');
                    }
                );                        
            }                    
            button({ 
                class: 'icon-btn icon-share' }, 
                function(){                             
                    navigator.clipboard.writeText(window.location.href);
                    $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-share"></div><div class="title">Link Copied</div><div class="description">'+window.location.href+'</div></div></div>');                            
                });                     

            if (settings.contributor === 'yes'){

                button({ 
                    class: 'icon-btn icon-create' }, 

                    function(){ 

                    if ($('footer #popup .search').length){ 
                        $('footer #popup').html(''); 
                        $('.popup-btn').remove();
                        $('body').removeClass('with-popup');
                    }

                    $('body').toggleClass('with-popup');                            
                    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }   

                    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); toggleHeading(); });                            
                    $.ajax({
                        url:"/extensions/players/views/popups/contributor.html",
                        cache:false,
                        success: function(data){ 
                            $("#popup").html(data); 
                            $('.popup-contributor').slideDown(300,'linear');
                            $('.popup-contributor #market').val(stock.market);
                            $('.popup-contributor #symbol').val(stock.symbol);
                            $('.popup-contributor #name').val(stock.name);
                            $('.popup-contributor #industry').val(stock.industry);
                            $('.popup-contributor #sector').val(stock.sector);
                            $('.popup-contributor #website').val(stock.website);
                        },
                        error: function(e){ if (config.debug) console.log(e); }
                    });
                });
            };  
            switcher({ key: 'editable',  class: 'icon-settings1', value: settings.editable  ? settings.editable :  'false'},function(){ 
                editable(); 
                stock_graph_adaptive_height(); 
                if (stock_chart){ 
                    setTimeout(function() {
                        stock_chart.reflow();
                    }, 400);
                }});             

            
            stock_graph_adaptive_height();
            stock_chart = Highcharts.stockChart('stock-price', {
                global: {
                    useUTC: false
                  }, 
                scrollbar: { enabled: false },
                navigator: { enabled: false },
                xAxis: {
                    title:  { enabled: settings.graph_labels },
                    labels: { enabled: settings.graph_labels },
                    tickLength: 5,
                    tickPixelInterval: 75,
                    crosshair: true,
                    snap:false,
                    opposite: true
                },
                yAxis: {
                    title:  { enabled: settings.graph_labels },
                    labels: { enabled: settings.graph_labels },
                    tickLength: (settings.graph_labels === true ? 5 : 0),
                    crosshair: true,
                    snap:false
                },
                tooltip: {
                    positioner: function () {
                        if ($('body').hasClass('stock-price-pro-mode')) return { x: 50, y: 0 }
                        else return { x: 10, y: 0 };                                                        
                    },
                    pointFormatter:function(){
                        $('.stock-view .results-info').addClass('with-tooltip');
                        $('.stock-view .results-info .price-preview').addClass('tooltip-hover');
                        $('.stock-view .results-info .price-preview .price').text(format_price(this.y,2));
                        $('.stock-view .results-info .price-preview .date').text(format_date(this.x));                    
                        return '';
                    },
                    split: false,
                    followTouchMove: true,
                    followPointer:false
                },
                //colors:[settings.design.color_base],
                series: [{ name: 'Main', data:[] }],
                chart:{
                    spacing:[10,15,5,5],
                    spacingBottom:40,
                    type: 'line'
                },
                rangeSelector: { 
                    selected: settings.stock_chart_range,
                    verticalAlign: 'bottom',
                    floating:true,
                    y:30
                },
                stockTools:{
                    gui:{
                        visible: settings.graph_tools === 'true' && !ios & !mobile ? true : false,
                        placed: settings.graph_tools === 'true' && !ios && !mobile ? true : false,
                        buttons:[ 
                            'simpleShapes', 
                            'lines', 
                            'crookedLines', 
                            'measure', 
                            'advanced', 
                        //    'toggleAnnotations', 
                        //    'separator', 
                            'verticalLabels', 
                            'flags',                             
                        //    'typeChange' 
                            'fullScreen',                                 
                        //    'zoomChange', // Not working    
                        //    'indicators',  // on hold       
                        //    'currentPriceIndicator', 
                        //    'saveChart' // Next phase
                        ]
                    }
                },
                plotOptions: {
                    series: {
                        lineWidth: 1,
                        states: {
                            hover: { enabled: false }
                        },
                        events:{
                            mouseOut: function(){
                                $('.stock-view .results-info').removeClass('with-tooltip');
                                $('.stock-view .results-info .price-preview').removeClass('tooltip-hover');
                                reload_stock_price();
                            }
                        }
                    }
                }                  
            });                 
            // GET Entity info
            $.ajax({
                url: config.api_url,
                data: { 
                    endpoint: '/entity/info',
                    symbol: (stock.market!=='gpw') ? stock.symbol : stock.symbol_short,
                    market: stock.market
                },
                type: 'get',
                dataType: 'JSON',
                cache: false,
                success: function(response){
                    if (response.success === false){
                        $('.page-view[data-view="financial"]').hide();
                        $('.page-view[data-view="website"]').hide();
                        return;
                    } 

                    load_apexcharts(function(){
                        entity.info=response;
                        if (config.debug) console.log('Entity Info:');
                        if (config.debug) console.log(response);
                        $('.entity-main-info-container').html('');
                        // MAIN INFO
                        if (entity.info.General){ main_info_tab('General','general','icon-info',entity.info.General); }
                        if (entity.info.Highlights) main_info_tab('Highlights','highlights','icon-menu_book',entity.info.Highlights);
                        if (entity.info.Technicals) main_info_tab('Technicals','technicals','icon-star-full',entity.info.Technicals);
                        if (entity.info.Valuation) main_info_tab('Valuation','valuation','icon-finance',entity.info.Valuation);
                        if (entity.info.ESGScores) main_info_tab('ESG Scores','esgscores','icon-ruler',entity.info.ESGScores);
                        if (entity.info.AnalystRatings) main_info_tab('Analyst Ratings','analystratings','icon-trending_up1',entity.info.AnalystRatings);
                        if (entity.info.General.Officers) main_info_tab('Officers','officers','icon-person1',entity.info.General.Officers);
                        // WEBSITE
                        if ( entity.info.General && entity.info.General.WebURL && !stock.website){  
                            button({ 
                                class: 'icon-btn icon-sphere' }, 
                                function(){
                                    window.open(entity.info.General.WebURL,'_blank');
                                }
                            );                                                                                                
                        }else{}
                        // FINANCIAL GRAPHS
                        var widgets = {};
                        if (localStorage.getItem('widgets')){
                            widgets = JSON.parse(localStorage.getItem('widgets'));              

                        }else{ // Defaults

                            widgets['financial_graph'] = {                                
                                1: {
                                    range: 'yearly',
                                    scope: 'totalRevenue',
                                    chartType: 'line'
                                }                            
                            };
                        }  
                        localStorage.setItem('widgets',JSON.stringify(widgets));

                        $.each(widgets.financial_graph, function(id,widget){
                            widget_financial_graph(id, widget);                            
                        });
                        // FINANCIALS GRAPHS - Shareholders
                        if (entity.info.hasOwnProperty('Holders') && entity.info.Holders!==null){
                            var categories  = [];
                            var data        = [];
                            $.each(entity.info.Holders.Institutions, function(label,value){ 
                                categories.push(value.name); 
                                data.push(value.totalShares);
                            });                                                
                            let options = {
                                series: data, 
                                labels: categories,
                                chart: {                                
                                    type: 'donut',                                                                
                                    fill: {
                                        type: 'gradient'
                                    },
                                    height:420
                                },
                                legend: {
                                    position:'bottom',
                                    fontSize: '14px',
                                    fontFamily: 'gotham-regular',
                                    itemMargin: {
                                        horizontal: 10,
                                        vertical: 5
                                    }                                        
                                },
                                plotOptions: {
                                    pie: {
                                      donut:{
                                          size:'95%',
                                          labels: { 
                                              show:true,
                                              value:{
                                                formatter: function(value, opts){
                                                    return parseFloat(value).toFixed(2)+ '%';                                
                                                }
                                              },
                                              total: {
                                                show: true,
                                                label: 'All',
                                                color: '#7ebd0b',
                                                formatter: function (chart) {
                                                    return '100.00%';
                                                }

                                              }
                                          }
                                      }
                                    }
                                },
                                stroke:{ colors: [settings.design.color_bg2], width:1 }
                            };

                            new ApexCharts(document.querySelector("#graph-shareholders"), options).render();
                        }else{
                            $('.widget.shareholders').hide();
                        }
                    });
                },
                error: function(response){
                    if (config.debug) console.log(response);
                }
            });
            // GET Historical
            $.ajax({
                url: config.api_url,
                data: { 
                    endpoint: '/entity/historical',
                    symbol: stock.symbol,
                    market: stock.market
                },
                type: 'GET',
                dataType: 'JSON',
                cache: false,
                success: function(response){
                    if (config.debug) console.log('Historical Prices:');
                    if (config.debug) console.log(response);
                    stock.historical = response;                         
                    generate_graph();
                    reload_stock_price();
                },
                error: function(response){
                    if (config.debug) console.log(response);
                }
            });
            // GET Intraday
            $.ajax({
                url: config.api_url,
                data: { 
                    endpoint: '/entity/intraday',
                    symbol: stock.symbol,
                    market: stock.market,
                    ohlc: true
                },
                type: 'GET',
                dataType: 'JSON',
                cache: false,
                success: function(response){  
                    if (config.debug) console.log('Intraday prices:');
                    if (config.debug) console.log(response);
                    stock.intraday = response;     
                    if (stock.intraday === null) stock.intraday = 1;

                    generate_graph();                                                
                },
                error: function(response){
                    if (config.debug) console.log(response);
                }
            });
            
            // GET Notes
            get_notes();
            
            
            // RELATED
            $('.page').addClass('view-'+settings.related_layout);                           
            if (stock.market === 'forex' || stock.market === 'fantoken' || stock.market === 'indices'){
                get_search_items([{ code:'market', value:stock.market, type: 'LIKE' }, { code:'id', value:stock.id, type :'!=' }],'[data-view="related-1"] ',10,'shuffle',true);                                                
                $('[data-view="related-2').hide();
            }else{
                if (stock.sector !== '' && stock.sector !== null){
                    get_search_items([{ code:'sector', value:stock.sector, type: 'LIKE' }, { code:'id', value:stock.id, type :'!=' }],'[data-view="related-1"] ',10,'shuffle',true);                                                
                }else{
                    $('[data-view="related-1').hide();
                }
                if (stock.industry !== '' && stock.industry !== null){
                    get_search_items([{ code:'industry', value:stock.industry, type: 'LIKE' }, { code:'id', value:stock.id, type :'!=' }],'[data-view="related-2"] ',10,'volume_desc',true);                                                
                }else{
                    $('[data-view="related-2').hide();
                }                
            }


            if (settings.graph_fullscreen) change_graph_fullscreen(settings.graph_fullscreen);
            $('#graph_fullscreen').prop('checked', settings.graph_fullscreen);
            $('#graph_tools').prop('checked', settings.graph_tools === 'true' ? true : false);
            $('#graph_labels').prop('checked', settings.graph_labels);

            if (config.debug) console.log('Main info:');
            if (config.debug) console.log(response.stock);
        },
        error: function(response){
            if (config.debug) console.log(response);
        }
    });
    });
});

$(document).off('click', '[data-label="view_stock_edit"]');
$(document).on('click','[data-label="view_stock_edit"]',function(){
    stock_graph_adaptive_height();
    setTimeout(function() {
        stock_chart.reflow();
    }, 20); 
});
$(document).off('click', '[data-action="add-note"]');
$(document).on('click','[data-action="add-note"]',function(){  
    
    if (!me){
        $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">New note</div><div class="description">Feature only for logged users</div></div></div>');                            
        return;
    }    

    $('body').toggleClass('with-popup');                            
    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
    $.ajax({
        url:"/extensions/entities/views/popups/notes.html",
        cache:false,
        success: function(data){ $("#popup").html(data); },
        error: function(e){ if (config.debug) console.log(e); }
    });
});
$(document).off('click', '[data-action="advanced-charting"]');
$(document).on('click','[data-action="advanced-charting"]',function(){  
    
    if (!me){
        $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">Advanced Charting</div><div class="description">Sorry, feature only for logged users</div></div></div>');                            
        return;
    }    

    $('body').toggleClass('with-popup');                            
    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
    $.ajax({
        url:"/extensions/entities/views/popups/advanced-charting.html",
        cache:false,
        success: function(data){ $("#popup").html(data); },
        error: function(e){ if (config.debug) console.log(e); }
    });
});
$(document).off('click', '[data-action="advanced-charting-fullscreen"]');
$(document).on('click','[data-action="advanced-charting-fullscreen"]',function(){ 
    $(this).attr('data-action','advanced-charting-close-fullscreen').removeClass('icon-fullscreen').addClass('icon-fullscreen_exit');
    $('body').addClass('fullscreen');
    let elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
});
$(document).off('click', '[data-action="advanced-charting-close-fullscreen"]');
$(document).on('click','[data-action="advanced-charting-close-fullscreen"]',function(){ 
    $(this).attr('data-action','advanced-charting-fullscreen').removeClass('icon-fullscreen_exit').addClass('icon-fullscreen');
    $('body').removeClass('fullscreen');
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
});


$(document).off('click', '.widget-collapse');
$(document).on('click','.widget-collapse',function(){           
    $(this).parents('.widget').toggleClass('collapsed');
    $(this).parents('.widget').find('.content').slideToggle('linear',function(){
        stock_graph_adaptive_height();
        setTimeout(function() {
            stock_chart.reflow();
        }, 20); 
    });
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (!widgets.hasOwnProperty('results_info')){ widgets.results_info = { id: 'results-info' };  }
    widgets.results_info.collapsed = 'false';                
    if ($(this).parents('.widget').hasClass('collapsed')){ widgets.results_info.collapsed = 'true'; }
    localStorage.setItem('widgets',JSON.stringify(widgets));
});
$(document).off('click', '.results-info .edit .form.hidden-fields input');
$(document).on('click','.results-info .edit .form.hidden-fields input',function(){
    var id = $(this).attr('id').substring(2); 
    $('.results-info').find('.'+id).toggleClass('hide');
    $('.results-info').find('.label-'+id).toggleClass('hide');

    // Remember visible fields
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (!widgets.hasOwnProperty('results_info')){ widgets.results_info = { id: 'results-info' };  }

    var hidden_fields = [];
    $('.results-info .edit .form.hidden-fields input').each(function(key,element){
        if (!$(element).is(':checked')){ hidden_fields.push($(element).attr('id').substring(2)); }
    });
    widgets.results_info.hidden_fields = hidden_fields;
    localStorage.setItem('widgets',JSON.stringify(widgets));        
});
$(document).off('click', '#stock_chart_range');
$(document).on('input','#stock_chart_range',function(){
    change_graph_range($(this).val());
});

$(document).off('click', '.description-popup');
$(document).on('click','.description-popup',function(){
    $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body hide-scroll"><div class="logo-container">'+$('.results-info-title .logo-container').html()+'</div><div class="title">'+$('.results-info-title h2').html()+'</div><div class="description">'+$(this).attr('data-value').replace(';','<br /><br />')+'</div></div></div>');
});

$(document).off('click', '.toggleTool');
$(document).on('click','.toggleTool',function(){
    $('.quick-tools > *:not(.actions)').toggle();
    $('.quick-tools').toggleClass('active');
});


