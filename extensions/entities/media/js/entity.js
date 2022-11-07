var live = {};
var stock;
var entity;
var stock_chart;
var sketchpad;
var loadedSummary = false;
var twidget;

function liveReload(options={}){
    
    $.each(live, function(item){ 
        
        stock.price = item.price ? item.price : stock.price;
        stock.last_updated_at = item.last_updated_at ? item.last_updated_at : stock.last_updated_at;        
        stock.open  = item.open   ? item.open   : stock.open;
        stock.high  = item.high   ? item.high   : stock.high;
        stock.low   = item.low    ? item.low    : stock.low;
        stock.volume= item.volume ? item.volume : stock.volume;
                                 
        $('[data-src="price"]').text(stock.price+' '+stock.market_currency);                        
        $('[data-src="last_updated_at"]').text(format_datetime(stock.last_updated_at,{ format:'D/M, LT' }));
        $('[data-src="open"]').text(stock.open);
        $('[data-src="high"]').text(stock.high);        
        $('[data-src="low"]').text(stock.low);
        $('[data-src="volume"]').text(stock.volume);
        
        stock.daily  = parseFloat(stock.price - stock.open).toFixed(2);
        stock.dailyp = stock.open>0 ? parseFloat(((stock.price - stock.open) / stock.open) * 100).toFixed(2) : '-';         
        $('[data-src="daily"]').text(stock.daily);
        $('[data-src="dailyp"]').text(stock.dailyp);    
    });
}

