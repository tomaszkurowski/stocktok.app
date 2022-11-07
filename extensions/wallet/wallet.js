
    mvc.path = 'dashboard';
    if (mvc.view === 'observed')    mvc.path = 'observed';
    if (mvc.view === 'trend')       mvc.path = 'trend';

    $.ajax({
        url:"/extensions/wallet/views/"+mvc.path+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { 
            if (config.debug) console.log(e); 
        }        
    });       