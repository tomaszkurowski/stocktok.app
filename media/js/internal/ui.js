    jQuery.event.special.touchstart = {
        setup: function( _, ns, handle ) {
            this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
        }
    };
    jQuery.event.special.touchmove = {
        setup: function( _, ns, handle ) {
            this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
        }
    };
    jQuery.event.special.wheel = {
        setup: function( _, ns, handle ){
            this.addEventListener("wheel", handle, { passive: true });
        }
    };
    jQuery.event.special.mousewheel = {
        setup: function( _, ns, handle ){
            this.addEventListener("mousewheel", handle, { passive: true });
        }
    };  
    function toggleHeading(){
        
        if ($('.heading > *').length>0){
            $('.heading').addClass('with-buttons');
        }else{
            $('.heading').removeClass('with-buttons');
        }
        
        $('.toggleHeading').remove();
        if ($('.heading > *').length>3 && !$('body').hasClass('with-popup')){
            
            if (settings.heading_short){
                $('.footer-bottom').addClass('short');
            }
            
            let button = $('<div class="toggleHeading"><div class="icon-navigate_next"></div></div>')
            .bind('click',function(){ 
                $(this).parents('.footer-bottom').toggleClass('short');
                //$('.heading').scrollLeft(2000);
                
                if ($('.footer-bottom').hasClass('short')){
                    settings.heading_short = 1;
                }else{
                    settings.heading_short = 0;
                }
                load_layout();
                
                if (!settings.mute){
                    var audio = new Audio("/media/sounds/button-50.mp3");
                    audio.play();
                }   
                
            }); 
            $('.footer-bottom').prepend(button);
        }
    }
    
    function switcher(options, callback){
        
        if (!options.target) options.target = '.heading';
        $('[data-class="'+options.class+'"]').remove();

        let switcher = $('<div class="switcher"></div>')
            .append('<span class="icon-btn'+(options.class ? ' '+options.class : '')+'"></span>')
            .attr('data-key',options.key)
            .attr('data-value',options.value)
            .attr('data-class',options.class)
            .bind('click',function(){
                        
                $(this).attr('data-value',$(this).attr('data-value') === 'true' ? 'false' : 'true');
                settings[options.key] = $(this).attr('data-value');

                localStorage.setItem('settings',JSON.stringify(settings));                                
                if (callback) callback(switcher);                
                if (!settings.mute){
                    var audio = new Audio("/media/sounds/button-50.mp3");
                    audio.play();
                }
            });                    

            $(options.target).prepend(switcher);        
            if (callback) callback(switcher);
            //$('.heading').scrollLeft(2000);
        
    }
    
    function button(options,callback){

        if (!options.target) options.target = '.heading';        
        $(options.target+' .'+options.class.replace(' ','.')).remove();
        
        let button = $('<div class="'+(options.class ? ' '+options.class : '')+'"></div>')
            .bind('click',function(){ 
                
                if (!settings.mute){
                    var audio = new Audio("/media/sounds/button-30.mp3");
                    audio.play();
                }
                
                if (callback) callback(button); 
        }); 
        $(options.target).prepend(button);
        //$('.heading').scrollLeft(2000);
        
        
        toggleHeading();       
    }    
    
    function changer(options,callback){
        
        if (!options.target) options.target = '.inline-actions .inline';
        $(options.target+' .changer-v2.'+options.key).remove();
        
        let changer = $('<div class="changer-v2 '+options.key+'"></div>')
            .append('<label for="'+options.key+'">'+options.title+':</label>')
            .append('<select data-key="'+options.key+'"></select>')
            .bind('change',function(){
                
                if (!settings.mute){
                    var audio = new Audio("/media/sounds/button-50.mp3");
                    audio.play();
                }
                
                if (options.click){ 
                    options.click(changer); 
                }
                
            });
    
        if (options.values){
            Object.keys(options.values).forEach(function(index,value){
                $(changer).find('select').append('<option value="'+index+'">'+options.values[index]+'</option>');
            });
        }
        
        if (settings.hasOwnProperty(options.key)){
            $(changer).find('select').val(settings[options.key]);
        }
        
        $(options.target).append(changer);
        if (options.load){ options.load(changer); }
        
    }
    
    
    
    function swipeable(){
        
        $('body').removeClass('not-swipeable');
        if (settings.swipeable === 'true') $('.slick-initialized').slick("slickSetOption","swipe",true);
        else{
            if ($('.slick-initialized').length){
                $('body').addClass('not-swipeable');
            }
            $('.slick-initialized').slick("slickSetOption","swipe",false); 
        }           
    }
    
    var swipingTimer,
    doneSwipingInterval = 250;
    function swiper(options={}){
        var max = 3;
        var it  = 0;
        
        if (max>0){
            $('<div class="page-views-slider">'+
                    '<div class="range-icons">'+                                                
                        '<div class="icon icon-line-chart active"></div>'+
                        '<div class="icon icon-info"></div>'+
                        '<div class="icon icon-finance"></div>'+
                        '<div class="icon icon-read"></div>'+
                    '</div>'+
                    '<input type="range" min="0" max="'+max+'" value="'+(options.initial ? options.initial : 0)+'"  />'+
              '</div>')
              .insertBefore('.hamburger-container');

            $('.footer-bottom .page-views-slider input').css('width',((max+1)*30)+'px').bind('input',function(){

                var val = $(this).val();
                
                if (swipingTimer) {
                    clearTimeout(swipingTimer);
                }
                swipingTimer = setTimeout(function () {
                    if (config.debug) console.log(val);
                    $('.slick-initialized').slick('slickGoTo',val);
                    $('.page-views-slider .range-icons .icon').removeClass('active');
                    $('.page-views-slider .range-icons').children('.icon').eq(val).addClass('active');
                    
                }, doneSwipingInterval);            

            });
        }else{
            $('[data-key="swipeable"]').remove(); // Nothing to swipe
        }
        
        //if (options.initial) $('.slick-initialized').slick('slickGoTo',options.initial);
    }
    
    $(document).off('click', '.range-icons .icon');
    $(document).on('click','.range-icons .icon',function(){
        
        var clicked = $(this).attr("class");
        $('.range-icons .icon').each(function(val){
            if ($(this).attr("class") === clicked){
                $('.page-views-slider input').val(val);
                $('.slick-initialized').slick('slickGoTo',val);
                $('.page-views-slider .range-icons .icon').removeClass('active');
                $('.page-views-slider .range-icons').children('.icon').eq(val).addClass('active');                
            }
        });
    });
    
    
    function editable(){
        if (settings.editable === 'true') $('body').addClass('editable');
        else $('body').removeClass('editable'); 
        
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }     
    }

    
    function smooth_scrolling(){

        var lastScrollTop = 0, delta = 15;
        $(window).scroll(function(){
            if (config.debug) console.log('scrolling');
            clearTimeout($.data(this, 'scrollTimer'));

            var nowScrollTop = $(this).scrollTop();
            if(Math.abs(lastScrollTop - nowScrollTop) >= delta){
                   if (nowScrollTop > lastScrollTop){
                        $('body').addClass('scrolling-down');
                   } else {
                       $('body').addClass('scrolling-up'); 
                   }
            lastScrollTop = nowScrollTop;
            }

            $.data(this, 'scrollTimer', setTimeout(function() {
                $('body').removeClass('scrolling-up').removeClass('scrolling-down');
            }, 150));
        });
   }

   function scrolled_down(){
        if (config.debug) console.log('scrolled-down: '+($(window).scrollTop()));
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
                return true;
        }else return false;
   }
   function scrolled_up(){
        if (config.debug) console.log('scrolled-up: '+($(window).scrollTop()));
        if ($(window).scrollTop()===0) {
                return true;
        }else return false;
   } 
   
   $(document).off('click', '.popup-info');
    $(document).on('click','.popup-info',function(){
        $('body').removeClass('with-popup');
        $('.popup-info').remove();
    });
    
    $(document).off('click', '.inner-popup .close');
    $(document).on('click','.inner-popup .close',function(){
        $(this).parents('.inner-popup').remove();
    });
    
    $(document).off('click', '.tab-header');
    $(document).on('click', '.tab-header', function(){    
        $(this).parent('.tab-container').find('.tab-content').slideToggle(300,'swing');
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
        
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-50.mp3");
            audio.play();
        }        
        
    });
    
    
    // WIDGETS
    $(document).off('click', '.widget .actions .icon-btn');
    $(document).on('click','.widget .actions .icon-btn',function(){
        $(this).toggleClass('active');
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-30.mp3");
            audio.play();
        }        
    });
    
    $(document).off('click', '.widget .actions .btn-edit');
    $(document).on('click','.widget .actions .btn-edit',function(){
        $(this).parents('.widget').toggleClass('editable');

        if ($(this).parents('.widget').hasClass('editable')){
            $(this).parents('.widget').removeClass('collapsed');
        }
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-30.mp3");
            audio.play();
        }        
    });
    
    $(document).off('click', '.widget .actions .btn-delete');
    $(document).on('click','.widget .actions .btn-delete',function(){
        var id = $(this).parents('.widget').attr('data-id');
        var type = $(this).parents('.widget').attr('data-type');

        var widgets = JSON.parse(localStorage.getItem('widgets'));


        if (widgets[type][id]) { delete widgets[type][id]; }

        localStorage.setItem('widgets',JSON.stringify(widgets));

        $(this).parents('.widget').remove();
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-30.mp3");
            audio.play();
        }        
    });

    $(document).off('click', '.widget .edit select');
    $(document).on('change','.widget .edit select', function(){ 

        var type    = $(this).parents('.widget').attr('data-type');  
        var id      = $(this).parents('.widget').attr('data-id');    

        var widget   = {};

        $(this).parents('.edit').find('select').each(function(){
            var data_id     = $(this).attr('data-id');  // 1
            var value       = $(this).val();        
            widget[data_id] = value;        
        });

        if (config.debug) console.log('Widget Config:');
        if (config.debug) console.log(widget);

        var widgets = {};
        if (localStorage.getItem('widgets') && localStorage.getItem('widgets')!==null){
            widgets = JSON.parse(localStorage.getItem('widgets'));
        }        
        if (!widgets.hasOwnProperty(type)){ widgets[type] = {}; }    
        widgets[type][id] = widget;

        localStorage.setItem('widgets',JSON.stringify(widgets));    

        widget_financial_graph(id, widget);
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-50.mp3");
            audio.play();
        }        

    });
    
    $(document).off('click', '.add-widget');
    $(document).on('click','.add-widget', function(){

        var type = $(this).attr('data-type')

        var widgets = {};
        var next_id = 0;
        if (localStorage.getItem('widgets')){
            widgets = JSON.parse(localStorage.getItem('widgets'));
            if (widgets.hasOwnProperty(type)){
                for (var id in widgets[type]) {
                   if (id>next_id) next_id=parseInt(id); 
                };
            }else{
                widgets[type] = {};
            }                
        }
        next_id++;
        widgets[type][next_id] = {};
        localStorage.setItem('widgets',JSON.stringify(widgets));

        var widget = $('.template-widget > .widget').clone();                
        $(widget).addClass('editable');
        $(widget).attr('data-id',next_id);
        $(widget).attr('data-type',type);

        $('.widgets').append($(widget));

        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-30.mp3");
            audio.play();
        }        

    });     