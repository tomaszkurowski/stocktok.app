function reload_stock_price(){
    
    stock.daily_change            = stock.price - stock.previous_price;
    stock.daily_change_percentage = parseFloat(((stock.price - stock.previous_price) / stock.previous_price) * 100).toFixed(2);
    
    $('.results-info .current-price').text(format_price(stock.price));
    $('.results-info .previous-price').text(format_price(stock.previous_price));
    
    $('.results-info .price-preview:not(.tooltip-hover) .price').text(format_price(stock.price));
    $('.results-info .price-preview:not(.tooltip-hover) .date').text(stock.last_updated_at);
    
    $('.results-info .current-volume').text(format_price(stock.volume));
    $('.results-info .daily-change').text(format_price(stock.daily_change,2));
    $('.results-info .daily-change-percentage').text(stock.daily_change_percentage);
   
   
    if (stock.historical && !stock.open && !stock.high && !stock.low){
        var last_element = stock.historical.length-1;
        stock.open_price = stock.historical[last_element][2];
        stock.daily_max  = stock.historical[last_element][3];
        stock.daily_min  = stock.historical[last_element][4];
    }
    $('.results-info .daily-max').text(format_price(stock.daily_max),2);
    $('.results-info .daily-min').text(format_price(stock.daily_min),2);
    $('.results-info .open-price').text(format_price(stock.open_price));
    
    // DATA: OHLC
    // [1589203800000,77.03,79.26,76.81,78.75]
    // Data: Current
    // [1652107802000, 806.76]
   
   
    return;
}

var current_stock  = '';
var current_market = '';
var entity = {};


// MYSTOCK - VIEW
var stock;
var stock_chart; // @todo: it can be stock.chart

function generate_graph(){
    
    if (stock.intraday && stock.historical){
        
        if (settings.graph_type === 'ohlc'){
            // At the moment I've got only Open/High/Low/Close for Historical prices (not for intraday)
            stock.all_prices = stock.historical                        
        }else{
            // Last historical = First Intraday (10d interval)
            if (stock.intraday !== 1){
                stock.historical[stock.historical.length-1][4]=stock.intraday[0][4]

                // Join Intraday with Historical into one serie
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
        
        // Changers settings
        stock_chart.update({ plotOptions: { series: { lineWidth:settings.graph_line }} });    
        
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
    
    
    
    //$tooltips['ReturnOnAssets']='<h3>Return on Assets TTM</h3>';
    
    
    $.each(tabInfoContent, function(label,value){  
        
        var tabInfoRow=$('.template-info-tab-row.hide').clone().removeClass('hide');
        

        // Mappings
        switch(label){
            case 'MarketCapitalization': value = format_price(value); break;
            case 'MarketCapitalizationMln': return;
            case 'EBITDA': value=format_price(value); break;
            case 'RevenueTTM': value=format_price(value); break;
            case 'GrossProfitTTM': value=format_price(value); break;
            case 'BookValue': value=format_price(value); break;                        
            case 'profitMargin': value=value+ '%'; break;            
            case 'OperatingMarginTTM': value=value+ '%'; break;
            case 'ReturnOnAssetsTTM': value=value+ '%'; break;
            case 'ReturnOnEquityTTM': value=value+ '%'; break;                                   
            case 'WebURL': value = '<a href="'+value+'">'+value+'</a>'; break;
            case 'UpdatedAt': return;                            
        } 
        if (label === 'CountryISO' && value !== 'NA'){
            label='Country';
            value='<img src="/media/img/flags/'+value+'.png" class="flag" alt="flag-'+value+'" />';
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
            if (value && typeof value !== 'object' && value !== 'Unknown' && value !== 'NA' && value !== '<img src="/media/img/flags/NA.png" class="flag" alt="flag-'+value+'" />') $('#entity-'+tabCode).append(tabInfoRow);
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
