    
    $.ajax({
        url:"/extensions/players/views/rankings.phtml",
        cache:false,
        success: function(data){ $(mvc.target).html(data); },
        error:   function(e)   { console.log(e); }        
    });