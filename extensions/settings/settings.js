    
    $.ajax({
        url:"/extensions/settings/views/settings.html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { console.log(e); }        
    });