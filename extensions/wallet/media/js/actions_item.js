
    function funds_popup(){
        
        if ($('.popup.funds-update').length){
            $('body').removeClass('with-popup');
            $('.popup-btn').remove();
            $('#popup').html('');
            toggleHeading();
            return;
        }
        
        $('body').addClass('with-popup');
        $('.popup-btn').remove();
        $('#popup').html('');
        
        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $(this).remove(); funds_popup(); });
        
        if ($("body").hasClass("with-popup")){
            $.ajax({
                url:"/extensions/wallet/views/popups/funds-update.html",
                cache:false,
                success: function(data){ $("#popup").html(data); },
                error:   function(e){ if (config.debug) console.log(e); }
            });
        }else{
            $('.popup-btn.step2-btn').remove();
        }
    }

    function buy_sell_popup(options = { action: 'buy', item: {} }){

        options_popup = options;
        if (config.debug) console.log('Buy sell popup');
        if (config.debug) console.log(options);

        if ($('.popup.add-new-stock').length){
            $('body').removeClass('with-popup');
            $('.popup-btn').remove();
            $('#popup').html('');
            toggleHeading();
            return;
        }
        
        $('body').addClass('with-popup');
        $('.popup-btn').remove();
        $('#popup').html('');
        
        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $(this).remove(); buy_sell_popup(); });
        

        if ($("body").hasClass("with-popup")){
            $.ajax({
                url:"/extensions/wallet/views/popups/add-new-stock.html",
                cache:false,
                success: function(data){ 
                    $("#popup").html(data); 

                    if (!options.item.hasOwnProperty('symbol')){

                        $.getScript('/extensions/wallet/media/js/actions_sell.js?version='+config.version,function(){
                            sell_step1();
                        });                        
                        $.getScript('/extensions/wallet/media/js/actions_buy.js?version='+config.version,function(){
                            buy_step1();  
                        });

                    }else{

                        if (options.action === 'sell'){
                            $.getScript('/extensions/wallet/media/js/actions_sell.js?version='+config.version,function(){
                                sell_step2(options.item);
                            });
                        }
                        if (options.action === 'buy'){
                            $.getScript('/extensions/wallet/media/js/actions_buy.js?version='+config.version,function(){
                                buy_step2(options.item);
                            });
                        } 

                    }
                },
                error: function(e){ if (config.debug) console.log(e); }
            });
        }else{
            $('.popup-btn.step2-btn').remove();
        }

    }


    // MYSTOCK - EDIT
    $(document).off('change', '.mystock input');
    $(document).on('change', '.mystock input', function() {
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/wallet/transaction', 
                id:       $(this).parent('.field').parent('.mystock-edit').attr('data-stock-id'), 
                attributes:[{
                    "code": $(this).attr('name'),
                    "value":$(this).val()
                }]  
            },
            type:     'PUT',
            dataType: 'JSON',        
            cache:    false,        
            success:  function() { init(); },
            error:    function(e){ if (config.debug) console.log(e); }

        });
    });

    // MYSTOCKS - SORT
    function mystocks_sort(){
        var position=1;
        var items = new Array();

        $(':not(.slick-cloned) .mystock-container').each(function(index,value){        
            items.push({ "id" : $(this).attr('data-stock-id'), "position": position++ });

        }).promise().then(function(){
            $.ajax({
                url: config.api_url,
                data: { 
                    endpoint: '/wallet/sort', 
                    items: items  
                },
                type: 'PUT',
                dataType: 'JSON',
                success: function(response){ 
                    if (config.debug) console.log(response);
                    generate_sort_placeholders();                           
                },
                error: function(e){ if (config.debug) console.log(e); }
            });
        });
    }


    // MYSTOCK - DELETE 
    $(document).off('click', '.mystock-delete');
    $(document).on('click', '.mystock-delete', function() {

        $(this).addClass('active');

        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/wallet/transaction', 
                id:       $(this).parents('.mystock-container').attr('data-stock-id')
            },
            type:     'DELETE',
            dataType: 'JSON',        
            success:  function(){ if (mvc.model==='wallet'){ init(); }},
            error:    function(e){ if (config.debug) console.log(e) }
        });

    });

    // MYSTOCK - VISIBILITY
    var other_hidden = false;

    $(document).off('click', '.mystock .visibility .switcher');
    $(document).on('click', '.mystock .visibility .switcher', function(e) {
        e.preventDefault();
        if (settings.wallet_switch_behavior==='itself'){
            var element = $(this).parents('.mystock-view').parent('.mystock').parent('.mystock-container');
            $(element).attr('data-visibility','hidden');

            // Group Aspect - 1 for all
            if ($(element).attr('data-group')==='master' && $(element).hasClass('group-closed')){
                var group_id = $(element).attr('data-group-id');
                $('.mystock-container[data-group-id="'+group_id+'"]').attr('data-visibility','hidden');
            }

            reload();
        }else{        
            if (other_hidden){
                $('.mystock-container').attr('data-visibility','visible');
                other_hidden = false;
                reload();
                return;
            }else{
                $('.mystock-container').attr('data-visibility','hidden');
                var element = $(this).parents('.mystock-view').parent('.mystock').parent('.mystock-container');
                $(element).attr('data-visibility','visible');

                // Group Aspect - 1 for all
                if ($(element).attr('group')==='master' && $(element).hasClass('group-closed')){
                    var group_id = $(element).attr('data-group-id');
                    $('.mystock-container[data-group-id="'+group_id+'"]').attr('data-visibility','visible');
                }

                other_hidden = true;
                reload();
                return;
            };    
        }
    });
    // MYSTOCK - VISIBILITY
    $(document).off('click', '.visibility-layer');
    $(document).on('click', '.visibility-layer', function(e) {
        e.preventDefault();
        if (settings.wallet_switch_behavior==='itself'){
            var element = $(this).parent('.mystock-container');
            $(element).attr('data-visibility','visible');

            // Group aspect (1 for all)
            if ($(element).attr('data-group')==='master'){
                var group_id = $(element).attr('data-group-id');
                $('.mystock-container[data-group-id="'+group_id+'"]').attr('data-visibility','visible');
            }

        }else{
            $('.mystock-container').attr('data-visibility','visible');
            other_hidden = false;
        }
        reload();
    });
    // MYSTOCK - GROUPING
    $(document).off('click', '.group-info');
    $(document).on('click','.group-info',function(e){

        e.preventDefault();
        var element  = $(this).parents('.mystock-container');
        var group_id = $(element).attr('data-group-id');

        $(element).parents('.wallet-items').find('[data-group-id="'+group_id+'"]').toggleClass('group-closed');
        $(element).parents('.wallet-items').find('[data-group-id="'+group_id+'"] .group-info > .icon').toggleClass('icon-chain-broken').toggleClass('icon-chain');

        reload();

        // Remember closed groups
        if (!settings.hasOwnProperty('closed_groups')) settings.closed_groups = [];
        if ($(element).parents('.wallet-items').find('[data-group-id="'+group_id+'"]').hasClass('group-closed')){
               settings.closed_groups.push(group_id);
        }else{ settings.closed_groups.pop(group_id); }

        localStorage.setItem('settings',JSON.stringify(settings));


    });


    // ADD TO OBSERVED
    $(document).off('click', '[data-action="add-to-observed"]');
    $(document).on('click','[data-action="add-to-observed"]',function(e){    

        e.preventDefault();
        var element = $(this);

        $.ajax({
            url: config.api_url,
            data: { endpoint:'/wallet/observed', 
                    market:$(this).parents('.item').attr('data-market'),
                    symbol:$(this).parents('.item').attr('data-symbol')
                },
            type: 'POST',
            dataType: 'JSON',
            success: function(response){
                if (config.debug) console.log(response);
                $(element).attr('data-action','remove-from-observed');
                $(element).addClass('secondary');
                if ($(element).hasClass('icon-bookmark_outline')){
                    $(element).removeClass('icon-bookmark_outline').addClass('icon-bookmark1');
                }                

            },
            error: function(response){                            
                if (config.debug) console.log(response);
            }
        });

    });

    // REMOVE FROM OBSERVED
    $(document).off('click', '[data-action="remove-from-observed"]');
    $(document).on('click','[data-action="remove-from-observed"]',function(e){    

        e.preventDefault();
        var element = $(this);

        $.ajax({
            url: config.api_url,
            data: { 
                endpoint:'/wallet/observed', 
                symbol: $(this).parents('.item').attr('data-symbol'),
                market: $(this).parents('.item').attr('data-market')
            },
            type: 'DELETE',
            dataType: 'JSON',

            success: function(response){

                if (config.debug) console.log(response);
                $(element).attr('data-action','add-to-observed');
                $(element).removeClass('secondary');
                if ($(element).hasClass('icon-bookmark1')){
                    $(element).removeClass('icon-bookmark1').addClass('icon-bookmark_outline');
                }
                
                if (mvc.model === 'wallet') get_my_observed();

            },
            error: function(response){                            
                if (config.debug) console.log(response);
            }
        });

    });

    $(document).off('click', '.mystock-container .view-action');
    $(document).on('click','.mystock-container .view-action',function(e){
        var symbol = $(this).closest('.mystock-container').attr('data-symbol');
        var market = $(this).closest('.mystock-container').attr('data-market');               
        location.href = '/entities/'+market+'/'+symbol;
    });

    $(document).off('click', '.items-container [data-action="view"]');
    $(document).on('click','.items-container [data-action="view"]',function(e){
        var symbol = $(this).parents('.item').attr('data-symbol');
        var market = $(this).parents('.item').attr('data-market');
        
        // Remember scroll
        if (mvc.model === 'entities'){            
            var params = getQueryParams();
            params.last_clicked = parseInt($(this).parents('.item').attr('data-position'));
            params.market = market;
            
            window.history.pushState({}, '', updateQueryParams(params,true)+'#'+symbol);            
        }        
        location.href = '/entities/'+market+'/'+symbol;
    });

    $(document).off('click', '.mystock-container .edit .icon-create');
    $(document).on('click','.mystock-container .edit .icon-create',function(e){ 
        $(this).toggleClass('active');
        $(this).parents('.mystock-container').find('.mystock-edit').toggleClass('active');
    });

    $(document).off('click', '[data-action="buy-more"]');
    $(document).on('click','[data-action="buy-more"]',function(e){       

        e.preventDefault();
        var item = {};
            item.market_currency    = $(this).parents('.item').attr('data-market') ==='gpw' ? 'pln' : 'usd';        
            item.symbol             = $(this).parents('.item').attr('data-symbol');
            item.market             = $(this).parents('.item').attr('data-market');
            item.price              = $(this).parents('.item').attr('data-price');
            //item.last_updated_at    = $(this).parents('.item').find('.updated-at').text();
            item.logo               = $(this).parents('.item').find('.logo-container').html();               

        buy_sell_popup({ action:'buy', item:item });

    });
    
    $(document).off('click', '[data-action="sell-it"]');
    $(document).on('click','[data-action="sell-it"]',function(e){       

        e.preventDefault();
        var item = {};
            item.market_currency    = $(this).parents('.item').attr('data-market') ==='gpw' ? 'pln' : 'usd';        
            item.symbol             = $(this).parents('.item').attr('data-symbol');
            item.market             = $(this).parents('.item').attr('data-market');
            item.price              = $(this).parents('.item').find('.price').val();
            //item.last_updated_at    = $(this).parents('.item').find('.updated-at').text();
            item.logo               = $(this).parents('.item').find('.logo-container').html();

        buy_sell_popup({ action:'sell', item:item });

        //load_popup('add-new-stock', { action:'sell', item:item });    

    });


    // Add new stock - Popup
    $(document).off('click', '.heading.active .sell-save');
    $(document).on('click', '.heading.active .sell-save', function(){
        sell_save();
    });
    
    $(document).off('click', '.heading.active .buy-save');
    $(document).on('click', '.heading.active .buy-save', function(){
        if (config.debug) console.log('btn buy-save clicked');
        buy_save();
    });



    // View Buy - Totals calculation 
    
    $(document).off('keyup', '.view-buy #qty');
    $(document).on('keyup', '.view-buy #qty', function(){        
        buy_reload_totals();        
    });
    
    $(document).off('click', '.view-buy #price');
    $(document).on('keyup', '.view-buy #price', function(){        
        buy_reload_totals();        
    });
    
    $(document).off('click', '.view-sell #sold_price');
    $(document).on('keyup', '.view-sell #sold_price', function(){
        sell_reload_totals();
    });
    
    $(document).off('click', '.view-sell #total-qty-sell');
    $(document).on('keyup', '.view-sell #total-qty-sell', function(){        
        sell_reload_totals();                
    });
    
    // Go to step 2 Buttons
    $(document).off('click', '.view-buy [data-step="1"] #autosuggestions .stock');
    $(document).on('click', '.view-buy [data-step="1"] #autosuggestions .stock', function(){

        var item = {};
        item.market_currency    = $(this).attr('data-market')==='gpw' ? 'pln' : 'usd';
        item.price              = $(this).attr('data-price');
        item.last_updated_at    = $(this).attr('data-last-updated-at');
        item.symbol             = $(this).attr('data-symbol');
        item.market             = $(this).attr('data-market');
        item.logo               = $(this).find('.logo-container').html();

        buy_step2(item);

    });
    
    $(document).off('click', '.view-sell [data-step="1"] .item');
    $(document).on('click', '.view-sell [data-step="1"] .item', function(){

        var item = {};
        item.symbol = $(this).attr('data-symbol');
        item.market = $(this).attr('data-market');
        item.logo   = $(this).find('.logo-container').html();

        sell_step2(item);

    });
    
    // Funds
    $(document).off('click', '.funds-delete');
    $(document).on('click','.funds-delete',function(){

        var id = $(this).parents('.fund').attr('data-id');

        $.ajax({
            url: config.api_url,
            data: { endpoint:'/wallet/funds', id:id },
            type: 'DELETE',
            dataType: 'JSON',
            success: function(response){
                if (config.debug) console.log(response);
                init();
            },
            error: function(response){                            
                if (config.debug) console.log(response);
            }
        });
    });