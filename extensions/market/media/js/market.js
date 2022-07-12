function hndlr(response) {
    if (config.debug) console.log('News:');
    if (config.debug) console.log(response.items);
    if (response.items && response.items.length>0){
        for (var i = 0; i < response.items.length; i++) {      
          var item = response.items[i];
          //console.log(item);
          
          var news_thumbnail = '';
          if (item.pagemap.metatags[0]['image:url']!==undefined){
            news_thumbnail = '<img src="'+item.pagemap.metatags[0]['image:url']+'" />';
          }
          document.getElementById("news").innerHTML += '<div class="news">\n\
              '+news_thumbnail+'\n\
              <div class="news-content"><div class="news-title">'+item.htmlTitle.replace(/(<([^>]+)>)/gi, "")+'</div><div class="news-info">'+item.htmlSnippet.replace(/(<([^>]+)>)/gi, "").slice(0,13)+'</div></div>';
        }
    }
}
$(document).on('click','.changer-adjust-view .changer', function(){ 
    
    var q=$(this).attr('data-labels');
    $('#news').html('');
    $.getScript("https://www.googleapis.com/customsearch/v1?key=AIzaSyCNVN5hLVcHLjOXySnK36hQsKkDpbajdyQ&cx=f2716fa8ddff5fecc&q="+q+"&callback=hndlr&sort=date");
    
    $('.changer-adjust-view .changer').removeClass('active');
    $(this).addClass('active');  

});

function get_observed(){
    
    if (config.debug) console.log('My observed entities:');
    $.ajax({
        url: config.api_url,
        data: { endpoint: '/wallet/observed/symbols' },
        type: 'GET',
        dataType: 'JSON',
        cache: false,
        success: function(response){
            if (config.debug) console.log(response);
            var observed_symbols = [];
            $.each(response.items, function(i,item){
                observed_symbols.push(item.symbol+'.'+item.market);
            });
            localStorage.setItem('observed',JSON.stringify(observed_symbols));
                               
        },
        error: function(response){
            console.log(response);
        }
    });
}

function find(filters,page,size,append){
    
    if (config.debug) console.log('Filtered entities:');
    $.ajax({
        url: config.api_url,
        data: { endpoint: '/entities', filters:filters, page:page, size:size, filter_logic:settings.filter_logic },
        type: 'GET',
        dataType: 'JSON',
        cache: false,
        success: function(response){
            if (config.debug) console.log(response);

            if (!response.items || response.items.length === 0) return;
            
            
            // FILTERS RELOAD...            
            $.each(response.filters, function(i,filter){

                var selected_value = '';
                if (filter.options && filter.options.length>0){
                    $('.search-filter[data-filter="'+filter.code+'"] .select-body').html('');
                    $('.search-filter[data-filter="'+filter.code+'"]').show();
                    $.each(filter.options, function(i,option){

                        var selected = 0;                            
                        if (response.active_filters.hasOwnProperty(filter.code) && ($.inArray(option.value,response.active_filters[filter.code])!==-1)){
                            selected=1;
                            selected_value = option.value;
                        } 

                        var html = '<li class="'+(selected===1 ? 'active' : '')+'" data-value="'+option.value+'">'+option.value.toUpperCase()+'<div class="checkbox'+(selected===1 ? ' icon-check' : '')+'"></div></li>';
                        $('.search-filter[data-filter="'+filter.code+'"] .select-body').append(html);
                    });
                }else{
                    $('.search-filter[data-filter="'+filter.code+'"]').hide();
                }
                $('.search-filter[data-filter="'+filter.code+'"] .selected-value').text(selected_value);                                    
                
            });


            if (!append) $('.search-results').html('');

            var stock_graphs = new Array();                
            var entity_template;

            var observed = JSON.parse(localStorage.getItem('observed'));

            $.each(response.items, function(i,entity){

                // IOS Fix for dates NaN
                var last_updated_at = '-';
                if (entity.last_updated_at){
                    var last_updated_at_raw = entity.last_updated_at;
                    var t = last_updated_at_raw.split(/[- :]/);
                    var dt = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                    var d = new Date(dt);
                    last_updated_at = d.getDate()+'.'+(d.getMonth()+1)+', '+(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();                     
                }  

                var price                   = parseFloat(entity.price).toFixed(3).slice(0,-1); 
                var price_change            = parseFloat(entity.price_change).toFixed(3).slice(0,-1);
                var price_change_percentage = parseFloat(entity.price_change_percentage).toFixed(3).slice(0,-1);

                var market_currency = 'usd';
                if (entity.market==='gpw') market_currency = 'pln';

                // Data to Template

                entity_template = $('.entity-template > .mystock-container').clone();

                $(entity_template).attr('data-symbol',entity.symbol);
                $(entity_template).attr('data-market',entity.market);

                $(entity_template).find('.symbol').html(entity.symbol);
                $(entity_template).find('.logo-container').html(entity.logo);
                $(entity_template).find('.name').html(entity.name);

                if (price_change>0) $(entity_template).find('.current-price').attr('data-results','with profit');
                else $(entity_template).find('.current-price').attr('data-results','with lost');

                $(entity_template).find('.current-price .label').html(last_updated_at);
                $(entity_template).find('.current-price .price').html(price);
                $(entity_template).find('.additionals .price').html(price_change);
                $(entity_template).find('.additionals .percentage').html(price_change_percentage);                    
                $(entity_template).find('.market-currency').html(market_currency);
                                
                if($.inArray(entity.symbol+'.'+entity.market,observed)!==-1){                    
                    $(entity_template).find('.actions-observed').attr('data-action','remove-from-observed');
                    $(entity_template).find('.actions-observed').addClass('secondary');                    
                    if (config.debug) console.log(entity.symbol+'.'+entity.market+' in observed');                    
                }else{
                    $(entity_template).find('.actions-observed').attr('data-action','add-to-observed');
                }

                $(entity_template).find('.stock-graph-line').attr('id','stock-graph-'+entity.id);                    

                $('.search-results').append($(entity_template));

                // TRENDS
                if (entity.trend && entity.trend!==null){
                    var options = {
                        series: [{ data: entity.trend }],
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
                    //stock_graphs[entity.id] = new ApexCharts(document.querySelector('#stock-graph-'+entity.id), options);
                    //stock_graphs[entity.id].render();
                }
            });                                 
        },
        error: function(response){
            alert(JSON.stringify(response));
            console.log(response);
        }
    });
}

// MARKET - SEARCH INPUT on key pressed
let typingTimer,
doneTypingInterval = 250;
$(document).on('keydown', '#market-search', function(){  

    if (typingTimer) {
        clearTimeout(typingTimer);
    }
    typingTimer = setTimeout(function () {

    }, doneTypingInterval);

});
$(document).on('click', '#market-search', function(){ 

    $(this).val('');

});

