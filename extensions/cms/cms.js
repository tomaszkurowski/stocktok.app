    
    $.ajax({
        url:"/extensions/cms/views/"+mvc.view+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });
    