function resultsReload(){
    
    stock.current_total = 0;
    stock.current_margin = 0;
    stock.sold_total = 0;
    stock.sold_margin = 0;
    stock.sold_purchased = 0;
    stock.current_purchased = 0;
    
    $.each(stock.transactions, function(id,item){             
              
        item.rate       = (1 / currencies[stock.market_currency]).toFixed(config.precision_rate);                                
        item.sold_rate  = round((currencies[item.purchased_currency] ? currencies[item.purchased_currency] : 1) / currencies[stock.market_currency], config.precision_rate);
        item.total      = (stock.price * item.purchased_qty * item.rate).toFixed(config.precision_total);

        if (item.type === 'active'){                
            $('.wallet[data-type="active"]').removeClass('hide');
            item.margin     = item.purchased_currency !== stock.market_currency ? (round((item.total*item.sold_rate - item.purchased_total * item.purchased_rate)/item.sold_rate,2)) : (item.total - item.purchased_total);
            item.marginp    = item.margin === 0 ? 0 : (item.purchased_total !== 0 ? (item.margin / (item.purchased_total) * 100).toFixed(2) : 0);                            
            item.total = (stock.price * item.purchased_qty * item.rate).toFixed(config.precision_total);
            
            stock.current_total  += parseFloat(item.total);            
            stock.current_margin += parseFloat(item.margin);
            stock.current_purchased +=parseFloat(item.purchased_total);            
        }
        if (item.type === 'sold'){
            $('.wallet[data-type="sold"]').removeClass('hide');
            item.marginp = item.margin_percentage;
            item.total = item.sold_total;
                        
            stock.sold_purchased += parseFloat(item.purchased_total);
            stock.sold_total     += parseFloat(item.total);            
            stock.sold_margin    += parseFloat(item.margin);            
        }   
    }); 

    stock.sold_marginp = (stock.sold_margin / (stock.sold_purchased ? stock.sold_purchased : 1) * 100).toFixed(2);
    stock.current_marginp = (stock.current_margin / (stock.current_purchased ? stock.current_purchased : 1) * 100).toFixed(2);
   

    $('[data-type="active"] [data-src="total"]').text(format_price(stock.current_total * currencies[settings.display_currency],2)+' '+settings.display_currency);
    $('[data-type="active"] [data-src="margin"]').text(format_price(stock.current_margin * currencies[settings.display_currency],2)+' '+settings.display_currency).attr('data-color',stock.current_margin === 0 ? '' : (stock.current_margin>0 ? 'green' : 'red'));
    $('[data-type="active"] [data-src="marginp"]').text(stock.current_marginp+'%');
    //$('[data-type="active"] [data-src="purchased"]').text(format_price(stock.current_purchased * currencies[settings.display_currency],2)+' '+settings.display_currency);
    $('[data-type="sold"]   [data-src="total"]').text(format_price(stock.sold_total * currencies[settings.display_currency],2)+' '+settings.display_currency);
    $('[data-type="sold"]   [data-src="margin"] ').text(format_price(stock.sold_margin * currencies[settings.display_currency],2)+' '+settings.display_currency).attr('data-color',stock.sold_margin === 0 ? '' : (stock.sold_margin>0 ? 'green' : 'red'));
    $('[data-type="sold"]   [data-src="marginp"]').text(stock.sold_marginp+'%');
    //$('[data-type="sold"]   [data-src="purchased"]').text(format_price(stock.sold_purchased * currencies[settings.display_currency],2)+' '+settings.display_currency);
    $('[data-src="display_currency"]').text(settings.display_currency);
    
}
function movesReload(){
    
    $.ajax({
        url: config.api_url,
        data:{ 
            endpoint: '/wallet/moves',
            symbol: stock.symbol,
            market: stock.market
        },
        type:       'GET',
        dataType:   'JSON',
        cache:      false, 
        success: function(response){
            if (config.debug) console.log('performance',response);
            $('[data-src="active-moves"]').html('').append('<tbody></tbody>');
            $('[data-src="sold-moves"]').html('').append('<tbody></tbody>');
            
            stock.transactions = response.items;
            $.each(response.items, function(i, move){
                let el = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');                    
                if (move.type === 'active'){
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    
                    $(col).append('<span class="point"></span>');
                    $(col).append('Active <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.purchased_date, { format: 'L, [\r\n]LT' })+'</div>');
                    
                    //$(el).append('<td>'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b>'+(move.purchased_rate !== null && move.purchased_rate !== 1 ? '<br /><a>('+move.purchased_rate+' '+move.purchased_currency+')</a>' : '')+'</td>');
                    $(col).append('<div class="action">Sell</div>').bind('click',function(){                    
                        $('body').toggleClass('with-popup');                            
                        if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); toggleHeading(); });                                                    
                        $.ajax({ url:"/extensions/wallet/views/popups/sell.html", cache:false,
                            success: function(data){
                                $('#popup').html(data);
                                $.getScript('/extensions/wallet/media/js/actions_sell.js?version='+config.version,function(){
                                    sell_step2(stock);
                                });                        
                            },
                            error: function(e){ if (config.debug) console.log(e); }
                        });                       
                    });
                    
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="active-moves"] tbody');
                }else{  
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    $(col).append('<span class="point" data-color="'+(move.margin>0 ? 'green' : 'red')+'"></span>');
                    $(col).append('Sold <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.sold_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.sold_date, { format: 'L, [\r\n]LT' })+'</div>');
                    $(col).append('<div class="results" data-color="'+(move.margin>0 ? 'green' : 'red')+'">'+(move.margin>0 ? '+ ' : '')+format_price(move.margin * currencies[settings.display_currency],2)+'');
                    
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="sold-moves"] tbody');
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    $(col).append('<span class="point" data-color="gray"></span>');
                    $(col).append('Bought <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.purchased_date, { format: 'L, [\r\n]LT' })+'</div>');
                    
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="sold-moves"] tbody');                    
                    
                }
            });                       
                        
        },
        error: function(err){ if (config.debug) console.log(err); }
    });   
}

$(document).off('click','.wallet');
$(document).on('click','.wallet',function(){
    
    if (!$(this).hasClass('active') || loadedSummary) return;    
    movesReload();
    
    if (stock.sold_marginp){
        new ApexCharts(document.querySelector('[data-src="graph-sold"]'),{
            series: [stock.sold_marginp],
            chart: {type: 'radialBar'},
            plotOptions: {radialBar: {hollow: {size: '85%'}}},
            stroke:{ colors: [settings.design.color_bg2], width:1 },
            labels: ['Margin'],
            colors:[stock.sold_marginp>0 ? '#00CF0D' : '#FF2D00']
            }).render();        
    }
    if (stock.current_marginp){
        new ApexCharts(document.querySelector('[data-src="graph-active"]'),{
            series: [stock.current_marginp],
            chart: {type: 'radialBar'},
            plotOptions: {radialBar: {hollow: {size: '85%'}}},
            labels: ['Margin'],
            colors:[stock.current_marginp>0 ? '#00CF0D' : '#FF2D00']
            }).render();  
    }
    loadedSummary = true;
});


