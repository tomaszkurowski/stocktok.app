    
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
                location.href='/me/login/?version='+config.version;
            },
            error:function(e){ if (config.debug) console.log(e); }
        });
  
    }else{
    
        if (config.debug) console.log(mvc.view);
        $.getScript('/extensions/me/media/js/login.js?version='+config.version,function(){
            $.ajax({
                url:"/extensions/me/views/"+mvc.view+".html",
                cache:false,
                success: function(data){ $(mvc.target).html(data); },
                error:   function(e)   { if (config.debug) console.log(e); }        
            });
        }); 

    }


