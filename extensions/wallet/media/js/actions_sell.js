    
    
    // View Sell - Totals calculation
    function sell_reload_totals(){
                             
        var popup  = $('.view-sell:not(.slick-cloned)');
         
        var total_qty_sell  = qty_sell = parseFloat($(popup).find('#total-qty-sell').val());
        if (isNaN(total_qty_sell)){ total_qty_sell = 0; }
        
        var qty_owned = 0;
        
        // Transactions
        $.each($(popup).find('.transactions .transaction:not(.template)'),function(element){                    
         
            $(this).find('.for-sell').html('');
        
            var transaction = {};
            transaction.purchased_qty       = parseFloat($(this).attr('data-purchased-qty')); 
            transaction.purchased_currency  = $(this).attr('data-purchased-currency');
            transaction.purchased_rate      = $(this).attr('data-purchased-rate');
            transaction.market_currency     = $(this).attr('data-market-currency');
            transaction.market_rate         = $(this).attr('data-market-rate');
            
            transaction.keep_qty = 0;            
            transaction.sell_qty = transaction.purchased_qty;
            
            if (qty_sell > 0){
                
                if (transaction.purchased_qty > qty_sell){
                    transaction.keep_qty = transaction.purchased_qty - qty_sell;
                    transaction.sell_qty = qty_sell;                                        
                }           
                $(this).find('.for-sell').html('For sell: <b>'+transaction.sell_qty+'</b>'+(transaction.keep_qty > 0 ? '<br />To keep: <b>'+(transaction.keep_qty)+'</b>' : ''));  
                
                qty_sell  = qty_sell  - transaction.purchased_qty;
                qty_owned = qty_owned + transaction.purchased_qty;

                $(this).attr('data-keep-qty',transaction.keep_qty);
                $(this).attr('data-sell-qty',transaction.sell_qty);                
                
            }else{
                    transaction.keep_qty = transaction.purchased_qty;
                    transaction.sell_qty = 0; 
                    $(this).attr('data-keep-qty',transaction.keep_qty);
                    $(this).attr('data-sell-qty',transaction.sell_qty);                    
            }                         
        });
        
        // Max quantity sell
        if (total_qty_sell > qty_owned){ 
            $(popup).find('#total-qty-sell').val(qty_owned); 
            total_qty_sell = qty_owned;
        }        
        
        var market_currency = $(popup).find('#currency').val();
        var market_rate     = (1 / currencies[market_currency]).toFixed(config.precision_rate);
        var sold_price      = $(popup).find('#sold_price').val();

        var sold_total          = (sold_price * total_qty_sell * market_rate).toFixed(config.precision_total);
        var funds_after         = (parseFloat(me.funds) + parseFloat(sold_total)).toFixed(config.precision_total);
                
        var sold_total_display  = (sold_total * currencies[settings.display_currency]).toFixed(2);
        var funds_after_display = (funds_after * currencies[settings.display_currency]).toFixed(2);

                       
        $(popup).find('.total-main').text(sold_total_display+' '+settings.display_currency);
        if (settings.display_currency !== market_currency){
           $(popup).find('.total-additional').html((sold_price * total_qty_sell).toFixed(2) + ' ' + market_currency + '<br />' + 'x '+market_rate+' '+market_currency).show(); 
        }else{
           $(popup).find('.total-additional').hide(); 
        }
               
        if (me.mode === "game"){
            $(popup).find('.funds').removeClass('hide');
            $(popup).find('.funds .funds-after').text(funds_after_display);  
            $(popup).find('.funds .funds-currency').text(settings.display_currency);
            if (funds_after <0){ $('.funds-after').addClass('error'); }else{ $('.funds-after').removeClass('error'); }
        }
        
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight()); 
       
    }

    function sell_step2_html(transactions){
        
        $('.view-sell:not(.slick-cloned) .transactions .transaction:not(.template)').remove();
        $.each(transactions,function(index,item){                           
            
            var transaction = $('.view-sell:not(.slick-cloned) .transactions .transaction.template').clone().removeClass('hide').removeClass('template');

            $(transaction).attr('data-purchased-qty',item.purchased_qty);
            $(transaction).attr('data-purchased-price',item.purchased_price);
            $(transaction).attr('data-purchased-currency',item.purchased_currency);
            $(transaction).attr('data-purchased-rate',item.purchased_rate);
            $(transaction).attr('data-market-currency',item.market_currency);
            $(transaction).attr('data-market-rate',item.market_rate);
            $(transaction).attr('data-id',item.wallet_entities_id);

            $(transaction).find('.qty').text(item.purchased_qty+' x');
            $(transaction).find('.purchased-price').text(format_price(item.purchased_price)+' '+item.purchased_currency);

            $('.transactions').prepend($(transaction));            

            $('.view-sell:not(.slick-cloned) .price-origin .price').text(format_price(item.price));
            //$('.view-sell:not(.slick-cloned) .price-origin .last-updated-at').text(item.last_updated_at);

            $('.view-sell:not(.slick-cloned) #sold_price').val(parseFloat(item.price));
            $('.view-sell:not(.slick-cloned) #market').val(item.market);
            $('.view-sell:not(.slick-cloned) #currency').val((item.market==='gpw' ? 'pln' : 'usd'));
            $('.view-sell:not(.slick-cloned) #total-qty-sell').val(parseFloat($('.view-sell:not(.slick-cloned) .form #total-qty-sell').val())+ parseFloat(item.purchased_qty));

            
        });       
        sell_reload_totals();        
    }
    
    // View Sell - Step 2
    function sell_step2(item){
        
        $('.popup-btn.step2-btn').remove();       

        // Reset tabs
        $('.tab.buy').removeClass('active');
        $('.tab.sell').addClass('active');
        
        // Handle market currency
        if (item.market==='gpw') item.market_currency = 'pln';
        else item.market_currency = 'usd';
        
        // Change step
        $('.view-sell .steps').attr('data-current-step',2); 
                        
        // Basic attributes
        $('.view-sell .symbol').html(stock.logo ? '<img src="'+stock.logo+'" class="logo" />' : stock.symbol);
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
                if (config.debug) console.log(response);
            }
        });
        
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
        
        // Add buy-back & save btns
        button({ class: "popup-btn step2-btn icon-btn icon-check1" }, function(){ sell_save(); });
        button({ class: "popup-btn step2-btn icon-btn icon-keyboard_backspace1" }, function(){ sell_step1(); });
    
    }
    
    // Buy/Sell - Save
    function sell_save(){                
        var form = {};
        
        // Item
        $('.view-sell input').each(function(index,element){
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
        if (config.debug) console.log('Form');
        if (config.debug) console.log(form);

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
                
                //Reinits if needed
                if (mvc.model==='entities'){ movesReload(function(){ resultsReload(function(){ loadSummary(); });  }); }  
                
                if (config.debug) console.log('Sell - Response from API:');
                if (config.debug) console.log(response);               
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
    }