function createTab(options={}){
    
    if (!options.target || !options.title || !options.data) return;
    
    let tab = $('<div class="tab-container"></div>')
      .append('<div class="tab-header"><h2>'+options.title+'</h2><div class="expand icon-expand_more"></div></div>')
      .append('<div class="tab-content tab-info"></div>');

    /* @TODO
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
    */
    
    $.each(options.data, function(label,value){           
        if (value === null || value === '' || value === 'NA' || value === 'Unknown' || value === '0' || value === 0) return;        
        
        if ($.inArray(label,['MarketCapitalizationMln','UpdatedAt','LogoURL','AddressData','Listings','Officers','isDelisted']) !== -1) return;
        
        if ($.inArray(label,['MarketCapitalization','EBITDA','RevenueTTM','GrossProfitTTM','BookValue']) !== -1)   value = format_price(value);        
        if ($.inArray(label,['profitMargin','OperatingMarginTTM','ReturnOnAssetsTTM','ReturnOnEquityTTM']) !== -1) value = value + '%';        
        if (label === 'sector'     ){ value = '<a href="/market/screener?sector.is.'+value+'">'+value+'</a>'; }
        if (label === 'industry'   ){ value = '<a href="/market/screener?industry.is.'+value+'">'+value+'</a>'; }
        if (label === 'WebURL'     ){ value = '<a href="'+value+'" target="_blank">'+value+'</a>'; }
        
        if (label === 'TechnicalDoc'){ value = '<a href="'+value+'" target="_blank">Show</a>'; }
        if (label === 'Explorer'    ){ value = '<a href="'+value+'" target="_blank">Show</a>'; }
        
        if (label === 'Phone'      ){ value = '<a href="tel:'+value+'">'+value+'</a>'; }
        if (label === 'Address'    ){ value = '<a href="https://www.google.com/maps?q='+value+'" target="_blank">'+value+'</a>'; }
        if (label === 'Description'){ value = '<div class="description-popup" data-value="'+value+'">'+(value.length>255 ? value.slice(0,255)+'... <span class="icon icon-navigate_next"></span>' : value)+'</div>'; }
        if (label === 'CountryISO' ){ value = '<img src="/media/img/flags/'+value.toLowerCase()+'.svg" class="flag" alt="flag-'+value+'" loading="lazy" />'; }
        
        let row = '<div class="row" data-label="'+label+'"><div class="field">'+label+'</div><div class="value">'+value+'</div></div>';        
        
        if (options.officers === true){
            row = $('<div class="row link"><div class="value">'+value.Name+'<br /><span>'+value.Title+'</span></div><div class="icon-btn icon-navigate_next1"></div></div>').bind('click',function(){
                window.open('https://www.google.com/search?q='+value.Name,'_blank');
            });            
        }
        
        $(tab).find('.tab-content').append($(row));       
        //if (tooltips[label]) tabInfoRow.addClass('with-tooltip').find('.tooltip-info').html(tooltips[label]);
    });
    $(options.target).append($(tab));
}
function newsReload(){
    $.ajax({
        url: config.api_url,
        data: { 
            endpoint: '/news',
            symbol: (stock.market!=='gpw') ? stock.symbol : stock.symbol_short,
            market: stock.market_eod
        },
        type: 'get',
        dataType: 'JSON',
        cache: false,
        success: function(response){
            if (config.debug) console.log('news',response);
            if (response.length === 0) return;
            $('.news-headlines').removeClass('hide');
            
            $('[data-src="news-headlines"]').html('');
            $.each(response,function(i,news){
                let source = news.link.replace('https://','').split('/')[0];
                $('<div class="news"></div>')
                .append('<div class="news-title">'+news.title+'</div>')
                .append('<p><a>'+format_datetime(news.date,{ format: 'D/M, LT' })+'</a></p>')
                .bind('click',function(){
                    window.open(news.link,'_blank');
                })
                .appendTo('[data-src="news-headlines"]');
            });   
        },
        error: function(response){ if (config.debug) console.log(response); }
    });    
}

