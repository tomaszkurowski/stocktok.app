    
    mvc.path = 'entities';
    if (mvc.view &&  mvc.controller){
        
        mvc.path = '{symbol}';               
            load_apexcharts(function(){
            $.ajax({
                url:"/extensions/entities/views/"+mvc.path+".html",
                cache:false,
                success: function(d){ 
                    $(mvc.target).html(d);
                    window.scrollTo(0,0); 
                    
                    $.getScript('/extensions/market/media/js/search'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version); 

                    $.getScript('/extensions/entities/media/js/entity'+(config.minify === 1 ? '' : '')+'.js?version='+config.version);                         
                    $.getScript('/extensions/entities/media/js/notes'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version);
                    $.getScript('/extensions/entities/media/js/advanced-charting'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version);

                    $.getScript('/extensions/wallet/media/js/actions_item'+(config.minify === 1 ? '.min' : '')+'.js?version='+config.version);
                },
                error:   function(e){ if (config.debug) console.log(e);    }        
            });              
            });
        
    } 

    


