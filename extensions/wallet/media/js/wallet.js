var live    = {};
var loadedSummary   = false;
var wallet = {};
var screener;

function liveReload(options={}){
    $.each(live, function(code, item){ 
        $('[data-code="'+code+'"] [data-src="last_updated_at"]').text(format_datetime(item.last_updated_at,{ format: 'D/M, LT' }));
        $('[data-code="'+code+'"] [data-src="price"]').text(item.price);
    });
}
function sortReload(){
    
    if (settings.wallet_sort === 'custom'){
        $('.leaf').css('order',0);
        init_sorting();
        return;
    }
    wallet.sort.sort(dynamicSort(settings.wallet_sort));
    if (config.debug) console.log('Sort Reload',wallet.sort);
    
    it=0;
    $.each(wallet.sort,function(order,item){
        $('[data-id="'+item.id+'"]').css('order',it++);
    });
    
}

function resultsReload(){

    let totals = {};
    wallet.current_total = 0;
    wallet.current_margin = 0;
    wallet.sold_total = 0;
    wallet.sold_margin = 0;
    wallet.sold_purchased = 0;
    wallet.current_purchased = 0;
    wallet.groups = [];
    wallet.groups['active'] = [];
    wallet.groups['sold'] = [];
    wallet.sort = []; 
    wallet.highest_current_margin   =0;
    wallet.highest_current_marginp  =0;
    wallet.lowest_current_margin    =0;
    wallet.lowest_current_marginp   =0;
    wallet.highest_sold_margin      =0;
    wallet.highest_sold_marginp     =0;
    wallet.lowest_sold_margin       =0;
    wallet.lowest_sold_marginp      =0;
    
    $.each(wallet.items, function(id, item){             

        // @Todo: item.price = live;
        
        let element = $('[data-id="'+item.wallet_entities_id+'"][data-visibility="visible"]');           

        item.rate       = (1 / currencies[item.market_currency]).toFixed(config.precision_rate);                                
        item.sold_rate  = round((currencies[item.purchased_currency] ? currencies[item.purchased_currency] : 1) / currencies[item.market_currency], config.precision_rate);
        item.total      = (item.price * item.purchased_qty * item.rate).toFixed(config.precision_total);

        if (item.type_of_transaction === 'active'){                
            item.margin     = item.purchased_currency !== item.market_currency ? (round((item.total*item.sold_rate - item.purchased_total * item.purchased_rate)/item.sold_rate,2)) : (item.total - item.purchased_total);
            item.marginp    = item.margin === 0 ? 0 : (item.purchased_total !== 0 ? (item.margin / (item.purchased_total) * 100).toFixed(2) : 0);                            
            item.total = (item.price * item.purchased_qty * item.rate).toFixed(config.precision_total);
            if ($(element).attr('data-visibility')==='visible'){
                wallet.current_total  += parseFloat(item.total);            
                wallet.current_margin += parseFloat(item.margin);
                wallet.current_purchased +=parseFloat(item.purchased_total);
                if (parseFloat(item.margin)>wallet.highest_current_margin){  $('.wallet[data-type="active"] [data-src="highest-margin"]').html(format_price(item.margin * currencies[settings.display_currency],2)+' | <span>'+item.symbol+'</span>'); wallet.highest_current_margin = parseFloat(item.margin); }
                if (parseFloat(item.marginp)>wallet.highest_current_marginp){ $('.wallet[data-type="active"] [data-src="highest-marginp"]').html(item.marginp+' | <span>'+item.symbol+'</span>'); wallet.highest_current_marginp = parseFloat(item.marginp); }
                if (parseFloat(item.margin)<wallet.lowest_current_margin){  $('.wallet[data-type="active"] [data-src="lowest-margin"]').html(format_price(item.margin * currencies[settings.display_currency],2)+' | <span>'+item.symbol+'</span>'); wallet.lowest_current_margin = parseFloat(item.margin); }
                if (parseFloat(item.marginp)<wallet.lowest_current_marginp){ $('.wallet[data-type="active"] [data-src="lowest-marginp"]').html(item.marginp+' | <span>'+item.symbol+'</span>'); wallet.lowest_current_marginp = parseFloat(item.marginp); }                
            }  

        }            
        if (item.type_of_transaction === 'sold'){
            item.marginp = item.margin_percentage;
            item.total = item.sold_total;
            if ($(element).attr('data-visibility')==='visible'){                
                wallet.sold_purchased += parseFloat(item.purchased_total);
                wallet.sold_total     += parseFloat(item.total);            
                wallet.sold_margin    += parseFloat(item.margin);
                if (parseFloat(item.margin)>wallet.highest_sold_margin){  $('.wallet[data-type="sold"] [data-src="highest-margin"]').html(format_price(item.margin * currencies[settings.display_currency],2)+' | <span>'+item.symbol+'</span>'); wallet.highest_sold_margin = parseFloat(item.margin); }
                if (parseFloat(item.marginp)>wallet.highest_sold_marginp){ $('.wallet[data-type="sold"] [data-src="highest-marginp"]').html(item.marginp+' | <span>'+item.symbol+'</span>'); wallet.highest_sold_marginp = parseFloat(item.marginp); }
                if (parseFloat(item.margin)<wallet.lowest_sold_margin){  $('.wallet[data-type="sold"] [data-src="lowest-margin"]').html(format_price(item.margin * currencies[settings.display_currency],2)+' | <span>'+item.symbol+'</span>'); wallet.lowest_sold_margin = parseFloat(item.margin); }
                if (parseFloat(item.marginp)<wallet.lowest_sold_marginp){ $('.wallet[data-type="sold"] [data-src="lowest-marginp"]').html(item.marginp+' | <span>'+item.symbol+'</span>'); wallet.lowest_sold_marginp = parseFloat(item.marginp); }                            
            }
        } 
        wallet.sort.push({
            id:item.wallet_entities_id,
            symbol:item.symbol,
            market:item.market,
            margin: parseFloat(item.margin * currencies[settings.display_currency]),
            marginp: parseFloat(item.marginp),
            total: parseFloat(item.total * currencies[settings.display_currency])
        });
        
        $(element).find('[data-src="total"]').text(format_price(item.total * currencies[settings.display_currency],2));
        $(element).find('[data-src="display_currency"]').text(settings.display_currency);
        $(element).find('[data-src="margin"]').attr('data-color',item.margin === 0 ? '' : (item.margin>0 ? 'green' : 'red')).text(format_price(item.margin * currencies[settings.display_currency],2));
        $(element).find('[data-src="marginp"]').text(item.marginp+ ' %').attr('data-color',item.margin === 0 ? '' : (item.margin>0 ? 'green' : 'red'));

        /* Grouping */
        item.code = item.symbol+'.'+item.market;                        
        if ($('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"][data-grouped="true"]').length>1){            
            $('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"]').addClass('group-hide');            
            $('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"]').first().removeClass('group-hide');            
                        
            if (!wallet.groups[item.type_of_transaction][item.code]) wallet.groups[item.type_of_transaction][item.code] = { total:0, purchased_total:0, margin:0, marginp:0 };
            wallet.groups[item.type_of_transaction][item.code].total += parseFloat(item.total);
            wallet.groups[item.type_of_transaction][item.code].purchased_total += parseFloat(item.purchased_total);
            wallet.groups[item.type_of_transaction][item.code].margin += parseFloat(item.margin);
            wallet.groups[item.type_of_transaction][item.code].marginp = parseFloat(wallet.groups[item.type_of_transaction][item.code].margin === 0 ? 0 : (wallet.groups[item.type_of_transaction][item.code].purchased_total !== 0 ? (wallet.groups[item.type_of_transaction][item.code].margin / (wallet.groups[item.type_of_transaction][item.code].purchased_total) * 100).toFixed(2) : 0));             
            let element = $('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"]').first();
            $(element).find('[data-src="total"]').text(format_price(wallet.groups[item.type_of_transaction][item.code].total * currencies[settings.display_currency],2));
            $(element).find('[data-src="margin"]').attr('data-color',wallet.groups[item.type_of_transaction][item.code].margin === 0 ? '' : (wallet.groups[item.type_of_transaction][item.code].margin>0 ? 'green' : 'red')).text(format_price(wallet.groups[item.type_of_transaction][item.code].margin * currencies[settings.display_currency],2));
            $(element).find('[data-src="marginp"]').text(wallet.groups[item.type_of_transaction][item.code].marginp+ ' %').attr('data-color',wallet.groups[item.type_of_transaction][item.code].marginp === 0 ? '' : (wallet.groups[item.type_of_transaction][item.code].marginp>0 ? 'green' : 'red'));            
            if (!$(element).find('.unlink').length){
                if (settings.view_wallet === 'screener'){
                    $(element).find('.logo').prepend('<div class="icon-btn icon-chain unlink"></div>');
                }else{
                    $(element).prepend('<div class="icon-btn icon-chain unlink"></div>');
                }
                $(element).find('.link').remove();
            } 
        }
        if ($('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"][data-grouped="false"]').length>1){
    
            $('[data-type="'+item.type_of_transaction+'"][data-code="'+item.code+'"]').removeClass('group-hide');
            if (!$(element).find('.unlink').length){
                if (settings.view_wallet === 'screener'){
                    $(element).find('.logo').prepend('<div class="icon-btn icon-chain-broken link"></div>');
                }else{
                    $(element).prepend('<div class="icon-btn icon-chain-broken link"></div>');
                }
            }
            $(element).find('.unlink').remove();
        }
    });      

    wallet.sold_marginp = (wallet.sold_margin / (wallet.sold_purchased ? wallet.sold_purchased : 1) * 100).toFixed(2);
    wallet.current_marginp = (wallet.current_margin / (wallet.current_purchased ? wallet.current_purchased : 1) * 100).toFixed(2);

    $('.wallet[data-type="active"] [data-src="total"]').text(format_price(wallet.current_total * currencies[settings.display_currency],2)+' '+settings.display_currency);
    $('.wallet[data-type="active"] [data-src="margin"]').text(format_price(wallet.current_margin * currencies[settings.display_currency],2)+' '+settings.display_currency).attr('data-color',wallet.current_margin === 0 ? '' : (wallet.current_margin>0 ? 'green' : 'red'));
    $('.wallet[data-type="active"] [data-src="marginp"]').text(wallet.current_marginp+'%');
    $('.wallet[data-type="sold"]   [data-src="margin"] ').text(format_price(wallet.sold_margin * currencies[settings.display_currency],2)+' '+settings.display_currency).attr('data-color',wallet.sold_margin === 0 ? '' : (wallet.sold_margin>0 ? 'green' : 'red'));
    $('.wallet[data-type="sold"]   [data-src="marginp"]').text(wallet.sold_marginp+'%');
    $('.wallet[data-type="sold"]   [data-src="purchased"]').text(format_price(wallet.sold_purchased * currencies[settings.display_currency],2)+' '+settings.display_currency);
    
    sortReload();
}

