
    mvc.path = 'transactions';
    if (mvc.view === 'analysis'){        
        mvc.path = 'analysis';
        load_highcharts(function(){
            $.ajax({
                url:"/extensions/wallet/views/"+mvc.path+".html",
                cache:false,
                success: function(data){ $(mvc.target).html(data); },
                error:   function(e)   { 
                    if (config.debug) console.log(e); 
                }        
            });               
        });        
    }else{
        if (mvc.view === 'observed') mvc.path = 'observed';
    
        $.ajax({
            url:"/extensions/wallet/views/"+mvc.path+".html",
            cache:false,
            success: function(data){ $(mvc.target).html(data); },
            error:   function(e)   { 
                if (config.debug) console.log(e); 
            }        
        });       
    }
