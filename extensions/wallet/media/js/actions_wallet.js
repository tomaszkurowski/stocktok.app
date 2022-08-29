
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
                $('.wallet .privacy').html((wallet.public===1) ? 'Player' : 'Silent');                    
                $('.wallet .display-currency').text(settings.display_currency);
                $(".wallet-items.active").html(''); 
                $(".wallet-items.sold").html('');
                
                //UI
                

                button({ 
                     class: 'icon-btn icon-person' }, 
                     function(){ 
                         load_page('/players/view/'+(me.username !== wallet.username ? mvc.view : me.username),true);                   
                     }
                 );  
                
                
                if (me.username === wallet.username){
                    button({ 
                        class: 'icon-btn icon-shopping_cart' }, 
                        function(){ 
                            buy_sell_popup(); // => actions_item.js                      
                        }
                    ); 
                    button({ 
                        class: 'icon-btn icon-search2' }, 
                        function(){ location.href='/entities'; });             
                }
                if (wallet.items.length>0){
                    switcher({ 
                        key: 'editable',  
                        class: 'icon-settings1', 
                        value: settings.editable  ? settings.editable :  'false'},
                        function(){ editable();  // => ui.js                                              
                    });
                }
                      
                
                wallet.symbols = [];
                load_apexcharts(function(){
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
                                        '<div class="logo-container view-action">' + (item.logo ? '<img src="'+item.logo+'" class="logo" alt="logo-'+item.symbol+'" loading="lazy" />' : '<div class="logo no-img">'+item.symbol+'</div>') + '</div>'+                                       
                                        '<div class="results view-action" data-results="neutral">' +
                                            '<span class="label">Total & Margin:</span>'+
                                            '<div class="info">'+
                                                '<span class="price total"></span>'+
                                                '<span class="currency display-currency">'+settings.display_currency+'</span>' +
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

                                        mystock += '<div class="visibility">';
                                            mystock +='<div class="switcher"><span></span></div>';
                                            if (me.username === wallet.username && item.public === 0){
                                                mystock += '<div class="silent-transaction icon-user-secret"></div>';
                                            }                                        
                                        mystock +='</div>'+
                                    '</div>';              

                                    mystock += 
                                    '<div class="mystock-edit" data-stock-id="'+item.wallet_entities_id+'" data-stock-type="">' +

                                        '<h3>Edit: '+item.symbol.toUpperCase()+'</h3>'+
                                        '<input type="hidden" value="'+item.symbol+'" class="symbol" name="symbol" />' +
                                        '<div class="field"><span class="label">Purchased price</span>  <input type="number" value="'+item.purchased_price+'" placeholder="Price"      class="purchased_price" name="purchased_price"'+(item.public === 1 ? ' disabled':'')+' /></div>' +
                                        '<div class="field"><span class="label">Purchased qty</span>    <input type="number" value="'+item.purchased_qty+'"   placeholder="Qty"        class="purchased_qty"   name="purchased_qty"'+(item.public === 1 ? ' disabled':'')+' /></div>' +
                                        '<div class="field"><span class="label">Purchased date</span>   <input type="date"   value="'+item.purchased_date+'"  placeholder="yyyy-mm-dd" class="purchased_date"  name="purchased_date"'+(item.public === 1 ? ' disabled':'')+' /></div>' +
                                        '';

                                        // Sold fields
                                        if (item.type_of_transaction==='sold'){
                                            mystock += ''+
                                            '<div class="sep"></div>'+
                                            '<div class="field"><span class="label">Sold price</span>       <input type="number" value="'+item.sold_price+'" placeholder="Sold Price"  class="sold_price" name="sold_price"'+(item.public === 1 ? ' disabled':'')+' /></div>' +
                                            '<div class="field"><span class="label">Sold date</span>        <input type="date" value="'+item.sold_date+'" placeholder="Sold Date"      class="sold_date"  name="sold_date"'+(item.public === 1 ? ' disabled':'')+' /></div>' +
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
                                        '<input type="hidden" value="'+item.purchased_total+'" class="purchased_total" />'+
                                        '<input type="hidden" value="'+item.sold_total+'" class="sold_total" />'+
                                        '<input type="hidden" value="'+item.margin+'" class="margin" />'+
                                    '</div>';

                                mystock +=
                                '</div>' +
                                '<div class="visibility-layer"><div class="icon icon-visibility_off"></div></div>';                        

                                if (me.username === wallet.username){
                                    mystock += 
                                    '<div class="edit">'+
                                        (item.public === 0 ? '<div class="icon icon-trash mystock-delete"></div>' : '')+
                                        '<div class="icon icon-create"></div>'+                            
                                        '<div class="icon icon-move"></div>'+
                                    '</div>';
                                }

                            mystock +=
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

                            let options = {
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
                                    width: 1
                                },
                                grid: { row: { colors: ['transparent'] } },
                                tooltip: { enabled: false }
                            };

                            if (settings.wallet_layout === 'grid'){
                                new ApexCharts(document.querySelector('#trend-'+item.wallet_entities_id), options).render();
                            }


                        }

                    });
                
                
                    if ($('.wallet-items.active .mystock-container').length === 0){
                        $('.wallet-items.active').html('<div class="no-transactions"><div class="icon icon-account_balance_wallet"></div><div class="title">No active transactions</div></div>');
                    }
                    if ($('.wallet-items.sold .mystock-container').length === 0){
                        $('.wallet-items.sold').html('<div class="no-transactions"><div class="icon icon-auction"></div><div class="title">Nothing sold</div></div>');
                    }

                    reload();
                });
                // Moves                
                if (wallet.moves.length>0){
                    $('.wallet-items.moves').html('');
                    $.each(wallet.moves, function(i, move){

                        let el =  $('<div class="move box" data-id="'+move.id+'"></div>');
                        let logo = $('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').find('.logo-container').html();
                        let name = $('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').attr('data-symbol')+' ('+$('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').attr('data-market')+')';

                        let total   = $('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').find('input.purchased_total').val();
                        let margin  = $('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').find('input.margin').val();

                        if (move.action === 'sell'){
                            total   = $('.mystock-container[data-stock-id="'+move.wallet_entities_id+'"]').find('input.sold_total').val();
                        }                        

                        $(el).append(logo);
                        $(el).append('<div class="info"></div>');
                        $(el).find('.info').append('<div class="action"><span>'+move.action+'</span>: '+name+'</div>');
                        $(el).find('.info').append('<div class="date label">'+move.date+'</div>');

                        $(el).append('<div class="totals"></div>');
                        $(el).find('.totals').append('<div class="total">'+(move.action === 'buy' ? '' : '+') + format_price(total *currencies[settings.display_currency],2)+' '+settings.display_currency+'</div>');

                        if (move.action === 'sell'){
                            $(el).find('.totals').append('<div class="profit">'+(margin >= 0 ? '+' : '') + format_price(margin *currencies[settings.display_currency],2)+' '+settings.display_currency+'</div>');
                        }

                        $('.wallet-items.moves').append(el);                                    
                    });                    
                }else{                    
                    $('.wallet-items.moves').html('<div class="no-transactions"><div class="icon icon-shopping_cart"></div><div class="title">No moves</div></div>');                
                } 
                
                // Funds
                var funds_total = (parseFloat(wallet.funds_total)*currencies[settings.display_currency]).toFixed(2);
                $('.wallet.funds .funds-total').text(funds_total);
                $('.wallet.funds .funds-total-base').text(wallet.funds_total+' $');

                // Live
                /*
                var live = new WebSocket('wss://stocktok.online:8443');
                live.onopen = function(e) {


                    wallet.symbols.push('USDPLN');

                    var message = { action: "subscribe", tickers: wallet.symbols };
                    live.send(JSON.stringify(message));

                    if (config.debug) console.log("Live Connection established!");
                    
                    var liveInterval = window.setInterval(function(){
                        reload();
                    }, 1500);

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
                    if (config.debug) console.log(e);
                };                                                
                */
               
            },
            error: function(response){
                if (config.debug) console.log(response);
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
            
            if (item.type_of_transaction === 'active'){

                item.rate       = (1 / currencies[item.market_currency]).toFixed(config.precision_rate);
                                
                item.sold_rate  = round((currencies[item.purchased_currency] ? currencies[item.purchased_currency] : 1) / currencies[item.market_currency], config.precision_rate);
                item.total      = (item.price * item.purchased_qty * item.rate).toFixed(config.precision_total);

                if (item.purchased_currency !== item.market_currency){
                    //$margin = round(($sold_total*$sold_rate - $purchased_total * $old_transaction['purchased_rate'])/$sold_rate,2);
                    item.margin = round((item.total*item.sold_rate - item.purchased_total * item.purchased_rate)/item.sold_rate,2);
                }else{
                    item.margin = item.total - item.purchased_total;  
                }

                item.margin_percentage  = item.purchased_total !== 0 ? (item.margin / (item.purchased_total) * 100).toFixed(2) : 0;
                
                //console.log(item.symbol,item.margin,item.purchased_total);

                if ($(element).attr('data-visibility')==='visible'){
                    wallet.current_total  += parseFloat(item.total);            
                    wallet.current_margin += parseFloat(item.margin);                
                }

            }      
            if (item.type_of_transaction === 'sold'){

                item.total              = item.sold_total;

                if ($(element).attr('data-visibility')==='visible'){                
                    wallet.sold_purchased += parseFloat(item.purchased_total);
                    wallet.sold_total     += parseFloat(item.total);            
                    wallet.sold_margin    += parseFloat(item.margin);
                }

            }                           

            // Group aspect - Calculation
            if ($(element).attr('data-group')){ 
                if (groups.hasOwnProperty($(element).attr('data-group-id'))){
                    groups[$(element).attr('data-group-id')].purchased_total = parseFloat(groups[$(element).attr('data-group-id')].purchased_total)+parseFloat(item.purchased_total);
                    groups[$(element).attr('data-group-id')].total           = parseFloat(groups[$(element).attr('data-group-id')].total) + parseFloat(item.total);
                    groups[$(element).attr('data-group-id')].margin          = parseFloat(groups[$(element).attr('data-group-id')].margin) + parseFloat(item.margin);
                }else{
                    groups[$(element).attr('data-group-id')] = { total: item.total, margin:item.margin, purchased_total:item.purchased_total };                
                }
            }

            $(element).find('.current-price').text(format_price(item.price),6);  
            $(element).find('.price').val(item.price); 
            $(element).find('.total').text(format_price(item.total * currencies[settings.display_currency],2));
            $(element).find('.margin').text(format_price(item.margin * currencies[settings.display_currency],2));
            $(element).find('.margin-percentage').text(item.margin_percentage);

            if (item.margin>0)      $(element).find('.results').attr('data-results','with profit');
            if (item.margin<0)      $(element).find('.results').attr('data-results','with lost');
            if (item.margin === 0)  $(element).find('.results').attr('data-results','neutral');
            
            $(element).find('.updated-at').text(item.last_updated_at);

        });
 
        wallet.sold_margin_percentage = (wallet.sold_margin / (wallet.sold_purchased ? wallet.sold_purchased : 1) * 100).toFixed(2);
        if (!wallet.sold_margin_percentage) wallet.sold_margin_percentage = 0;


        // Group Aspect - Update of Master's totals
        if ($('.wallet-items .group-closed').length){        
            $('.wallet-items .group-closed').each(function(key,element){
                var group_id = $(element).attr('data-group-id');

                //console.log($(element).attr('data-symbol'));
                //console.log(groups[group_id]);
                groups[group_id].margin_percentage = (groups[group_id].margin / groups[group_id].purchased_total * 100).toFixed(2);

                $(element).find('.total').text(format_price(groups[group_id].total * currencies[settings.display_currency],2));
                $(element).find('.margin').text(format_price(groups[group_id].margin * currencies[settings.display_currency],2));
                $(element).find('.margin-percentage').text(groups[group_id].margin_percentage);
            });
        }

        $('.wallet.active .results .total ').text(format_price(wallet.current_total * currencies[settings.display_currency],2));
        $('.wallet.active .results .margin').text(format_price(wallet.current_margin * currencies[settings.display_currency],2));
        $('.wallet.sold   .results .total ').text(format_price(wallet.sold_margin * currencies[settings.display_currency],2));
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