function movesReload(){
    
    $.ajax({ url: config.api_url, data:{ endpoint: '/wallet/moves' }, type: 'GET', dataType: 'JSON', cache: false, 
        success: function(response){                        
            wallet.moves = response.items;
            if (config.debug)console.log('moves',wallet.moves);
            
            $('[data-src="all-moves"]').html('').append('<tbody></tbody>');
            $.each(wallet.moves, function(i, move){
                let el;
                let col;
                if (move.type === 'active'){
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    
                    $(col).append('<span class="point"></span>');
                    $(col).append('Active <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.purchased_date, { format: 'L, [\r\n]LT' })+'</div>');
                    
                    //$(el).append('<td>'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b>'+(move.purchased_rate !== null && move.purchased_rate !== 1 ? '<br /><a>('+move.purchased_rate+' '+move.purchased_currency+')</a>' : '')+'</td>');
                    /*
                    $(el).append('<td style="padding:0"><div class="icon-btn icon-auction"></div></td>').bind('click',function(){                    
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
                    */
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="all-moves"] tbody');
                }else{  
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    $(col).append('<span class="point" data-color="'+(move.margin>0 ? 'green' : 'red')+'"></span>');
                    $(col).append('Sold <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.sold_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.sold_date, { format: 'L, [\r\n]LT' })+'</div>');
                    $(col).append('<div class="results" data-color="'+(move.margin>0 ? 'green' : 'red')+'">'+(move.margin>0 ? '+ ' : '')+format_price(move.margin * currencies[settings.display_currency],2)+'');
                    
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="all-moves"] tbody');
                    
                    el  = $('<tr [data-id="'+move.wallet_entities_id+'"]></tr>');
                    col = $('<td></td>');
                    $(col).append('<span class="point" data-color="gray"></span>');
                    $(col).append('Bought <a>'+move.symbol+'</a>');
                    $(col).append('<div class="details">'+move.purchased_qty+'x <b>'+move.purchased_price+' '+move.market_currency+'</b></div>');                    
                    $(col).append('<div class="date">at: '+format_datetime(move.purchased_date, { format: 'L, [\r\n]LT' })+'</div>');
                    
                    $(col).appendTo(el);
                    $(el).appendTo('[data-src="all-moves"] tbody');                    
                    
                }
            });
            $('.wallet.moves .counter').text(wallet.moves.length).addClass(wallet.moves.length>0 ? 'active' : '');
        }
    });
}

