    
    $.ajax({
        url:"/extensions/about/views/about.html",
        cache:false,
        success: function(data){ $("main").html(data); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });