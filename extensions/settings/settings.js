    
    mvc.path = "index";
    if (mvc.view === "intro") mvc.path = mvc.view;
    
    $.ajax({
        url:"/extensions/settings/views/"+mvc.path+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); window.scrollTo(0,0); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });