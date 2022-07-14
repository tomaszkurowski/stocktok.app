var search = '';
function get_search_items(){

    var filters = getFiltersParams();
    $.ajax({
        url: config.api_url,
        data: { 
            endpoint: '/entities', 
            filters: filters, // helpers.js
            page: $('.items-container .item').length,
            search: search
        },
        type: 'GET',
        dataType: 'JSON',
        cache: false,
        success: function(response){

            if (filters[0] && filters[0].code === 'with-popup'){
                $('.icon-search').click();
                $('.form .search').focus();
            }

            if (response.success === 'false') return;
            
            if (response.entities.length === 0){
                $('.items-container').html('<div class="info-page in-container"><div class="icon icon-clear"></div><h1>No Results</h1><p>Unfortunatelly, there are no results on phrase: <b>'+search+'</b>.</p></div>')
            }
            
            
            response.entities.forEach(function(item){

                let el   = $('<div class="item"></div>')
                        .attr('data-symbol',item.symbol)
                        .attr('data-market',item.market)
                        .attr('data-price',item.price);

                let view = $('<div class="view" data-action="view"></div>');                                                                                

                $(view).append('<div class="logo-container">'+(item.logo ? '<img src="'+item.logo+'" class="logo" />' : '<div class="logo no-img">'+item.symbol+'</div>')+'</div>');
                $(view).append(('<div class="name label">'+(item.name ? item.name : '')+'</div>'));
                $(view).append('<div class="price">'+item.price+'</div>');
                $(view).append('<div class="currency">'+item.market_currency+'</div>');

                $(el).append($(view));
                $(el).append('<div class="btn" data-action="buy-more">Buy</div>');

                if($.inArray(item.symbol+'.'+item.market,observed_symbols)!==-1){  $(el).append('<div class="add-to-observed icon-bookmarks" data-action="remove-from-observed"></div>');                
                }else{ $(el).append('<div class="add-to-observed icon-bookmarks" data-action="add-to-observed"></div>'); }

                $('.items-container').append($(el));

            });



        },
        error: function(response){
            console.log(response);
        }
    });

};

var observed_symbols = [];
function get_observed_symbols(){
    $.ajax({
        url: config.api_url,
        data: { 
            endpoint: '/wallet/observed/symbols',
        },
        type: 'GET',
        dataType: 'JSON',
        cache: false,
        success: function(response){  
            if (response.success === 'false') return;                    

            $.each(response.items, function(i,item){
                observed_symbols.push(item.symbol+'.'+item.market);
            });
        }
    });
}