function infoReload(){
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
            if (response.success === false){ return; }

            $.getScript('/extensions/entities/media/js/widgets'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version,function(){
                load_apexcharts(function(){
                    stock.facts = response;                        
                    if (config.debug) console.log('Facts:',stock.facts);

                    $('[data-src="facts"]').html('');
                    if (stock.facts.General)            createTab({ target: '[data-src="facts"]', title: 'General',         data: stock.facts.General });
                    if (stock.facts.Statistics)         createTab({ target: '[data-src="facts"]', title: 'Statistics',      data: stock.facts.Statistics });
                    if (stock.facts.Highlights)         createTab({ target: '[data-src="facts"]', title: 'Highlights',      data: stock.facts.Highlights });
                    if (stock.facts.Technicals)         createTab({ target: '[data-src="facts"]', title: 'Technicals',      data: stock.facts.Technicals });
                    if (stock.facts.Valuation)          createTab({ target: '[data-src="facts"]', title: 'Valuation',       data: stock.facts.Valuation });
                    //if (stock.facts.ESGScores)          createTab({ target: '[data-src="facts"]', title: 'ESG Scores',      data: stock.facts.ESGScores });
                    //if (stock.facts.AnalystRatings)     createTab({ target: '[data-src="facts"]', title: 'Analyst Ratings', data: stock.facts.AnalystRatings });
                    if (stock.facts.General.Officers)   createTab({ target: '[data-src="facts"]', title: 'Officers',        data: stock.facts.General.Officers, officers:true });
                        
                    if ( stock.facts.General && stock.facts.General.WebURL && !stock.website){                              
                        $('.find-in .website').show().bind('click',function(){ window.open(stock.facts.General.WebURL,'_blank'); });                                                                                                                            
                    }                        
                    
                    // FINANCIALS GRAPHS
                    if (stock.facts.hasOwnProperty('Holders') && stock.facts.Holders!==null){ 
                        widgetShareholders();                                                        
                    }                                                
                    var widgets = {};
                    widgets['financial_graph'] = { 1: { range: 'yearly', scope: 'totalRevenue', chartType: 'line' }};
                      
                    localStorage.setItem('widgets',JSON.stringify(widgets));
                    $.each(widgets.financial_graph, function(id,widget){
                        widgetFinancial(id, widget);                            
                    });                        
                });
            });

        },
        error: function(response){ if (config.debug) console.log(response); }
    });    
}

function getHistoricalData(symbolInfo, resolution, periodParams){
    
    console.log(periodParams);
    var data = [];
    $.ajax({ 
        url: config.api_url, 
        data: { 
            endpoint: '/entity/historical', 
            symbol: stock.symbol, 
            market: stock.market,
            from: periodParams.from,
            to: periodParams.to,
            countBack: periodParams.countBack
        }, 
        type: 'GET', 
        dataType: 'JSON', 
        cache: false,
        async:false,
        success: function(response){
            data = response;
        },
        error: function(e){
            console.log('error');
            if (config.debug) console.log(e);
        }
    });
    return data;

}

