    
    mvc.path = 'entities';
    if (mvc.view &&  mvc.controller){
        
        mvc.path = '{symbol}';               
        load_highcharts(function(){
            $.ajax({
                url:"/extensions/entities/views/"+mvc.path+".html",
                cache:false,
                success: function(d){ $(mvc.target).html(d); },
                error:   function(e){ if (config.debug) console.log(e);    }        
            });              
        });
        
    }else{
        
        if (mvc.view && !mvc.controller) mvc.path = '{market}';    
        if (mvc.view === 'find-by')      mvc.path = 'find-by';

        $.ajax({
            url:"/extensions/entities/views/"+mvc.path+".html",
            cache:false,
            success: function(d){ $(mvc.target).html(d); },
            error:   function(e){ if (config.debug) console.log(e);    }        
        });
        
    } 

    


