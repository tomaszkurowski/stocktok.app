
    mvc.path = 'home';
    
    if (mvc.view) mvc.path = 'profile';
    if (mvc.view === 'ranking') mvc.path = 'ranking';
    
    $.ajax({
        url:"/extensions/players/views/"+mvc.path+".phtml",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { console.log(e); }        
    });