function generateGraph(){
    
    var tries = 5;
    let tv_symbol = stock.market_tv+":"+stock.symbol;
    if (stock.market === 'gpw' || stock.market === 'newconnect') tv_symbol = stock.market_tv+':'+stock.symbol_short;
    if (stock.market === 'forex')                                tv_symbol = stock.market_tv+':USD'+stock.symbol;
    if (stock.market === 'crypto')                               tv_symbol = stock.market_tv+':'+stock.symbol.replace('-','');
    if (stock.market === 'fantoken')                             tv_symbol = stock.market_tv+':'+stock.symbol+'USD';     
    
    // TradingView - Graph
    if (stock.chartSource === 'library'){
        
        var dataFeed = {
            configuration: {
                exchanges: [
                    { value: '', name: 'All Exchanges' }
                ],
                supported_resolutions: ['1D','1W','1M','6M','1Y'],
                supports_group_request: false,
                supports_marks: true,
                supports_search: false,
                supports_time: true,
                supports_timescale_marks: true,
                symbols_types: [{ name: 'All Types', value:'' },{ name: 'Stock', value:'stock'},{ name: 'Index', value: 'index' }]
            },
            onReady:function(callback){
                if (config.debug) console.log('TradingView Configuration',this.configuration);
                setTimeout(() => callback(this.configuration));            
            }, 
            resolveSymbol: function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){                        
                var symbol = {
                    name: stock.name ? stock.name : '-',
                    description: '',
                    type: 'stock',
                    session: '24x7',
                    //visible_plots_set: 'c',                    
                    timezone: 'America/New_York',
                    ticker: stock.symbol,
                    minmov: 1,
                    pricescale: 100000000,
                    has_intraday: false,
                    intraday_multipliers: ['1', '60'],
                    supported_resolution:  ["120","240","D","6M"]
                };
                if (config.debug) console.log('resolveSymbol',symbol);
                setTimeout(function() { onSymbolResolvedCallback(symbol); }, 0);
            },
            getBars: function(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) { 

                let bars = getHistoricalData(symbolInfo, resolution, periodParams);
                if (config.debug) console.log('bars',bars);
                
                if (tries-- === 0){ return; }

                if (bars.length>0) onHistoryCallback(bars, {noData: false });
                else onHistoryCallback([], {noData: true });
                
                /*
                if (bars.length>0) { onHistoryCallback(bars, {noData: false});
                }else{             onHistoryCallback([], {noData: true}); }            */
                
            },
            subscribeBars: function(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) { console.log('👉 subscribeBars:', subscriberUID); },
            unsubscribeBars: function(subscriberUID) { console.log('👉 unsubscribeBars:', subscriberUID); }
        };  
        let disabled_features = ["use_localstorage_for_settings"];
        if (settings.tview_hide_side_toolbar)   disabled_features.push('left_toolbar');
        if (settings.tview_hide_top_toolbar)    disabled_features.push('header_widget');
        if (settings.tview_hidevolume)          disabled_features.push('create_volume_indicator_by_default');
        if (settings.tview_hide_bottom_toolbar) disabled_features.push('control_bar');
        if (settings.tview_hide_bottom_toolbar) disabled_features.push('timeframes_toolbar');
        if (settings.tview_hide_legend)         disabled_features.push('legend_widget');
        
        var widget = new TradingView.widget({
            // debug: true, // uncomment this line to see Library errors and warnings in the console
            fullscreen: true,
            symbol:     stock.symbol,            
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme":    settings.theme,
            overrides: { "mainSeriesProperties.style": parseInt(settings.tview_style) }, 
            
            "locale":   "en",
            container: "tradingViewGraph",
            datafeed: dataFeed,
            library_path: "/media/js/external/TradingView/charting_library/",
            disabled_features: disabled_features,
            //enabled_features: ["study_templates"],
            //charts_storage_url: 'https://saveload.tradingview.com',
            //charts_storage_api_version: "1.1",
            client_id: 'tradingview.com',
            user_id: 'public_user_id'
        });        
        
    // TradingView - Widget
    }else if (stock.chartSource === 'widget'){        
        twidget = new TradingViewOnline.widget({
            "autosize":             true,
            "symbol":               tv_symbol,
            "interval":             "D",
            "timezone":             "Etc/UTC",
            "theme":                settings.theme,
            "style":                settings.tview_style,
            "locale":               "en",
            "toolbar_bg":           "#f1f3f6",
            "enable_publishing":    false,
            "hide_top_toolbar":     settings.tview_hide_top_toolbar,
            "withdateranges":       settings.tview_hide_bottom_toolbar ? false : true,
            "hide_side_toolbar":    settings.tview_hide_side_toolbar,
            "hide_legend":          settings.tview_hide_legend,
            "hidevolume":           settings.tview_hidevolume,
            "details":              settings.tview_details,
            "save_image":           true,
            "container_id":         "tradingViewGraph"
        });        
    }else{
        $('.graph-container .graph').html('<div class="no-data"><div class="icon icon-trending_up"></div><h2>No data</h2><p>Sorry we don\'t hava historical data for this symbol yet. But we keep working on it.</p></div>');
    } 
    
    let technicalAnalysisOptions = {
        "interval": "1m",
        "width": "100%",
        "isTransparent": true,
        "height": "100%",
        "symbol": tv_symbol, 
        "showIntervalTabs": true, 
        "locale": "en", 
        "colorTheme": settings.theme
    };
    let technicalAnalysisUrl = encodeURIComponent(JSON.stringify(technicalAnalysisOptions));
    $('.tv-analysis').html('<iframe scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/technical-analysis/?locale=en#'+technicalAnalysisUrl+'" style="box-sizing: border-box; height: 100%; width: 100%;"></iframe>');
    
    if (stock.market === 'crypto' || stock.market === 'nasdaq' || stock.market === 'nyse'){       
        let feedsOptions = {
            "symbol": tv_symbol,
            "colorTheme": settings.theme,
            "isTransparent": true,
            "displayMode": "regular",
            "width": "100%",
            "height": "100%",
            "locale": "en" 
        };
        let feedsUrl = encodeURIComponent(JSON.stringify(feedsOptions)); 
        $('.tv-snaps').html('<iframe id="tv_snaps" scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/timeline/?locale=en&symbol='+tv_symbol+'#'+feedsUrl+'" style="box-sizing: border-box; height: 100%; width: 100%;"></iframe>');
        $('.tv-snaps iframe').bind('load',function(){
            $('.snaps').removeClass('hide');
        });        
    }
   
    /* To be reviewed
    if (settings.tview_hide_bottom_toolbar2){
        $('.quick-tools').addClass('hide');
    }

    var slider = document.getElementById('range-selector');
    var format = {
        to:function(value){
            return valuesForSlider[Math.round(value)];
        },
        from: function(value){
            return valuesForSlider.indexOf(value);
        }
    };            
    if(slider && slider.noUiSlider){ slider.noUiSlider.destroy(); }

    var valuesForSlider = ['1d','1w','1m','3m','6m','1y','5y','All'];
    noUiSlider.create(slider, {
        start: [valuesForSlider[settings.stock_chart_range]],
        connect: true,
        range: { 'min': 0, 'max': valuesForSlider.length-1 },
        step:1,
        tooltips:false,
        format: format,
        pips: { mode: 'steps', format: format }
    }).on('slide',function(values, handle){
        //change_graph_range(valuesForSlider.indexOf(values[0]),true);
    });
    */       
}

  
function stock_graph_adaptive_height(){
    
    if ($(window).width()>996){
        return;
    };                     
    var optimal_graph_height = 230;    
    if (!$('.results-info').hasClass('collapsed')){ optimal_graph_height = 155; }   
    if ($('body').hasClass('advanced-charting-fullscreen')) optimal_graph_height = 135;
    $('.stock-price-container').height('calc(100vh - '+optimal_graph_height+'px)');        
}
              