function walletReload(){

    wallet.username = mvc.view ? mvc.view : (sessionStorage.getItem('username') ? sessionStorage.getItem('username') : Cookies.get('username'));
    
    if (wallet.username === undefined){
        
        console.log('no username case');
        $('[data-src="wallet.username"]').text('Guest');
        $('[data-src="wallet.avatar"]').html('<span class="no-avatar icon-user-secret"></span>');                
        
        $('[data-src="all"]').addClass('empty').html('<tr><td><div class="icon icon-hourglass_empty"></div><h3>Your portfolio is empty</h3><p>To find some first companies: <div class="btn primary" onclick="location.href=\'/market/search?market-is-nasdaq&sort-DESC-volume\'">click here</div></p></td></tr>');
        
        return;
    }
    

    $.ajax({
        url: config.api_url,
        data:{ 
            endpoint: '/wallet',
            username: wallet.username
        },
        type:       'GET',
        dataType:   'JSON',
        cache:      false, 
        success: function(response){

            wallet = response;
            
            if (config.debug) console.log('wallet',wallet);

            $('[data-src="wallet.username"]').text(wallet.username);
            $('[data-src="wallet.avatar"]').html(wallet.avatar ? '<img src="'+wallet.avatar+'" class="avatar" />' : '<span class="no-avatar icon-person1"></span>');
            $('[data-src="wallet.country"]').html((wallet.country ? '<img src="/media/img/flags/'+wallet.country+'.svg" class="flag-small" />' : ''));
            $('[data-src="wallet.bio"]').text(wallet.bio);
            $('[data-src="wallet.mode"]').text(wallet.mode);
            $('[data-src="wallet.public"]').text(wallet.public ? 'Yes' : 'No');
            if (wallet.mode === 'game'){
                $('[data-src="wallet.funds"]').text(format_price(wallet.funds_total,2)+' '+settings.display_currency);
                $('[data-src="wallet.funds"]').parents('.row').removeClass('hide');
            }

            if (wallet.items.length === 0){ $('[data-src="all"]').addClass('empty').html('<tr><td><div class="icon icon-hourglass_empty"></div><h3>Your portfolio is empty</h3><p>To find some first companies: <div class="btn primary" onclick="location.href=\'/market/search?market-is-nasdaq&sort-DESC-volume\'">click here</div></p></td></tr>'); return; }
            $('.screen').html('<table class="leafs" data-view="'+settings.view_wallet+'" data-src="all"><thead></thead><tbody></tbody></table>');

            $('.wallet[data-type="active"] .switch-slider input').prop('checked',settings.wallet_show_active);
            $('.wallet[data-type="sold"] .switch-slider input').prop('checked',settings.wallet_show_sold);

            var apexcharts = {};
            load_apexcharts(function(){
                                
                var visibleColumns = [];
                switch (settings.screener_view){
                    case 'performance':
                        visibleColumns = ['adjusted_close','avgvol_200d','avgvol_50d','beta','ema_200d','ema_50d','hi_250d','high','lo_250d','low','open','previous_price','price','price_change','price_change_percentage','volume'];
                    break;
                    case 'results':
                        visibleColumns = ['purchased_date','purchased_price','purchased_qty','purchased_rate','purchased_total','sold_date','sold_price','sold_rate','sold_total','leverage','strategy'];
                    break;                    
                    case 'descriptive':
                        visibleColumns = ['type','market','industry','sector','last_trading_day','last_updated_at','market_capitalization','market_currency'];
                    break;
                }
                
                $.each(wallet.items, function(i, item){

                                        
                    if (item.purchased_date>wallet.lastmove){ wallet.lastmove = item.purchased_date; }
                    if (item.sold_date>wallet.lastmove){ wallet.lastmove = item.sold_date; }
                    
                    live[item.symbol+'.'+item.market] = { price: item.price, high: item.high, low: item.low, volume: item.volume, last_updated_at: item.last_updated_at };

                    let el = $('<tr class="leaf drag-item" draggable="true"></tr>')
                    .attr('data-id',item.wallet_entities_id)
                    .attr('data-code',item.symbol+'.'+item.market)
                    .attr('data-type',item.type_of_transaction)
                    .attr('data-visibility','visible')
                    .attr('data-purchased-total',item.purchased_total)
                    .attr('data-purchased-currency',item.purchased_currency)
                    .attr('data-grouped',settings.wallet_show_grouped);
            
                    if (item.type_of_transaction === 'active' && settings.wallet_show_active === false){ $(el).addClass('hide'); }
                    if (item.type_of_transaction === 'sold' && settings.wallet_show_sold === false){ $(el).addClass('hide'); }
            
                    switch(settings.view_wallet){
                        case 'screener':
                            $(el)
                            .append(item.logo ? '<td class="logo'+'" data-title="Logo"><img src="'+item.logo+'" /></td>' : '<td class="symbol" data-title="Symbol">'+item.symbol+'</td>')
                            .append('<td class="name"   data-title="Name">'+item.name+'</td>')
                            .append('<td class="price"  data-title="Price"  data-src="price"></td>')
                            .append('<td class="total"  data-title="Total"  data-src="total"></td>')
                            .append('<td class="margin" data-title="Margin" data-src="margin"></td>');
                    
                            $.each(item,function(i,v){
                               if (visibleColumns.length === 0 || $.inArray(i,visibleColumns) !== -1){                                    
                                    if ($.inArray(i,['id','wallet_entities_id','logo','website','trend','rates','current_total','margin','margin_daily','margin_percentage','status']) !== -1) return;
                                    $(el).append('<td class="additional" data-title="'+i+'">'+(v === null ? '' : v) +'</td>');                                     
                               }
                            });
                            
                        break;
                        default:
                            $(el)
                            .append(item.logo ? '<td class="logo'+(settings.wallet_show_price ? '' : ' center')+'"><img src="'+item.logo+'" /></td>' : '<td class="symbol'+(settings.wallet_show_price ? '' : ' center')+'" data-title="Symbol">'+item.symbol+'</td>')
                            .append('<td class="name" data-title="Name">'+item.name+'</td>')
                            .append('<td class="price'+(settings.wallet_show_price === false ? ' hide' : '')+'"><label data-src="last_updated_at">-</label><span data-src="price">-</span><a>'+item.market_currency+'</a></div></td>')
                            .append('<td class="graph'+(settings.wallet_show_graph === false ? ' hide' : '')+'" id="graph-'+item.wallet_entities_id+'"></td>')
                            .append('<td class="total'+(settings.wallet_show_results === false ? ' hide' : '')+'"><span data-src="total"></span><a></a></td>')
                            .append('<td class="margin'+(settings.wallet_show_results === false ? ' hide' : '')+'"><span data-src="margin"></span><span class="counter" data-src="marginp"></span></td>');                    
                        break;
                    }
                    $(el).find('.logo,.name,.graph,.results,.total,.symbol')
                    .bind('click',function(){
                        if ($(this).parent('tr').hasClass('dragging')){ $(this).parent('tr').removeClass('dragging'); return;}
                        load_page('/entities/'+item.market+'/'+item.symbol,true);
                    });
                    
                    $(el).append('<td class="visibility" data-title=""><label class="switch-slider'+(settings.wallet_show_switcher === false ? ' hide' : '')+'"><input type="checkbox" checked="CHECKED" id="visibility-'+item.wallet_entities_id+'" /><span class="switch"></span></label></td>');
                    $(el).appendTo('.leafs[data-src="all"] tbody');
                
                    var data;
                    switch (settings.trend_wallet){
                        case '5-days':   data = item.trend.daily.length ? item.trend.daily.reverse() : null; break;
                        case '5-weeks':  data = item.trend.weekly.length ? item.trend.weekly.reverse() : null; break;
                        case '6-months': data = item.trend.monthly.length ? item.trend.monthly.reverse() : null; break;
                    }
                    apexcharts['#graph-'+item.wallet_entities_id] = {
                        series: [{ data: data }],
                        colors: [settings.design.color_base],
                        chart: { height: 50, type: 'area', zoom: { enabled: false }, toolbar: { show: false }, sparkline: { enabled: true }},
                        dataLabels: { enabled: false },
                        stroke: { curve: 'smooth', width: 2, colors:[settings.design.color_base] },
                        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0, opacityTo: 0, stops: [0, 100], gradientToColors: [ '#1a1a1a' ]}},                            
                        grid: { row: { colors: ['transparent'] }, padding:{ top:2,bottom:2 } },
                        tooltip: { enabled: false }
                    };

                });
                //$('[data-view="grid"] tr').draggable({ containment: '[data-view="grid"]', start:function(event,ui){ $(this).addClass('dragging'); } });
                
                movesReload();                
                liveReload();
                resultsReload();
                

                if (settings.view_wallet === 'grid'){                   
                    $.each(apexcharts, function(i,k){
                        new ApexCharts(document.querySelector(i),k).render();
                    });
                }                
                if (settings.view_wallet === 'screener'){
                    //load_datatables(function(){ 
                                            
                        var columns = [];
                        let thead = $('<tr></tr>');
                        let sort  = getFilter('sort');
                        
                        if (!sort){
                            sort.value = 'volume';
                            sort.type  = 'DESC';
                        }
                                                
                        $.each($('.leaf:first-child > td'), function(){
                            let code = $(this).attr('data-title');
                            $(thead).append('<th data-code="'+code+'"'+(sort.value === code ? ' data-sort="'+sort.type+'"' : '')+'></th>');
                            $(thead).appendTo('[data-src="all"] thead');
                            
                            let title = $(this).attr('data-title').replace(/\_/g, ' ');
                            if (title === 'country') title = '';
                            if (title === 'symbol') title = 'Code';
                            columns.push({ title: title, name: $(this).attr('data-title') });
                        }); 
                        var dataTablesOptions = {
                            language: { 
                                search: ""                         
                            },
                            columns: columns,
                            //colReorder: { order: [0,27,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29,30,31]},
                            colReorder:true,
                            colResize: { 
                                isEnabled: true,
                                onResizeStart: function (column, columns) { $('body').addClass('onResize'); },
                                onResizeEnd: function (column, columns) { $('body').removeClass('onResize'); }
                            },
                            ordering: false,
                            autoWidth: true,
                            dom: '<"top">rt<"bottom"><"clear">', //Bfrtip
                            scrollY:        "calc(100vh - 170px)",
                            scrollX:        "calc(100% - 5px)",
                            scrollCollapse: true,
                            paging:         false,
                            buttons: ['copy'],
                            fixedColumns:   { left: 1 },
                            "initComplete":function(settings,json){
                                new TouchScroll().init({ class: '.dataTables_scrollBody', draggable: true, wait: false });
                            }                          
                        };
                        screener = $('.leafs[data-view="screener"]').DataTable(dataTablesOptions);
                        screener.on( 'column-reorder', function ( e, s, d ) {
                            let visibleColumns = [];
                            $.each($('.dataTables_scrollHead .leafs thead th'), function(){
                                visibleColumns.push($(this).attr('data-code'));
                            });
                            settings.screener.visibleColumns = visibleColumns;
                        });

                        let bottom = $('<div></div>');
                        $(bottom).append('<span class="view">'+settings.view_screener+'</span>').bind('click',function(){
                            $.ajax({
                                url:"/extensions/market/views/popups/screener/config.html",
                                cache:false,
                                success: function(data){ 
                                    openPopup(data); 
                                    $('.views-container .tab-header h2').click();
                                    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ closePopup(); }); },
                                error: function(e){ if (config.debug) console.log(e); }
                            });
                        });

                        if (config.debug) $('.dataTables_wrapper .bottom').html(bottom);
                                  
                        
                    //});
                }                
                if (settings.wallet_sort === 'custom'){ 
                    init_sorting();
                }
            });
        },
        error: function(err){ if (config.debug) console.log(err); }
    });        
}
$(document).off('change','.visibility .switch-slider input');
$(document).on('change','.visibility .switch-slider input',function(){
    $(this).parents('.leaf').attr('data-visibility',$(this).prop('checked') ? 'visible' : 'hidden');
    resultsReload();
});

