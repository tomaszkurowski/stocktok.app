
    mvc.path = 'rankings';    
    $.ajax({
        url:"/extensions/players/views/"+mvc.path+".phtml",
        cache:false,
        success: function(data){ $(mvc.target).html(data); window.scrollTo(0,0); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });