
    var wallet = {};
    var options_popup = {};

    var live_prices = [];

    function init(){ 

        if (mvc.view) wallet.username = mvc.view; 
        else          wallet.username = sessionStorage.getItem('username');

        $("#mystock-result").html(''); 
        $.ajax({
            url: config.api_url,
            data:{ 
                endpoint: '/wallet',
                username: wallet.username,
                currency: settings.display_currency
            },
            type:       'GET',
            dataType:   'JSON',
            cache:      false, 

            success: function(response){

                if (response.success===false){                
                    $("#mystock-result").html('<div class="error-msg">'+response.msg+'</div>');                
                    return;               
                }             
                
                wallet = response;
                localStorage.setItem('wallet',JSON.stringify(wallet));
                if (config.debug) console.log('\n','Wallet: \n',wallet,'\n\n');

                $('.wallet .owner').html(wallet.username);
                $('.wallet .privacy').html((wallet.public===1) ? 'Public' : 'Private');                    
                $('.wallet .display-currency').text(settings.display_currency);
                $(".wallet-items.active").html(''); 
                $(".wallet-items.sold").html('');
                
                
                
                
                wallet.symbols = [];
                $.each(wallet.items, function(i, item){ 

                    wallet.symbols.push(item.symbol.toUpperCase());           
                    item.last_updated_at = iosDatesFix(item.last_updated_at);

                    // GROUPS 
                    item.group_id = item.wallet_entities_id;

                    if ((item.type_of_transaction==='active') && $(".wallet-items.active [data-symbol='"+item.symbol+"'][data-market='"+item.market+"']:not([data-group='child'])").length){ 
                        var master = $(".wallet-items.active [data-symbol='"+item.symbol+"'][data-market='"+item.market+"']:not([data-group='child'])");

                        item.group_id = $(master).attr('data-stock-id');
                        item.group = "child";                     
                        $(master).attr('data-group','master');
                        $(master).attr('data-group-id',item.group_id);    
                    }
                    if ((item.type_of_transaction==='sold') && $(".wallet-items.sold [data-symbol='"+item.symbol+"'][data-market='"+item.market+"']:not([data-group='child'])").length){                    
                        var master = $(".wallet-items.sold [data-symbol='"+item.symbol+"'][data-market='"+item.market+"']:not([data-group='child'])");

                        item.group_id = $(master).attr('data-stock-id');
                        item.group = "child";                     
                        $(master).attr('data-group','master');
                        $(master).attr('data-group-id',item.group_id);                                        
                    }
                    if (settings.hasOwnProperty('closed_groups') && $.inArray(String(item.group_id),settings.closed_groups)!==-1){
                        item.group_closed = true;
                    }


                    // HTML
                    var mystock = '';
                    mystock += '' +
                    '<div class="mystock-container item'+' drag-item active'+' live'+
                                (item.group_closed && item.group_closed===true ? ' group-closed' : '')+
                            '" '+
                            'draggable="true" '+
                            'data-stock-id="'+item.wallet_entities_id+'" '+
                            'data-position='+item.position+' '+
                            'data-symbol="'+item.symbol+'" '+
                            'data-market="'+item.market+'" '+
                            'data-price="'+item.price+'" '+
                            'data-visibility="visible" '+                        
                            (item.group === 'child' ? 'data-group="child" data-group-id="'+item.group_id+'" ' : '') +
                            'data-transaction-type="'+item.type_of_transaction+'" '+
                        '>';
                    mystock += '' +                
                            '<div class="group-info">'+
                                (item.group_closed && item.group_closed===true ? 
                                    '<div class="icon icon-chain"></div>' : 
                                    '<div class="icon icon-chain-broken"></div>')+
                            '</div>'+
                            '<div class="mystock">' +
                                '<div class="mystock-view">' +
                                    '<div class="symbol view-action">'+item.symbol+'</div>'+
                                    '<div class="logo-container">' + (item.logo ? '<img src="'+item.logo+'" class="logo" />' : '<div class="logo no-img">'+item.symbol+'</div>') + '</div>'+                                       
                                    '<div class="results view-action" data-results="with lost">' +
                                        '<span class="label">'+(item.type_of_transaction==='active' ? 'Current Total' : 'Sold Total') + ' & Margin:</span>'+
                                        '<div class="info">'+
                                            '<span class="price total"></span>'+
                                            '<span class="currency display-currency"></span>' +
                                        '</div>'+
                                        '<div class="additionals">'+                                    
                                            '<span class="price margin"></span>'+
                                            '<span class="percentage margin-percentage with-brackets"></span>'+
                                            '<div class="icon icon-arrow-up"></div>'+
                                        '</div>'+                                                                                       
                                    '</div>';

                                    // Current price & Trend
                                    if (item.type_of_transaction==='active'){
                                        mystock += 
                                        '<div class="current view-action">'+
                                            '<span class="label updated-at"></span>'+
                                            '<div class="info">'+
                                                '<span class="current-price"></span>'+
                                                '<span class="currency market-currency">'+item.market_currency+'</span>' +
                                            '</div>'+
                                        '</div>'+                                                                    
                                        '<div class="stock-graph-container view-action">'+
                                            '<span class="label">Trend: '+settings.wallet_trend_size+'</span>'+                                     
                                            '<div class="stock-graph-line" id="trend-'+item.wallet_entities_id+'"></div>'+
                                        '</div>';
                                    }

                                    mystock +=
                                    '<div class="visibility"><div class="switcher"><span></span></div></div>'+
                                '</div>'+                           
                                '<div class="mystock-edit" data-stock-id="'+item.wallet_entities_id+'" data-stock-type="">' +
                                    '<h3>Edit: '+item.symbol.toUpperCase()+'</h3>'+
                                    '<input type="hidden" value="'+item.symbol+'" class="symbol" name="symbol" />' +
                                    '<div class="field"><span class="label">Purchased price</span>  <input type="number" value="'+item.purchased_price+'" placeholder="Price"      class="purchased_price" name="purchased_price" /></div>' +
                                    '<div class="field"><span class="label">Purchased qty</span>    <input type="number" value="'+item.purchased_qty+'"   placeholder="Qty"        class="purchased_qty"   name="purchased_qty" /></div>' +
                                    '<div class="field"><span class="label">Purchased date</span>   <input type="date"   value="'+item.purchased_date+'"  placeholder="yyyy-mm-dd" class="purchased_date"  name="purchased_date" /></div>' +
                                    '';

                                    // Sold fields
                                    if (item.type_of_transaction==='sold'){
                                        mystock += ''+
                                        '<div class="sep"></div>'+
                                        '<div class="field"><span class="label">Sold price</span>       <input type="number" value="'+item.sold_price+'" placeholder="Sold Price"  class="sold_price" name="sold_price" /></div>' +
                                        '<div class="field"><span class="label">Sold date</span>        <input type="date" value="'+item.sold_date+'" placeholder="Sold Date"      class="sold_date"  name="sold_date" /></div>' +
                                        '';
                                    }

                                    mystock += ''+
                                    '<div class="actions">'+
                                        '<div class="buy"  data-action="buy-more">More</div>'+
                                        '<div class="sell" data-action="sell-it">Sell</div>'+
                                    '</div>'+
                                    '<input type="hidden" value="'+item.market_currency+'" class="currency" />'+
                                    '<input type="hidden" value="'+item.price+'" class="price" />'+
                                    '<input type="hidden" value="'+item.price_change+'" class="price_change" />'+
                                '</div>'+
                            '</div>' +
                            '<div class="visibility-layer"><div class="icon icon-visibility_off"></div></div>' +
                            '<div class="edit">'+
                                '<div class="icon icon-trash mystock-delete"></div>'+
                                '<div class="icon icon-create"></div>'+                            
                                '<div class="icon icon-move"></div>'+
                            '</div>';
                        '</div>';                                     

                    if (item.type_of_transaction==='active'){ $(".wallet-items.active").append(mystock); }
                    if (item.type_of_transaction==='sold')  { $(".wallet-items.sold").append(mystock); }


                    // Trend sparkline graph
                    if (item.type_of_transaction==='active' && item.trend && settings.wallet_trend_size){

                        var data;
                        switch (settings.wallet_trend_size){
                            case '5-days':   data = item.trend.daily.length ? item.trend.daily.reverse() : null; break;
                            case '5-weeks':  data = item.trend.weekly.length ? item.trend.weekly.reverse() : null; break;
                            case '6-months': data = item.trend.monthly.length ? item.trend.monthly.reverse() : null; break;
                        }

                        var options = {
                            series: [{ data: data }],
                            colors: [settings.design.color_base],
                            chart: {
                                height: 50,
                                type: 'area',
                                zoom: { enabled: false },                        
                                toolbar: { show: false },
                                sparkline: { enabled: true },
                            },
                            dataLabels: { enabled: false },
                            stroke: {
                                curve: 'smooth',
                                width: 2
                            },
                            grid: { row: { colors: ['transparent'] } },
                            tooltip: { enabled: false }
                        };

                        new ApexCharts(document.querySelector('#trend-'+item.wallet_entities_id), options).render();
                        
                    }

                });   
                reload();

                // FUNDS
                if (wallet.funds.length>0){
                    var funds_total = 0;

                    $('.wallet-items.funds').html('');
                    $.each(wallet.funds, function(i, fund){
                        var element =  '<div class="fund" data-id="'+fund.id+'">'+
                                        (fund.comment.length >0 ? '<div class="comment">'+fund.comment+'</div>' : '')+
                                        '<div class="top">'+
                                            '<div class="date label">'+fund.date+'</div>'+
                                            '<div class="balance">'+(fund.balance > 0 ? '+' : '')+format_price(fund.balance)+' '+settings.display_currency+'</div>'+
                                            '<div class="funds-edit"><div class="icon icon-btn icon-bin funds-delete"></div></div>'+
                                        '</div>'+                                     
                                    '</div>';

                        $('.wallet-items.funds').append(element);    
                        funds_total += fund.balance;                                
                    });

                    $('.wallet[data-id="funds"] .funds-total').text(format_price(funds_total));
                }

                // Live

                var live = new WebSocket('wss://stocktok.online:8443');
                live.onopen = function(e) {


                    wallet.symbols.push('USDPLN');

                    var message = { action: "subscribe", tickers: wallet.symbols };
                    live.send(JSON.stringify(message));

                    if (config.debug) console.log("Live Connection established!");
                    
                    var liveInterval = window.setInterval(function(){
                        reload();
                    }, 500);

                };

                live.onmessage = function(msg) {
                                        
                    var data = msg.data;
                    var item = JSON.parse(data);

                    if (item.hasOwnProperty('s')){
                        
                        item.s = item.s.toLowerCase();
                        if (!live_prices.hasOwnProperty(item.s)){
                            live_prices[item.s] = [];
                        }                                       

                        live_prices[item.s].price = item.p;
                        live_prices[item.s].live = true;
                        live_prices[item.s].last_updated_at = format_datetime(item.t);
                    }
                        
                    //reload();
                    //if (config.debug) console.log(item.s+': '+item.p);
                               
                };
                live.onerror = function(e){
                    console.log(e);
                };
                
                



            },
            error: function(response){
                console.log(response);
            }
        });
    }



    function get_rate_from_date(type,rates){

        if (rates.hasOwnProperty(type) && rates[type].hasOwnProperty(settings.display_currency)){
            return rates[type][settings.display_currency];
        }
        return 1;
    }
    
    

    function reload(){

        wallet.current_total    = 0;
        wallet.current_margin   = 0;
        wallet.sold_purchased   = 0;
        wallet.sold_total       = 0;
        wallet.sold_margin      = 0;
        

        var groups = [];
        $.each(wallet.items,function(symbol,item){
            var element = $("[data-stock-id="+item.wallet_entities_id+"]");        

            //console.log(item.symbol);
            //console.log(live_prices);
            if (live_prices.hasOwnProperty(item.symbol)){
                item.price = live_prices[item.symbol].price;
                item.last_updated_at = live_prices[item.symbol].last_updated_at;
            }
            
            
            item.purchased_total    = item.purchased_qty * item.purchased_price * get_rate_from_date('purchased',item.rates); 

            if (item.type_of_transaction === 'active'){

                item.total              = item.price * item.purchased_qty * get_rate_from_date('latest',item.rates);
                item.margin             = item.total - item.purchased_total; 
                item.margin_percentage  = item.purchased_total !== 0 ? Math.round(item.margin / (item.purchased_total) * 100,2) : 0;

                if ($(element).attr('data-visibility')==='visible'){
                    wallet.current_total  += item.total;            
                    wallet.current_margin += item.margin;                
                }

            }      
            if (item.type_of_transaction === 'sold'){

                item.total              = item.sold_price * item.purchased_qty * get_rate_from_date('sold',item.rates);
                item.margin             = item.total - item.purchased_total; 
                item.margin_percentage  = item.purchased_total !== 0 ? Math.round(item.margin / (item.purchased_total) * 100,2) : 0;

                if ($(element).attr('data-visibility')==='visible'){                
                    wallet.sold_purchased += item.purchased_total;
                    wallet.sold_total     += item.total;            
                    wallet.sold_margin    += item.margin;
                }

            }                           

            // Group aspect - Calculation
            if ($(element).attr('data-group')){ 
                if (groups.hasOwnProperty($(element).attr('data-group-id'))){
                    groups[$(element).attr('data-group-id')].purchased_total += item.purchased_total;
                    groups[$(element).attr('data-group-id')].total           += item.total;
                    groups[$(element).attr('data-group-id')].margin          += item.margin;
                }else{
                    groups[$(element).attr('data-group-id')] = { total: item.total, margin:item.margin, purchased_total:item.purchased_total };                
                }
            }

            $(element).find('.current-price').text(format_price(item.price),6);  
            $(element).find('.price').val(item.price); 
            $(element).find('.total').text(format_price(item.total,2));
            $(element).find('.margin').text(format_price(item.margin,2));
            $(element).find('.margin-percentage').text(item.margin_percentage);

            if (item.margin_percentage>0) $(element).find('.results').attr('data-results','with profit');
            $(element).find('.updated-at').text(item.last_updated_at);

        });
        
        wallet.sold_margin_percentage = Math.round(wallet.sold_margin / wallet.sold_purchased * 100,2);
        if (!wallet.sold_margin_percentage) wallet.sold_margin_percentage = 0;


        // Group Aspect - Update of Master's totals
        if ($('.wallet-items .group-closed').length){        
            $('.wallet-items .group-closed').each(function(key,element){
                var group_id = $(element).attr('data-group-id');

                //console.log($(element).attr('data-symbol'));
                groups[group_id].margin_percentage = Math.round(groups[group_id].margin / groups[group_id].purchased_total * 100,2);

                $(element).find('.total').text(format_price(groups[group_id].total,2));
                $(element).find('.margin').text(format_price(groups[group_id].margin,2));
                $(element).find('.margin-percentage').text(groups[group_id].margin_percentage);
            });
        }

        $('.wallet.active .results .total ').text(format_price(wallet.current_total,2));
        $('.wallet.active .results .margin').text(format_price(wallet.current_margin,2));
        $('.wallet.sold   .results .total ').text(format_price(wallet.sold_margin,2));
        $('.wallet.sold   .results .margin').text(wallet.sold_margin_percentage+'%');      


        var targets = document.querySelectorAll('.drag-container .icon-move');
        [].forEach.call(targets, function(target) {
          addTargetEvents(target);
        });

        var listItems = document.querySelectorAll('.drag-item');
        [].forEach.call(listItems, function(item) {
          addEventsDragAndDrop(item);
        });
    }