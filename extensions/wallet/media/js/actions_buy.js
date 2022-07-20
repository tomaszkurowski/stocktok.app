

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
                endpoint: '/wallet/buy', 
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
        
        var market = $('.view-buy:not(.slick-cloned)').find('#market').val();                        
        var qty    = $('.view-buy:not(.slick-cloned) #qty').val();
        var price  = $('.view-buy:not(.slick-cloned) #price').val(); 

        var purchased_currency = $('.view-buy:not(.slick-cloned)').find('#currency').val();
        var market_currency    = 'usd';
        if (market === 'gpw' || market === 'newconnect'){ 
            market_currency    = 'pln'; }         
        
        var rate = (currencies[purchased_currency] / currencies[market_currency]).toFixed(2);
                       
        var total_main       = price * qty * rate;
        var total_additional = price * qty;
         
        if (market_currency === 'usd'){
            var funds_after = me.funds * currencies[purchased_currency] - round(parseFloat(price * qty * currencies[purchased_currency]),2);
        }else{
            if (purchased_currency === market_currency){
                var funds_after = (me.funds - round(parseFloat(price * qty / currencies[purchased_currency]),4)) * currencies[purchased_currency];                
            }else{
               var funds_after = (me.funds - parseFloat(price * qty * rate)) * currencies[purchased_currency]; 
            }            
        }
        
        $('.view-buy:not(.slick-cloned) .total-main').text(format_price(total_main,2)+' '+purchased_currency);
        $('.view-buy:not(.slick-cloned) .total-additional').text(format_price(total_additional,2)+' '+market_currency+' (x'+format_price(rate,2)+' '+purchased_currency+')');
        
        if (purchased_currency === market_currency){ $('.view-buy:not(.slick-cloned) .total-additional').hide();
        }else{ $('.view-buy:not(.slick-cloned) .total-additional').show(); }
               
        if (me.public === 1){
            $('.view-buy:not(.slick-cloned) .funds').removeClass('hide');
            $('.view-buy:not(.slick-cloned) .funds .funds-after').text(format_price(funds_after,2));  
            $('.view-buy:not(.slick-cloned) .funds .funds-currency').text(purchased_currency);
            if (funds_after <0){ $('.funds-after').addClass('error'); }else{ $('.funds-after').removeClass('error'); }
        }        
        $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight()); 
        //3167.75  
    }
    
    // Price origin 
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
