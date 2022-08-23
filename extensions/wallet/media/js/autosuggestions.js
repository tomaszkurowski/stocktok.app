$(document).off('keyup', '#symbol');
$(document).on('keyup', '#symbol', function(){
    
    $('.step2').removeClass('active');
    $('.step2 .price').text(''); 
    $('.step2 .last-updated-at').text(''); 
    $('.step2 .market-currency').text('');
    $('.step2 .display-currency').text('');
    $('.step2 #price').val('');
    $('.step2 #qty').val('');
    $('.step2 #symbol').val('');
    $('.step2 #market').val('');
    $('.step2 #currency').val('');  
    $('.step2 .summary .total').text('0.00');
    $('.step2 .summary .total-market').text('');
    $('.step2 .summary .rate').text('');
    
    
    var value = $(this).val().toLowerCase();            
    if (value.length>0){
        $(this).parent('.field').find('label > span').hide();
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/entities', search:value },
            type: 'GET',
            dataType: 'JSON',
            cache:false,
            success: function(response){
                
                $('#autosuggestions').html('').removeClass('hide').addClass('active');                

                if (response.results.total === 0){
                    $('#autosuggestions').html('<div class="no-results">Unfortunatelly we couldn\'t find any results.. You can try by symbol (CDPROJEKT), short symbol (CDR), ISIN or company name.</div>');                    
                }else{
                    $('.popup.add-new-stock').addClass('step1-simple');
                    
                    $.each(response.entities, function(i, item){
                        if (item.symbol!=null){
                            
                            if (item.industry===null) item.industry = '';
                            if (item.name===null) item.name = 'Name not imported yet';
                            
                            item.currency     = item.market==='gpw' ? 'PLN' : 'USD';
                            
                            //item.symbol.replace(new RegExp('(' + value + ')', 'ig'), '<em>$1</em>');
                            item.highlighted_symbol  = String(item.symbol).replace(new RegExp(value, "gi"),"<span class='highlight'>$&</span>");
                            item.highlighted_name    = String(item.name).replace(new RegExp(value, "gi"),"<span class='highlight'>$&</span>");
                            
                            
                            var stock = ''+
                            '<div class="stock" '+
                                    'data-symbol="'+item.symbol+'" '+
                                    'data-market="'+item.market+'" '+
                                    'data-price="'+item.price+'"'+
                                    'data-currency="'+item.currency.toLowerCase()+'"'+
                                    'data-last-updated-at="'+item.last_updated_at+'">'+
                                '<div class="logo-container">' + (item.logo ? '<img src="'+item.logo+'" class="logo" alt="logo-'+item.symbol+'" />' : '<div class="logo no-img">'+item.symbol+'</div>') + '</div>'+
                                '<div class="info">'+
                                    '<div class="name">'+item.highlighted_name+'</div>'+
                                    '<div class="label">'+
                                        item.industry +
                                    '</div>'+
                                '</div>'+
                                '<div class="additional-info">'+
                                    '<span class="label type">'+item.type+'</span>'+
                                    ((item.type==='stock') ? '<span class="market">'+item.market+'</span>' : '')+
                                '</div>'+
                            '</div>';
                            $('#autosuggestions').append(stock);
                            
                        }
                        
                    });
                    $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
                    
                }
                // Slick adaptiveHeight
                $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
                
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
        $('#autosuggestions').scrollTop($('#autosuggestions')[0].scrollHeight);
        $('#autosuggestions').removeClass('hide');
    }else{
        $('#autosuggestions').html('').addClass('hide').removeClass('active');
        $('.popup.add-new-stock').removeClass('step1-simple');
    }
    // Slick adaptiveHeight
    $('.popup.add-new-stock .slick-list').height($('.popup.add-new-stock .slick-current').outerHeight());
    
});


//$(document).on('click', '.add-new-stock .step2 #price-origin', function(){ $('.add-new-stock .step2 .field.price').toggleClass('hide'); });
// After unchecking this checkbox I could take open/high/low from purchased_date and give slider (good UX)

$(document).off('blur', '.add-new-stock .step2 #date');
$(document).on('blur', '.add-new-stock .step2 #date', function(){ 
    $.ajax({
        url: config.api_url,
        data: { 
            endpoint: '/entity/historical/single', 
            symbol: $('.add-new-stock #symbol').val(),
            market: $('.add-new-stock #market').val(),
            updated_at:$('.add-new-stock #date').val() },
        type: 'get',
        dataType: 'JSON',
        cache:false,
        success: function(response){
            if (response.price){ 
                $('.price-from-purchased-date').removeClass('hide').html('At '+response.updated_at+ ' price was: <b>'+response.price+' '+$('.add-new-stock #currency').val()+'</b>.');
                $('.add-new-stock #price').val(response.price);
            }else{
                $('.price-from-purchased-date').removeClass('hide').html(''+$('.add-new-stock #date').val()+ ' wasn\'t a trading day.');
            }
        },
        error: function(response){
            if (config.debug) console.log(response);
        }
    });
});
        