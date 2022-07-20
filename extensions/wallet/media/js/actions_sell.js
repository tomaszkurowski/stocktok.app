    
    
    // View Sell - Totals calculation
    function sell_reload_totals(){
                             
        var market_currency = $('.view-sell:not(.slick-clone) .form').find('#currency').val();
        var purchased_currency;
         
        var total_qty_sell  = qty_sell = parseFloat($('.view-sell:not(.slick-clone) .form').find('#total-qty-sell').val());
        if (isNaN(total_qty_sell)){ total_qty_sell = 0; }
        
        var qty_owned = 0;
        
        // Transactions
        $.each($('.view-sell:not(.slick-cloned) .transactions .transaction:not(.template)'),function(element){                    
         
            $(this).find('.for-sell').html('');
        
            var transaction = {};
            transaction.purchased_qty = parseFloat($(this).attr('data-purchased-qty')); 
            
            transaction.keep_qty = 0;            
            transaction.sell_qty = transaction.purchased_qty;
            
            if (qty_sell > 0){
                
                if (transaction.purchased_qty > qty_sell){
                    transaction.keep_qty = transaction.purchased_qty - qty_sell;
                    transaction.sell_qty = qty_sell;                                        
                }           
                $(this).find('.for-sell').html('For sell: <b>'+transaction.sell_qty+'</b>'+(transaction.keep_qty > 0 ? '<br />To keep: <b>'+(transaction.keep_qty)+'</b>' : ''));  
                
            }
            qty_sell  = qty_sell  - transaction.purchased_qty;
            qty_owned = qty_owned + transaction.purchased_qty;
            
            $(this).attr('data-keep-qty',transaction.keep_qty);
            $(this).attr('data-sell-qty',transaction.sell_qty);
            
            purchased_currency = $(this).attr('data-purchased-currency');
                        
        });
        
        // Max quantity sell
        if (total_qty_sell > qty_owned){ 
            $('.view-sell:not(.slick-cloned) #total-qty-sell').val(qty_owned); 
            total_qty_sell = qty_owned;
        }
        
        
        // How much: I sell / I earn / I keep (PLN/USD)
        
        var sold_price      = $('.view-sell:not(.slick-cloned) .form #sold_price').val();
        
        var rate = (currencies[settings.display_currency] / currencies[market_currency]).toFixed(2);
                       
        var total_main       = sold_price * total_qty_sell * rate;
        var total_additional = sold_price * total_qty_sell;
                
        if (market_currency === 'usd'){
            console.log('sell cond1');
            console.log(me.funds);
            console.log(purchased_currency);
            console.log(round(parseFloat(sold_price * total_qty_sell * currencies[purchased_currency]),2));
            var funds_after = me.funds * currencies[purchased_currency] + round(parseFloat(sold_price * total_qty_sell * currencies[purchased_currency]),2);
        }else{
            if (purchased_currency === market_currency){
                console.log('sell cond2');
                var funds_after = (me.funds + round(parseFloat(sold_price * total_qty_sell / currencies[purchased_currency]),4)) * currencies[purchased_currency];                
            }else{
                console.log('sell cond3');
               var funds_after = (me.funds + parseFloat(sold_price * total_qty_sell * rate)) * currencies[purchased_currency]; 
            }            
        }
        
        
        $('.view-sell:not(.slick-cloned) .total-main').text(format_price(total_main,2)+' '+settings.display_currency);
        $('.view-sell:not(.slick-cloned) .total-additional').text(format_price(total_additional,2)+' '+market_currency+' (x'+format_price(rate,2)+' '+settings.display_currency+')');
        
        if (settings.display_currency === market_currency){ $('.view-buy:not(.slick-cloned) .total-additional').hide();
        }else{ $('.view-sell:not(.slick-cloned) .total-additional').show(); }
               
        if (me.public === 1){
            $('.view-sell:not(.slick-cloned) .funds').removeClass('hide');
            $('.view-sell:not(.slick-cloned) .funds .funds-after').text(format_price(funds_after,2));  
            $('.view-sell:not(.slick-cloned) .funds .funds-currency').text(settings.display_currency);           
        }        
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight()); 
       
        
        
        /*
        var total           = total_qty_sell * sold_price * rate;
        var total_market    = total_qty_sell * sold_price;
        
        $('.view-sell:not(.slick-cloned)').find('#currency_rate').val(rate);
                
        $('.view-sell .summary .total').text(format_price(total,2));
        if (total !== total_market) $('.view-sell .summary .total-market').text(format_price(total_market));
        if (total !== total_market) $('.view-sell .summary .rate').text('(x'+rate.toFixed(2)+' '+settings.display_currency+')');       
        */
    }
        
    
    

    
    function sell_step2_html(transactions){
        
        $('.view-sell:not(.slick-cloned) .transactions .transaction:not(.template)').remove();
        $.each(transactions,function(index,item){                           
            
            var transaction = $('.view-sell:not(.slick-cloned) .transactions .transaction.template').clone().removeClass('hide').removeClass('template');

            $(transaction).attr('data-purchased-qty',item.purchased_qty);
            $(transaction).attr('data-purchased-price',item.purchased_price);
            $(transaction).attr('data-purchased-currency',item.purchased_currency);
            $(transaction).attr('data-id',item.wallet_entities_id);

            $(transaction).find('.qty').text(item.purchased_qty+' x');
            $(transaction).find('.purchased-price').text(format_price(item.purchased_price)+' '+item.purchased_currency);

            $('.transactions').prepend($(transaction));            

            $('.view-sell:not(.slick-cloned) .price-origin .price').text(format_price(item.price));
            //$('.view-sell:not(.slick-cloned) .price-origin .last-updated-at').text(item.last_updated_at);

            $('.view-sell:not(.slick-cloned) .form #sold_price').val(parseFloat(item.price));
            $('.view-sell:not(.slick-cloned) .form #market').val(item.market);
            $('.view-sell:not(.slick-cloned) .form #currency').val((item.market==='gpw' ? 'pln' : 'usd'));
            $('.view-sell:not(.slick-cloned) .form #total-qty-sell').val(parseFloat($('.view-sell:not(.slick-cloned) .form #total-qty-sell').val())+ parseFloat(item.purchased_qty));

            
        });       
        sell_reload_totals();        
    }
    
    
    
    
    
    // View Sell - Step 2
    function sell_step2(item){
        
        $('.popup-btn.step2-btn').remove();       
        //$('.popup.add-new-stock .views').slick('slickGoTo',1);
        
        
        // Reset tabs
        $('.tab.buy').removeClass('active');
        $('.tab.sell').addClass('active');
        
        // Handle market currency
        if (item.market==='gpw') item.market_currency = 'pln';
        else item.market_currency = 'usd';
        
        // Change step
        $('.view-sell .steps').attr('data-current-step',2); 
                        
        // Basic attributes
        $('.view-sell .symbol').html(item.logo);
        $('.view-sell .price').text(format_price(item.price)); 
        $('.view-sell .last-updated-at').text(item.last_updated_at);      
        $('.view-sell .display-currency').text(settings.display_currency);
             
        // Form attributes
        $('.view-sell .form #symbol').val(item.symbol);
        $('.view-sell .form #total-qty-sell').val(0); 
       
        // Currency rates
        $('.view-sell [data-step="2"] .summary .market-currency').text('');         
        if (item.market_currency !== settings.display_currency){
            $('.view-sell [data-step="2"] .summary .market-currency').text(item.market_currency);
            $('.view-sell [data-step="2"] .summary .total-market').text('0.00');                       
        }
       
        // Transactions
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/wallet/transactions', symbol:item.symbol, market:item.market, type:'active' },
            type: 'GET',
            dataType: 'JSON',
            cache:false,
            success: function(response){            
                
                sell_step2_html(response.transactions);
                
                // Slick adaptiveHeight
                $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
                    
                if (config.debug) console.log('Transactions for sell:');
                if (config.debug) console.log(response);               
            },
            error: function(response){
                console.log(response);
            }
        });
        
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
        
        // Add buy-back & save btns
        button({ class: "popup-btn step2-btn icon-btn icon-check1" }, function(){ sell_save(); });
        button({ class: "popup-btn step2-btn icon-btn icon-keyboard_backspace1" }, function(){ sell_step1(); });
    
    }
    
    
    
    
    function sell_step1_html(transactions){
        
        $('[data-step="1"] .items').html('');
        $.each(transactions,function(index,transaction){
              
            // Skip if symbol has been already appended
            if ($('.view-sell:not(.slick-cloned) .items .item[data-symbol="'+transaction.symbol+'"][data-market="'+transaction.market+'"]').length){ return; } 
        
            var item = $('<div></div>').addClass('item');
            $(item).attr('data-symbol',transaction.symbol);
            $(item).attr('data-market',transaction.market);
            $(item).append('<div class="logo-container">' + (transaction.logo ? '<img src="'+transaction.logo+'" class="logo" />' : '<div class="logo no-img">'+transaction.symbol+'</div>') + '</div>');

            $('[data-step="1"] .items').append($(item));
        });
        
    }
    
    
    
    
    
    // View Sell - Step 1
    function sell_step1(){
        
        $('.popup-btn.step2-btn').remove();
        
        $('.tab.buy').removeClass('active');
        $('.tab.sell').addClass('active');
    
        $('.view-sell .steps').attr('data-current-step',1);
        $('.heading.active').find('.popup-btn').remove();
        
        // Transactions Ajax 
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/wallet/transactions', type:'active' },
            type: 'get',
            dataType: 'JSON',
            cache:false,
            success: function(response){            

                transactions = response.transactions;
                sell_step1_html(transactions);                                                                
                
                // Slick adaptiveHeight refresh
                $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());

                if (config.debug) console.log('Symbols for sell:');
                if (config.debug) console.log(response);
                
            },
            error: function(response){
                console.log(response);
            }
        });
        
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());

    }
    

    
    
    // Buy/Sell - Save
    function sell_save(){                
        var form = {};
        
        // Item
        $('.view-sell:not(.slick-cloned) .form input').each(function(index,element){
            form[$(element).attr('id')] = $(element).val();
        });
        
        if (form['currency'] !== 'usd'){
            form['currency_rate'] = currencies[form['currency']];
        }
        
        // Item's transactions
        form.transactions = [];
        $('.view-sell:not(.slick-cloned) .transactions .transaction:not(.template)').each(function(index,element){
            
            var transaction = {};
            transaction.id       = $(element).attr('data-id');
            transaction.keep_qty = $(element).attr('data-keep-qty');
            transaction.sell_qty = $(element).attr('data-sell-qty');
            
            form.transactions.push(transaction);
        });
        console.log('Form');
        console.log(form);

        $.ajax({
            url: config.api_url,
            data: { endpoint: '/wallet/sell', item: form },
            type: 'POST',
            dataType: 'JSON',
            success: function(response){                            
                
                $('.popup-body').html('\
                    <div class="popup-success">\n\
                        <div class="icon-btn icon-check1"></div>\n\
                        <div class="title">You successfully sold: <span class="symbol">'+form.symbol.toUpperCase()+'</span></div>\n\
                    </div>');                
                $('.popup-btn.step2-btn').remove(); 
                
                me.funds = response.funds;
                
                // Re-init wallet if needed
                if (mvc.model==='wallet'){ init(); }
                
                if (config.debug) console.log('Sell - Response from API:');
                if (config.debug) console.log(response);               
            },
            error: function(response){
                console.log(response);
            }
        });
    }
