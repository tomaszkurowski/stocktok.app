

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
                        $('.view-buy').hide();
                        $('.popup-body .inner-popup').remove();
                        
                        $('.popup-body').prepend($('<div class="inner-popup"><div class="icon icon-energy"></div><div class="title">No sufficient funds</div><div class="description">In "Game" mode you can buy only from available funds. You can get first funds in Quizes.</div><div class="actions"><div class="btn primary">Ok</div></div></div>').bind('click',function(){
                            $('.popup-body .inner-popup').remove();
                            $('.view-buy').show();
                        }));
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
                
                //Reinits if needed
                if (mvc.model==='entities'){ movesReload(function(){ resultsReload(function(){ loadSummary(); });  }); }                
                if (config.debug) console.log(response);               
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
 
    }




    // View Buy - Step 2
    function buy_step2(item){
               
        // Basic attributes 
        $('.view-buy .symbol').html(stock.logo ? '<img src="'+stock.logo+'" class="logo" />' : stock.symbol);
        $('.view-buy .price').text(format_price(stock.price)); 
        //$('.view-buy .last-updated-at').text(item.last_updated_at);      
        $('.view-buy .display-currency').text(settings.display_currency);
        $('.view-buy div:not(.summary) .market-currency').text(stock.market_currency);
        
        // Form attributes
        $('.view-buy #price').val(parseFloat(stock.price).toFixed(2));
        $('.view-buy #symbol').val(stock.symbol);
        $('.view-buy #market').val(stock.market);
        
        // Purchased currency
        $('.view-buy #currency').html('');
        $.each(currencies, function(i, rate){            
            $('.view-buy #currency').append('<option value="'+i+'"'+(i === settings.display_currency ? ' selected="SELECTED"':'')+' style="text-transform:capitalize">'+i+'</option>');
        });
                        
        button({ class: "popup-btn step2-btn icon-btn icon-check1" }, function(){ buy_save(); });
        
        buy_reload_totals();
        
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
           $(popup).find('.total-additional').html((price * qty).toFixed(2) + ' ' + market_currency + '<br />' + (Math.round(market_rate) !== 1 ? 'x '+market_rate+' '+market_currency : '')).show(); 
        }else{
           $(popup).find('.total-additional').hide(); 
        }
               
        if (me.mode === "game"){
            $(popup).find('.funds').removeClass('hide');
            $(popup).find('.funds .funds-after').text(funds_after_display);  
            $(popup).find('.funds .funds-currency').text(settings.display_currency);
            if (funds_after <0){ $('.funds-after').addClass('error'); }else{ $('.funds-after').removeClass('error'); }
        }else{
            $(popup).find('.funds').addClass('hide');
        } 
                
       
 
    }
