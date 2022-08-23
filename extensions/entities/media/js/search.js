var search = '';
function get_search_items(filters=null,target='',size=30,sort = null,related=false){   
    
    if (!filters) filters = getFiltersParams();
    
    var params = getQueryParams();
    var page = $(target+'.items-container .item').length;
    
    if (params.last_clicked && !ios && mvc.view === 'find-by'){
        page = parseInt(params.last_clicked);
        delete params['last_clicked'];
        window.history.pushState({}, '', updateQueryParams(params,true));  
    }
    if (sort === null){ 
        sort = settings.find_sort ? settings.find_sort : null; 
    }
    
    $.ajax({
        url: config.api_url,
        data: { 
            endpoint: '/entities', 
            filters: filters, // helpers.js
            page: page,
            size:size,
            search: search,
            sort: sort
        },
        type: 'GET',
        dataType: 'JSON',
        cache: false,
        success: function(response){

            if (filters[0] && filters[0].code === 'with-popup'){
                $('.icon-search').click();
                $('.form .search').focus();
            }

            if (response.success === 'false'){
                if (related) $(target).hide();
                return;
            } 
            
            if (response.entities.length === 0 && !$('.items-container .item').length){
                
                if (related){
                    $(target).hide();
                }else{
                    $(target + '.items-container').html('<div class="info-page in-container"><div class="icon icon-clear"></div><h1>No Results</h1><p>Unfortunatelly, there are no results on phrase: <b>'+search+'</b>.</p></div>');
                }
                
            }
            
            var it=0;
            response.entities.forEach(function(item){

                let el   = $('<div class="item"></div>')
                        .attr('data-symbol',item.symbol)
                        .attr('data-market',item.market)
                        .attr('data-price',item.price)
                        .attr('data-position',page + it); 
                it++;

                let view = $('<div class="view" data-action="view"></div>');                                                                                

                $(view).append('<div class="logo-container">'+(item.logo ? '<img src="'+item.logo+'" class="logo" alt="logo-'+item.symbol+'" />' : '<div class="logo no-img">'+item.symbol+'</div>')+'</div>');
                $(view).append(('<div class="name label">'+(item.name ? item.name : '')+'</div>'));
                $(view).append('<div class="price">'+item.price+'</div>');
                $(view).append('<div class="currency">'+item.market_currency+'</div>');

                $(el).append($(view));
                $(el).append('<div class="icon-btn icon-shopping_cart buy-more" data-action="buy-more"></div>');

                if($.inArray(item.symbol+'.'+item.market,observed_symbols)!==-1){  $(el).append('<div class="add-to-observed icon-btn icon-bookmark1" data-action="remove-from-observed"></div>');                
                }else{ $(el).append('<div class="add-to-observed icon-btn icon-bookmark_outline" data-action="add-to-observed"></div>'); }

                if (settings.contributor === 'yes'){
                    let btn_add_logo = $('<div class="icon-create contributor-edit" data-action="edit"></div>').bind('click',function(){
                        
                        if ($('footer #popup .search').length){ 
                            $('footer #popup').html(''); 
                            $('.popup-btn').remove();
                            $('body').removeClass('with-popup');
                        }
                        
                        $('body').toggleClass('with-popup');                            
                        if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }   
                        
                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
                        $.ajax({
                            url:"/extensions/players/views/popups/contributor.html",
                            cache:false,
                            success: function(data){ 
                                $("#popup").html(data); 
                                $('.popup-contributor').slideDown(300,'linear');
                                $('.popup-contributor #market').val(item.market);
                                $('.popup-contributor #symbol').val(item.symbol);
                                $('.popup-contributor #name').val(item.name);
                                $('.popup-contributor #industry').val(item.industry);
                                $('.popup-contributor #sector').val(item.sector);
                                $('.popup-contributor #website').val(item.website);
                            },
                            error: function(e){ if (config.debug) console.log(e); }
                        });
                    });
                    $(el).append(btn_add_logo);
                }

                $(target+'.items-container').append($(el));

            });
            if (related){
            }


        },
        error: function(response){
            if (config.debug) console.log(response);
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