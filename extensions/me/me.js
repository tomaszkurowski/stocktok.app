    
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
                Cookies.remove('username');
                Cookies.remove('persistence');
                location.href='/me/login';
            },
            error:function(e){ if (config.debug) console.log(e); }
        });
  
    }else{
    
        console.log(mvc.view);
        $.ajax({
            url:"/extensions/me/views/"+mvc.view+".phtml",
            cache:false,
            success: function(data){ $(mvc.target).html(data); },
            error:   function(e)   { if (config.debug) console.log(e); }        
        });

    }


