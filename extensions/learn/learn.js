
    mvc.path = 'dashboard';
    
    if (mvc.view === 'chat'){ mvc.path = 'chat'; }
    if (mvc.view === 'quizes'){ mvc.path = 'quizes'; }
    if (mvc.view === 'quiz'){ mvc.path = 'quiz'; }
    if (mvc.view === 'lesson' && mvc.controller){ mvc.path = 'lesson'; }
    
    $.ajax({
        url:"/extensions/learn/views/"+mvc.path+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); window.scrollTo(0,0); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });
    


