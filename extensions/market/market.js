
    mvc.path = 'search';
    
    $.ajax({
        url:"/extensions/market/views/"+mvc.path+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });
    


