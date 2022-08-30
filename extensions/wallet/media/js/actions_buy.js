

    function buy_save(){
        
        var form = {};
        $('.view-buy:not(.slick-cloned) .form input').each(function(index,element){
            form[$(element).attr('id')] = $(element).val();
        });
        $('.view-buy:not(.slick-cloned) .form select').each(function(index,element){
            form[$(element).attr('id')] = $(element).val();
        });        
        
        if (form['currency'] !== 'usd'){
            form['currency_rate'] = currencies[form['currency']];
        }
        
        form['price_origin'] = $(".view-buy:not(.slick-cloned) #price-origin").prop('checked');        
        
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/wallet/buy2', 
                item: form 
            },
            type: 'POST',
            dataType: 'JSON',
            cache: false,
            success: function(response){            
                if (response.success === false){
                    
                    if (response.err === 1){
                        $('.popup-body').prepend('<div class="inner-popup"><div class="icon icon-energy"></div><div class="title">No sufficient funds</div><div class="description">On "Player" mode you can buy only from available funds which are equal for all players.You can also switch to "Silent" in settings and have unlimitted balance, but your transactions will be visible only for you and not ranked.</div><div class="actions"><div class="btn primary close">Ok</div></div></div>');
                    }
                    return;
                }
                $('.popup-body').html('\
                    <div class="popup-success">\n\
                        <div class="icon-btn icon-check1"></div>\n\
                        <div class="title">You successfully added: <span class="symbol">'+form.symbol.toUpperCase()+'</span> to your wallet.</div>\n\
                    </div>');                
                $('.popup-btn.step2-btn').remove();
                                
                me.funds = response.funds;
                
                // Re-init wallet if needed
                if (mvc.model==='wallet'){ init(); }
                if (config.debug) console.log(response);               
            },
            error: function(response){
                if (config.debug) console.log(response);
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
        $('.view-buy #symbol').val(item.symbol);
        $('.view-buy #market').val(item.market);
        
        // Purchased currency
        $('.view-buy #currency').html('');
        $.each(currencies, function(i, rate){            
            $('.view-buy #currency').append('<option value="'+i+'"'+(i === settings.display_currency ? ' selected="SELECTED"':'')+'>'+i+'</option>');
        });

                    
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
                        
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
        
        if (me.public === 0){
            $('.popup .header .label').removeClass('hide');
        }
        
        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
    } 
    
    function buy_reload_totals(){

        var popup  = $('.view-buy:not(.slick-cloned)')
    
        var market = $(popup).find('#market').val();                        
        var qty    = $(popup).find('#qty').val();
        var price  = $(popup).find('#price').val(); 

        var market_currency = get_market_currency(market);      
        var market_rate     = (1 / currencies[market_currency]).toFixed(config.precision_rate);
        
        var purchased_total = (price * qty * market_rate).toFixed(config.precision_total);
        var funds_after     = (parseFloat(me.funds) - purchased_total).toFixed(config.precision_total);
                
        var purchased_total_display = (purchased_total * currencies[settings.display_currency]).toFixed(2);
        var funds_after_display     = (funds_after * currencies[settings.display_currency]).toFixed(2);
            
                                  
        $(popup).find('.total-main').text(purchased_total_display+' '+settings.display_currency);
        if (settings.display_currency !== market_currency){
           $(popup).find('.total-additional').html((price * qty).toFixed(2) + ' ' + market_currency + '<br />' + 'x '+market_rate+' '+market_currency).show(); 
        }else{
           $(popup).find('.total-additional').hide(); 
        }
               
        if (me.public === 1){
            $(popup).find('.funds').removeClass('hide');
            $(popup).find('.funds .funds-after').text(funds_after_display);  
            $(popup).find('.funds .funds-currency').text(settings.display_currency);
            if (funds_after <0){ $('.funds-after').addClass('error'); }else{ $('.funds-after').removeClass('error'); }
        } 
                
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight()); 
 
    }
    
    // Price origin 
    $(document).off('change', '.popup.add-new-stock :not(slick-cloned) #price-origin');
    $(document).on('change', '.popup.add-new-stock :not(slick-cloned) #price-origin', function(e){        

        e.preventDefault();
        $(this).parents('.form').find('.price-origin-historical').toggleClass('hide');

        if (me.public === 0){ 
            //$(this).parents('.form').find('.price-origin-historical input').prop('disabled',false);
            $(this).parents('.form').find('.price-origin-historical .info').hide();
        }else{                
            //$(this).parents('.form').find('.price-origin-historical input').prop('disabled',true); 
        }

        // Slick adaptiveHeight
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());

    });    
