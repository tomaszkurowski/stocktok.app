// Browsing session variables

var search   = '';
var screener;
var filters = [];
var filtersOptions = [];
var filtersTypes;
var loading = false;

function getItems(options = {}){

      
    
    if (loading) return;
    loading = true;
    
    if (!options.search && options.search!=='') options.search = mvc.controller ? mvc.controller : ''; 
    
    if (!options.target) options.target = '[data-src="search"]';
    if (!options.page && !options.reload) options.page = $(options.target+' .leaf').length;        
    if (!options.filters) options.filters = getFilters();    
    if (!options.view) options.view = settings.view_search;
        
    if (options.reload) $(options.target).find('tbody').html('');
                
    
    load_apexcharts(function(){
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/entities', 
                filters: options.filters, // helpers.js
                page: options.page,
                size:options.size,
                search: options.search,
                sort: options.sort
            },
            type: 'GET',
            dataType: 'JSON',
            cache: false,
            success: function(response){
                                                 
                if (config.debug) console.log('Items:',response);
                
                if (response.success === 'false'){
                    if (options.related) $(target).hide();
                    return;
                } 
                 
                if (options.fullReload){
                    $('.screen').html('<table class="leafs" data-src="search"><thead></thead><tbody></tbody></table>');
                    if ($.fn.DataTable.isDataTable('.leafs[data-src="search"]')){
                        screener.clear();
                        screener.destroy();
                    }                    
                }                        
                
                $(options.target).attr('data-view',options.view);
                
                if (response.results.filtersOptions){ filtersOptions = response.results.filtersOptions; }
                if (response.results.filtersTypes){   filtersTypes   = response.results.filtersTypes;   }
                                                
                if (response.entities.length === 0 && options.page === 0){
                    if (options.related){ $(options.target).hide();
                    }else{ $(options.target).html('<div class="info-page in-container"><div class="icon icon-clear"></div><h1>No Results</h1><p>Unfortunatelly, there are no results on phrase: <b>'+search+'</b>.</p></div>');}               
                    return;
                }
                
                if (options.related){
                    $('.screen.related h2').text('Related');
                } 
                
                  
                                               
                var apexcharts = {};                
                $.each(response.entities, function(i, item){
                                
                    let el = $('<tr class="leaf"></tr>')
                    .attr('data-id',item.id)
                    .attr('data-code',item.symbol+'.'+item.market)
                    .attr('data-type',item.type_of_transaction)
                    .attr('data-visibility','visible')
                    .attr('data-purchased-total',item.purchased_total)
                    .attr('data-purchased-currency',item.purchased_currency);

                    switch(options.view){
                        case 'screener':
                            //$(el).append(item.logo && settings.wallet_show_logo === true ? '<td class="logo'+'" data-title="Logo"><img src="'+item.logo+'" data-attr="logo" /></td>' : '<td class="symbol" data-title="Symbol" data-attr="symbol">'+item.symbol+'</td>');
                            $.each(settings.screener.visibleColumns,function(i,column){
                                let value = item[column];
                                if (column === 'country'){ value = '<img src="/media/img/flags/'+item[column]+'.svg" class="flag-small" />'; }
                                if (column === 'research'){
                                    value   =  '<div class="icon-btn icon-sphere"></div>';
                                    value   += '<div class="icon-btn icon-google"></div>';
                                    value   += '<div class="icon-btn icon-youtube-play"></div>';
                                    value   += '<div class="icon-btn icon-twitter"></div>';
                                    item[column] = 'Find in';
                                }
                                if (column === 'EBITDA' || column === 'revenue_TTM' || column === 'market_capitalization' || column === 'volume' || column === "avgvol_200d" || column === 'avgvol_50d') 
                                    value = format_price(value);
                                
                                if (item[column]){ $(el).append('<td class="additional" data-title="'+column+'" data-attr="'+item[column]+'">'+value+'</td>'); 
                                }else{ $(el).append('<td class="additional" data-title="'+column+'" data-attr="'+item[column]+'">-</td>'); }
                            });

                        break;
                        default:
                            $(el)
                            .append(item.logo ? '<td data-title="logo" class="logo'+(settings.wallet_show_price ? '' : ' center')+'"><img src="'+item.logo+'" /></td>' : '<td class="symbol'+(settings.wallet_show_price ? '' : ' center')+'" data-title="symbol">'+item.symbol+'</td>')
                            .append('<td data-title="name"  class="name">'+item.name+'</td>')
                            .append('<td data-title="price" class="price'+(settings.wallet_show_price === false ? ' hide' : '')+'"><label data-src="last_updated_at">'+format_datetime(item.last_updated_at)+'</label><span data-src="price">'+format_price(item.price)+'</span><a>'+item.market_currency+'</a></div></td>')
                            .append('<td data-title="graph" class="graph'+(settings.wallet_show_graph === false ? ' hide' : '')+'" id="graph-'+item.id+'"></td>');
                        break;
                    }
                    $(el).find('[data-title="name"],[data-title="symbol"],[data-title="logo"],[data-title="graph"]')
                    .bind('click',function(){
                        load_page('/entities/'+item.market+'/'+item.symbol,true);
                    });
                    $(el).appendTo($(options.target).find('tbody'));

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
                $('[data-view="screener"] tbody tr td:first-child').addClass('dtfc-fixed-left').css('left','0px').css('position','sticky');
                
                // After Render Triggers                
                if (options.view === 'grid' || options.view === 'boxes'){                   
                    $.each(apexcharts, function(i,k){
                        new ApexCharts(document.querySelector(i),k).render();
                    });
                }    
                if (options.view === 'screener'){
                    //load_datatables(function(){                                            
                        
                    if (!$.fn.DataTable.isDataTable('.leafs[data-src="search"]')){
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
                            $(thead).appendTo('[data-view="screener"] thead');
                            
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
                        screener = $('.leafs[data-src="search"]').DataTable(dataTablesOptions);
                        screener.on( 'column-reorder', function ( e, s, d ) {
                            let visibleColumns = [];
                            $.each($('.dataTables_scrollHead .leafs thead th'), function(){
                                visibleColumns.push($(this).attr('data-code'));
                            });
                            settings.screener.visibleColumns = visibleColumns;
                        });

                        if (mvc.model === 'market'){
                            button({ 
                            class: 'icon-btn icon-content_copy' }, 
                            function(){ screener.button( '.buttons-copy' ).trigger(); });                                
                        }
                        
                        
                    }
                    $('.dataTables_scrollHead th .active').remove();
                    $.each(options.filters,function(i,filter){ 
                        if (filter.value){
                            $('.dataTables_scrollHead [data-view="screener"] [data-code="'+filter.code+'"]').append('<div class="active">(<span>'+filter.type+'</span> <a>'+filter.value+'</a>)</div>').bind('click',function(){
                                $.ajax({
                                    url:"/extensions/market/views/popups/screener/filters.html",
                                    cache:false,
                                    success: function(data){ 
                                        openPopup(data); 
                                        if      (filter.code === 'market') { $('.markets .tab-header').click(); }
                                        else if (filter.code === 'country'){ $('.countries .tab-header').click(); }
                                        else { $('.build .tab-header').click(); }
                                        
                                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ closePopup(); }); },
                                    error: function(e){ if (config.debug) console.log(e); }
                                }); 
                            });
                        }
                    });
                    let bottom = $('<div></div>');
                    //$(bottom).append('Total Results: '+response.results.total.count);
                    $(bottom).append('<span class="view">'+settings.view_screener+'</span>');
                    
                    $('.dataTables_wrapper .bottom').html(bottom);
                                                                   
                }
                loading = false;
                if (options.success) options.success();
                
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
    });    
}

$(document).off('click','[data-view="screener"] th');
$(document).on('click','[data-view="screener"] th',function(){
    if ($(this).attr('data-sort') === 'DESC') $(this).attr('data-sort','ASC');
    else{
        $('[data-view="screener"] th').attr('data-sort','');
        $(this).attr('data-sort','DESC');
    }
    updateFilter({ code: 'sort', type: $(this).attr('data-sort'), value: $(this).attr('data-code') },true);
    getItems({ reload:true });
});
$(document).off('click','.bottom .view');
$(document).on('click','.bottom .view',function(){
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
