
    mvc.path = 'quizes';
    
    if (mvc.view === 'quiz'){ mvc.path = 'quiz'; }
    if (mvc.view === 'lesson' && mvc.controller){ mvc.path='lesson/'+mvc.controller; }
    
    $.ajax({
        url:"/extensions/learn/views/"+mvc.path+".html",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { if (config.debug) console.log(e); }        
    });
    