$(document).off('change','.wallet .switch-slider input');
$(document).on('change','.wallet .switch-slider input',function(e){
    $('[data-src="all"] [data-type="'+($(this).parents('.wallet').attr('data-type'))+'"]').toggleClass('hide');
    
    if ($('[data-src="all"] [data-type="active"]').hasClass('hide')){ updateSettings('wallet_show_active',false); }else{ updateSettings('wallet_show_active',true); };
    if ($('[data-src="all"] [data-type="sold"]').hasClass('hide')){ updateSettings('wallet_show_sold',false); }else{ updateSettings('wallet_show_sold',true); };
});


$(document).off('click','.wallet');
$(document).on('click','.wallet',function(){
    if (!$(this).hasClass('active') || loadedSummary) return;
    
    var series1  = [];
    var symbols1 = [];  
    var series2  = [];
    var symbols2 = [];     
    $.each(wallet.items, function(i, item){
        if (item.type_of_transaction === 'sold'){
            series1.push(parseFloat((item.sold_total/(wallet.sold_total ? wallet.sold_total : 1)*100)));
            symbols1.push(item.name);
        }
        if (item.type_of_transaction === 'active'){
            series2.push(parseFloat((item.total/(wallet.current_total ? wallet.current_total : 1)*100)));
            symbols2.push(item.name);
        }
    });
    if (series1.length === 0){ $('[data-src="graph-sold"]').html('<div class="no-graph icon-donut_large"></div>'); }
    if (series2.length === 0){ $('[data-src="graph-active"]').html('<div class="no-graph icon-donut_large"></div>');}        
    if (series1.length === 0 || series2.length === 0) return;
    
    new ApexCharts(document.querySelector('[data-src="graph-sold"]'),{
            series: series1,
            labels: symbols1,
            chart: { type: 'donut', fill: { type: 'gradient' }},
            legend: { show: false },
            plotOptions: { pie: { donut:{ size:'95%', labels: { show:true, value:{ formatter: function(value, opts){ return parseFloat(value).toFixed(2)+"%"; }}, total: { show: true, label: 'Your Result', formatter: function (chart) { return wallet.sold_marginp+'%'; }} } }}},
            stroke:{ colors: [settings.design.color_bg2], width:1 }
        }).render(); 
    new ApexCharts(document.querySelector('[data-src="graph-active"]'),{
            series: series2,
            labels: symbols2,
            tooltip:{
                y: {
                    show: true,
                    formatter: function(value){ return value.toFixed(2)+"%"; }
                }
            },
            chart: { type: 'donut', fill: { type: 'gradient' }},
            legend: { show: false },
            plotOptions: { pie: { donut:{ size:'95%', labels: { show:true, value:{ formatter: function(value, opts){ return parseFloat(value).toFixed(2)+"%"; }}, total: { show: true, label: 'Your Result', formatter: function (chart) { return wallet.current_marginp+'%'; }} } }}},
            stroke:{ colors: [settings.design.color_bg2], width:1 }
        }).render();        
    loadedSummary = true;
    
});

$(document).off('click','.leaf .unlink');
$(document).on('click','.leaf .unlink',function(){
    let code = $(this).parents('.leaf').attr('data-code');
    let type = $(this).parents('.leaf').attr('data-type');
    
    $('[data-code="'+code+'"][data-type="'+type+'"]').attr('data-grouped',false);
    resultsReload();
});
$(document).off('click','.leaf .link');
$(document).on('click','.leaf .link',function(){
    let code = $(this).parents('.leaf').attr('data-code');
    let type = $(this).parents('.leaf').attr('data-type');
    
    $('[data-code="'+code+'"][data-type="'+type+'"]').attr('data-grouped',true);
    resultsReload();
});