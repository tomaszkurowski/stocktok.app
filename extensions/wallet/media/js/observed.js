var live    = {};
var wallet = {};

function liveReload(options={}){
    $.each(live, function(code, item){ 
        $('[data-code="'+code+'"] [data-src="last_updated_at"]').text(format_datetime(item.last_updated_at,{ format: 'D/M, LT' }));
        $('[data-code="'+code+'"] [data-src="price"]').text(item.price);
    });
}
function observedReload(){

    $.ajax({
        url: config.api_url,
        data:{ 
            endpoint: '/wallet/observed'
        },
        type:       'GET',
        dataType:   'JSON',
        cache:      false, 
        success: function(response){

            wallet = response;
            
            if (config.debug) console.log('wallet',wallet);

            if (!wallet.items || wallet.items.length === 0){ $('[data-src="all"]').addClass('empty').html('<tr><td><div class="icon icon-bookmark"></div><h3>You don\'t observe anything yet</h3></td></tr>'); return; }
            $('.screen').html('<table class="leafs" data-view="grid" data-src="all"><tbody></tbody></table>');

            var apexcharts = {};
            load_apexcharts(function(){
                                
                var visibleColumns = [];
                switch (settings.screener_view){
                    case 'performance':
                        visibleColumns = ['adjusted_close','avgvol_200d','avgvol_50d','beta','ema_200d','ema_50d','hi_250d','high','last_trading_day','lo_250d','low','open','previous_price','price','price_change','price_change_percentage','volume'];
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

                    let el = $('<tr class="leaf drag-item"></tr>')
                    .attr('data-id',item.wallet_entities_id)
                    .attr('data-code',item.symbol+'.'+item.market)
                    .attr('data-name',item.name)
                    .attr('data-symbol',item.symbol)
                    .attr('data-market',item.market)
                    .attr('data-type',item.type_of_transaction);
            
                    switch(settings.view_observed){
                        case 'screener':
                            $(el)
                            .append(item.logo ? '<td class="logo'+'" data-title="Logo"><img src="'+item.logo+'" /></td>' : '<td class="symbol" data-title="Symbol">'+item.symbol+'</td>')
                            .append('<td class="name"   data-title="Name">'+item.name+'</td>');
                    
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
                            .append('<td class="graph'+(settings.wallet_show_graph === false ? ' hide' : '')+'" id="graph-'+item.id+'"></td>');
                    
                    
                            // Keywords
                            let keywords = $('<td class="keywords"></td>');
                            $(keywords).append('<span class="active">All</span>');
                            if (item.keywords.length>0){
                                $.each(item.keywords,function(i,keyword){
                                    $(keywords).append('<span style="border-color:'+keyword.color+'">'+keyword.name+'</span>');
                                });
                            }
                            if (settings.wallet_edit_keywords){
                                $(keywords).append('<div class="icon-create keyword-add"></div>');
                            }
                            $(el).append($(keywords));
                            
                        break;
                    }
                    $(el).find('.logo,.name,.graph,.results,.total,.symbol')
                    .bind('click',function(){
                        load_page('/entities/'+item.market+'/'+item.symbol,true);
                    });
                    
                    $(el).appendTo('.leafs[data-src="all"] tbody');
                
                    if (item.trend){
                        var data;
                        switch (settings.trend_wallet){
                            case '5-days':   data = item.trend.daily.length ? item.trend.daily.reverse() : null; break;
                            case '5-weeks':  data = item.trend.weekly.length ? item.trend.weekly.reverse() : null; break;
                            case '6-months': data = item.trend.monthly.length ? item.trend.monthly.reverse() : null; break;
                        }
                        apexcharts['#graph-'+item.id] = {
                            series: [{ data: data }],
                            colors: [settings.design.color_base],
                            chart: { height: 50, type: 'area', zoom: { enabled: false }, toolbar: { show: false }, sparkline: { enabled: true }},
                            dataLabels: { enabled: false },
                            stroke: { curve: 'smooth', width: 2, colors:[settings.design.color_base] },
                            fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0, opacityTo: 0, stops: [0, 100], gradientToColors: [ '#1a1a1a' ]}},                            
                            grid: { row: { colors: ['transparent'] }, padding:{ top:2,bottom:2 } },
                            tooltip: { enabled: false }
                        };
                    }

                });                                
                liveReload();
                
                if (settings.view_observed === 'grid'){                   
                    $.each(apexcharts, function(i,k){
                        new ApexCharts(document.querySelector(i),k).render();
                    });
                }                
                if (settings.view_observed === 'screener'){
                    //load_datatables(function(){ 
                                            
                        var columns = [];
                        $.each($('.leaf:first-child > td'), function(){
                            columns.push({ title: $(this).attr('data-title').replace(/\_/g, ' ') });
                        });
                        
                        var screener = $('.leafs[data-src="all"]').DataTable({
                            language: { search: "" },
                            columns: columns,
                            colReorder: settings.screener_action_header === 'reorder' ? true : false,
                            colResize: { isEnabled: settings.screener_action_header === 'resize' ? true : false },
                            dom: '<"top">rt<"bottom"flpB<"quickTools">><"clear">', //Bfrtip
                            scrollY:        "calc(100vh - 170px)",
                            scrollX:        "calc(100% - 5px)",
                            scrollCollapse: true,
                            paging:         false,
                            buttons: ['copy'],
                            fixedColumns:   { left: 1, right:1 },
                            "initComplete":function(settings,json){
                                new TouchScroll().init({ class: '.dataTables_scrollBody', draggable: true, wait: false });
                            }
                        });
                        $('.quickTools')
                        .html('<div class="actions"></div>');
                
                
                        $(wallet.avatar ? '<div class="logo"><img src="'+wallet.avatar+'" class="avatar" /></div>' : '<span class="icon-btn icon-fullscreen"></span>')
                        .bind('click',function(){
                            $('.overview').click();
                        }).appendTo('.quickTools');                        
                        
                        $('<div class="icon-btn icon-content_copy"></div>')
                        .bind('click',function(){
                            screener.button( '.buttons-copy' ).trigger();
                        }).appendTo('.quickTools .actions');
                        
                        $('<div class="icon-btn icon-equalizer2"></div>')
                        .bind('click',function(){
                            if (!me){
                                $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">Advanced Charting</div><div class="description">Sorry, feature only for logged users</div></div></div>');                            
                                return;
                            } 
                            if ($('.popup-screener-config').length){
                                $('#popup').html(''); $('.popup-btn').remove(); 
                                $('body').removeClass('with-popup'); 
                                $('body').removeClass('with-blur'); 
                                return;
                            }

                            $('body').addClass('with-popup with-blur');                            

                            $('.popup-btn.icon-clear').remove();
                            button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur'); $('.quick-tools .actions > div').removeClass('active'); });                            
                            $.ajax({
                                url:"/extensions/entities/views/popups/screener/config.html",
                                cache:false,
                                success: function(data){ $("#popup").html(data); },
                                error: function(e){ if (config.debug) console.log(e); }
                            });
                        }).
                        appendTo('.quickTools .actions');                        
                        
                    //});
                }
                
                init_sorting();
            });
        },
        error: function(err){ if (config.debug) console.log(err); }
    });        
}

$(document).off('click','.keywords .keyword-add');
$(document).on('click','.keywords .keyword-add',function(){
    if ($('.popup-config-observed').length){
        $('#popup').html(''); $('.popup-btn').remove(); 
        $('body').removeClass('with-popup'); 
        $('body').removeClass('with-blur'); 
        return;
    }
    $('body').addClass('with-popup with-blur');                            

    var code = $(this).parents('.leaf').attr('data-code');
    var name = $(this).parents('.leaf').attr('data-name');

    $('.popup-btn.icon-clear').remove();
    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); $('body').removeClass('with-blur'); $('.quick-tools .actions > div').removeClass('active'); });                            
    $.ajax({
        url:"/extensions/wallet/views/popups/keywords.html",
        cache:false,
        success: function(data){ 
            $("#popup").html(data); 
            $('[data-src="name"]').html(name);
            $('#keyword-code').val(code);  
        },
        error: function(e){ if (config.debug) console.log(e); }
    });    
});
