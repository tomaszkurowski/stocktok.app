    
    if (mvc.view === 'logout'){
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/me/logout'
            },
            type: 'POST',
            dataType: 'JSON',
            success:function(){
                sessionStorage.clear();
                location.href='/me/login';
            },
            error:function(e){ console.log(e); }
        });
  
    }else{
    
        $.ajax({
            url:"/extensions/me/views/"+mvc.view+".phtml",
            cache:false,
            success: function(data){ $(mvc.target).html(data); },
            error:   function(e)   { console.log(e); }        
        });

    }