$(document).ready(function(){

    if ($(document).width()>996){
        $('[data-view="overview"]').appendTo('.panel-content');
        $('[data-view="info"]').appendTo('.panel-content');
    }else{
        $('[data-view="overview"]').appendTo('.overview-container');
        $('[data-view="info"]').appendTo('.info-container');
    }
    
    get_currencies(function(){
    $.ajax({
        url: config.api_url,
        data: { endpoint: '/entity', symbol: mvc.controller, market:mvc.view },
        type: 'GET',
        dataType: 'JSON',
        cache:false,
        success: function(response){

            stock = response.entity;
            if (config.debug) console.log('Entity',response);            

            live[stock.symbol+'.'+stock.market] = { price: stock.price, last_updated_at: stock.last_updated_at };
            liveReload();

            // BASIC DATA
            $('[data-src="symbol"]').text(stock.symbol);
            $('[data-src="market"]').text(stock.market);
            $('[data-src="name"]').text(stock.name);
            $('[data-src="logo"]').html((stock.logo ? '<img src="'+stock.logo+'" class="logo" alt="logo-'+stock.symbol+'" loading="lazy" height="auto" width="auto" />' : '<div class="logo no-img">'+stock.symbol+'</div>'));
            $('[data-src="flag"]').html((stock.country ? '<img src="/media/img/flags/'+stock.country+'.svg" class="flag-small" alt="country-'+stock.country+'" loading="lazy" height="auto" width="auto" />' : ''));
            $('[data-src="currency"]').text(stock.currency);            
            if (stock.cover)    $('.results-info').addClass('with-cover').prepend('<img src="'+stock.cover+'" class="cover" alt="cover-'+stock.symbol+'" loading="lazy" />');
            if (stock.sector)   $('[data-src="sector"]').html('<a href="/entities/find-by?sector='+stock.sector+'">'+stock.sector+'</a>');
            if (stock.industry) $('[data-src="industry"]').html('<a href="/entities/find-by?industry='+stock.industry+'">'+stock.industry+'</a>');            
                          
            // QUICK TOOLS
            $('.quick-tools .additionals').html('');
            $('.quick-tools .additionals')
            .append(stock.logo ? '<img src="'+stock.logo+'" class="logo" alt="logo-'+stock.symbol+'" loading="lazy" height="auto" width="auto" />' : '<div class="logo no-img">'+stock.symbol+'</div>')
            .bind('click',function(){
                $('.quick-tools .range-selector').toggleClass('active');
                $('.quick-tools .actions').toggleClass('active');
            });                                   
               
            // FIND IN
            $('.find-in .google').bind('click',function(){  window.open('https://www.google.com/search?q='+stock.name,'_blank'); });
            $('.find-in .youtube').bind('click',function(){ window.open('https://www.youtube.com/results?search_query='+stock.name,'_blank'); });
            $('.find-in .twitter').bind('click',function(){ window.open('https://twitter.com/search?src=typed_query&q='+stock.name,'_blank'); });                    
            if (stock.website){ $('.find-in .website').show().bind('click',function(){ window.open(stock.website,'_blank'); }); }            
            
            // BUTTONS
            if (stock.market === 'forex'){
                button({ class: 'icon-btn icon-calculator' }, function(){
                    $('body').toggleClass('with-popup');                            
                    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); toggleHeading(); });                                                    
                    $.ajax({ url:"/extensions/entities/views/popups/calculator.html", cache:false,
                        success: function(data){$('#popup').html(data); $('#cc-currency1').append('<option value="'+stock.symbol+'" selected="SELECTED">'+stock.symbol+'</option>'); },
                        error: function(e){ if (config.debug) console.log(e); }
                    });
                });                        
            }             
            
            button({ class: 'icon-btn icon-search2' }, function(){                        
            $.ajax({ url:"/extensions/entities/views/popups/search.html", cache:false, success: function(data){
                        $('#popup').html(data);
                        $('body').addClass('with-popup with-blur');                            
                        $('.popup-btn').remove();
                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur').removeClass('no-blur'); });                             
                    },
                    error: function(e){ if (config.debug) console.log(e); }
                });                                
            });  
            if (me){ 
                button({ class: 'icon-btn icon-shopping_cart' }, function(){ 
                    
                    $('body').toggleClass('with-popup');                            
                    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); toggleHeading(); });                                                    
                    $.ajax({ url:"/extensions/wallet/views/popups/buy.html", cache:false,
                        success: function(data){
                            $('#popup').html(data);
                            $.getScript('/extensions/wallet/media/js/actions_buy.js?version='+config.version,function(){
                                buy_step2(stock);
                            });                        
                        },
                        error: function(e){ if (config.debug) console.log(e); }
                    });                       
                
                });                                
                button({ class: 'icon-btn icon-observed', attributes: [{ key: 'data-action', value:'toggleObserved' },{ key: 'data-value', value: stock.observed }]}, function(el){                     
                    $.ajax({
                        url: config.api_url,
                        data: { endpoint:'/wallet/observed', market:stock.market, symbol:stock.symbol },
                        type: stock.observed ? 'DELETE' : 'POST',
                        dataType: 'JSON',
                        success: function(response){                                
                            stock.observed = stock.observed ? false : true;
                            $(el).attr('data-value',stock.observed);                                
                        },
                        error: function(err){ if (config.debug) console.log(err); }
                    });                                                                                  
                });  
            }             
            button({ class: 'icon-btn icon-settings' }, function(){
                /*
                if (!me){
                    $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">Advanced Charting</div><div class="description">Sorry, feature only for logged users</div></div></div>');                            
                    return;
                } */
                if ($('.popup-advanced-charting-config').length){
                    $('.popup-btn').remove(); 
                    $('body').removeClass('with-popup').removeClass('with-blur'); 
                    return;
                }
                $('body').addClass('with-popup with-blur');                            
                button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur'); $('.quick-tools .actions > div').removeClass('active'); });                            
                    $.ajax({ url:"/extensions/entities/views/popups/config.html", cache:false, success: function(data){ $("#popup").html(data); }, error: function(e){ if (config.debug) console.log(e); }});
            });
            button({ class: 'icon-btn icon-brush' }, function(){                        
            $.ajax({ url:"/extensions/entities/views/popups/advanced-charting/sketchpad.html", cache:false, success: function(data){
                        $('#popup').html(data);
                        $('body').addClass('with-popup no-blur');                            
                        $('.popup-btn').remove();
                        $('#sketchpad').addClass('active');
                        
                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ 
                            $('#popup').html(''); 
                            $('.popup-btn').remove(); 
                            $('body').removeClass('with-popup with-blur no-blur'); 
                            $('#sketchpad').removeClass('active');
                        });                             
                        button({ class: 'icon-btn popup-btn icon-refresh' }, function(){ 
                            if (sketchpad) 
                                sketchpad.clear(); });                         
                        
                        //if (!sketchpad){
                            $.getScript('/media/js/external/sketchpad'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version,function(){
                                sketchpad = new Sketchpad({
                                    element:    '#sketchpad',
                                    width:      $('.graph-container .graph').width(),
                                    height:     $('.graph-container .graph').height(),
                                    color:      settings.design.color_text,
                                    penSize:    3
                                });            
                            });         
                        //}
                    },
                    error: function(e){ if (config.debug) console.log(e); }
                });                                
            });             
            /* button({ class: 'icon-btn icon-share' }, function(){                             
                navigator.clipboard.writeText(window.location.href);
                $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-share"></div><div class="title">Link Copied</div><div class="description">'+window.location.href+'</div></div></div>');                            
            }); */
            if (settings.contributor === 'yes'){
                button({ class: 'icon-btn icon-create' }, function(){ 
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
            //$.getScript('https://s3.tradingview.com/tv.js',function(){
                generateGraph();
            //});
            
            // ADDITIONALS
            infoReload();
            notesReload();
            newsReload();
            if (stock.transactions){ resultsReload(); }
                        
            // RELATED              
            if (stock.market === 'forex' || stock.market === 'fantoken' || stock.market === 'indices'){
                getItems({filters:[{ code:'market', value:stock.market, type: 'LIKE' }, { code:'id', value:stock.id, type :'not' }], target: '[data-src="related-1"]', size: 20, sort: 'shuffle', related:true, view:'grid', search:'' });                                                
            }else{
                if (stock.industry !== '' && stock.industry !== null){
                    getItems({filters:[{ code:'industry', value:stock.industry, type: 'LIKE' }, { code:'id', value:stock.id, type :'not' }], target: '[data-src="related-2"]', size: 20, sort: 'volume_desc', related:true, view:'grid', search:'' });                                                
                }else{
                    if (stock.sector !== '' && stock.sector !== null){
                        getItems({filters:[{ code:'sector', value:stock.sector, type: 'LIKE' }, { code:'id', value:stock.id, type :'not' }], target: '[data-src="related-1"]', size: 20, sort: 'shuffle', related:true, view:'grid', search:'' });                                                
                    }                    
                }                
            }            

        },
        error: function(e){ if (config.debug) console.log(e); }
    });
    });
});

$(document).off('click', '.description-popup');
$(document).on('click','.description-popup',function(){
    $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body hide-scroll"><div   class="logo-container">'+$('.results-info-title .logo-container').html()+'</div><div class="title">'+$('.results-info-title h2').html()+'</div><div class="description">'+$(this).attr('data-value').replace(';','<br /><br />')+'</div></div></div>');
});

$(window).on('resize', function () {
    if ($(document).width()>996){
        $('[data-view="overview"]').appendTo('.panel-content');
        $('[data-view="info"]').appendTo('.panel-content');
    }else{
        $('[data-view="overview"]').appendTo('.overview-container');
        $('[data-view="info"]').appendTo('.info-container');
    }    
});