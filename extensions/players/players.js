
    mvc.path = 'rankings';    
    $.ajax({
        url:"/extensions/players/views/"+mvc.path+".phtml",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });