

    function buy_save(){
        
        var form = {};
        $('.view-buy:not(.slick-cloned) .form input').each(function(index,element){
            form[$(element).attr('id')] = $(element).val();
        });
        
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/wallet/buy', 
                item: form 
            },
            type: 'POST',
            dataType: 'JSON',
            cache: false,
            success: function(response){            
                
                $('.popup-body').html('\
                    <div class="popup-success">\n\
                        <div class="icon-btn icon-check1"></div>\n\
                        <div class="title">You successfully added: <span class="symbol">'+form.symbol.toUpperCase()+'</span> to your wallet.</div>\n\
                    </div>');                
                $('.popup-btn.step2-btn').remove();
                
                // Re-init wallet if needed
                if (mvc.model==='wallet'){ init(); }
                
                if (config.debug) console.log(response);               
            },
            error: function(response){
                console.log(response);
            }
        });
 
    }




    // View Buy - Step 2
    function buy_step2(item){
         
        $('.popup-btn.step2-btn').remove();
        
        $('.tab.buy').addClass('active');
        $('.tab.sell').removeClass('active');
        
        // @TODO, For small Refactor
        $('.popup.add-new-stock').removeClass('step1-simple'); // Class name to change, sth like "no-header no-footer"
        $('.popup.add-new-stock #autosuggestions').removeClass('active').addClass('hide'); // active/hide :) decision
        
        // Change step
        $('.view-buy .steps').attr('data-current-step',2); 
        
        // Basic attributes 
        $('.view-buy .symbol').html(item.logo);
        $('.view-buy .price').text(format_price(item.price)); 
        //$('.view-buy .last-updated-at').text(item.last_updated_at);      
        $('.view-buy .display-currency').text(settings.display_currency);
        $('.view-buy div:not(.summary) .market-currency').text(item.market_currency);
        
        // Form attributes
        $('.view-buy #price').val(parseFloat(item.price).toFixed(2));
        $('.view-buy #qty').val(1);
        $('.view-buy #symbol').val(item.symbol);
        $('.view-buy #market').val(item.market);
        $('.view-buy #currency').val(item.market_currency);
                    
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
        
        // Currency rates
        if (item.market_currency !== settings.display_currency){
            $('.step2 .summary .market-currency').text(item.market_currency);
            $('.step2 .summary .total-market').text('0.00');
            
        }else{
           $('.step2 .summary .market-currency').text(''); 
        }   
                
        button({ class: "popup-btn step2-btn icon-btn icon-check1" }, function(){ buy_save(); });
        button({ class: "popup-btn step2-btn icon-btn icon-keyboard_backspace1" }, function(){ buy_step1(); });
        
        buy_reload_totals();
        
    }
    
    
    
    function buy_step1(){  
        
        $('.popup-btn.step2-btn').remove();      
        
        $('.tab.buy').addClass('active');
        $('.tab.sell').removeClass('active');
        
        $('.view-buy .steps').attr('data-current-step',1);        
        $('.view-buy #symbol').val('');
        
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
    }
    
    
    
    
    
    function buy_reload_totals(){
        var market_currency = $('.view-buy:not(.slick-cloned)').find('#currency').val();
        var rate = 1;
        
        console.log(settings.display_currency);
        if (market_currency !== settings.display_currency){
            if (currencies.hasOwnProperty(settings.display_currency) && currencies.hasOwnProperty(market_currency)){
                rate = parseFloat(currencies[settings.display_currency]) / parseFloat(currencies[market_currency]);
            }
        }
        console.log('Rate = '+rate);
                
        var qty             = $('.view-buy:not(.slick-cloned) #qty').val();
        var price           = $('.view-buy:not(.slick-cloned) #price').val();       
        var total           = qty * price * rate;
        var total_market    = qty * price;
        
        $('.view-buy:not(.slick-cloned)').find('.summary .total').text(format_price(total,2));
        if (total !== total_market) $('.view-buy:not(.slick-cloned)').find('.summary .total-market').text(format_price(total_market));
        if (total !== total_market) $('.view-buy:not(.slick-cloned)').find('.summary .rate').text('(x'+rate.toFixed(2)+' '+settings.display_currency+')');
        
    }
