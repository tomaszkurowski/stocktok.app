    
    $.ajax({
        url:"/extensions/market/views/market.html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { console.log(e); }        
    });
    


