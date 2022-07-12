
    function switcher(options, callback){
        
        if (!options.target) options.target = '.heading';
        
        let switcher = $('<div class="switcher"></div>')
            .append('<span class="icon-btn'+(options.class ? ' '+options.class : '')+'"></span>')
            .attr('data-key',options.key)
            .attr('data-value',options.value)
            .bind('click',function(){
                        
                $(this).attr('data-value',$(this).attr('data-value') === 'true' ? 'false' : 'true');
                settings[options.key] = $(this).attr('data-value');

                localStorage.setItem('settings',JSON.stringify(settings));
        
                if (callback) callback(switcher);                
            });                    

            $(options.target).prepend(switcher);        
            if (callback) callback(switcher);
        
    }
    
    function button(options,callback){

        if (!options.target) options.target = '.heading';
        
        let button = $('<div class="'+(options.class ? ' '+options.class : '')+'"></div>')
            .bind('click',function(){ 
                if (callback) callback(button); 
        }); 
        $(options.target).prepend(button); 
        
    }
    
    function changer(options,callback){
        
        if (!options.target) options.target = '.inline-actions .inline';
        
        let changer = $('<div class="changer-v2"></div>')
            .append('<label for="'+options.key+'">'+options.title+':</label>')
            .append('<select data-key="'+options.key+'"></select>')
            .bind('change',function(){
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
                    console.log(val);
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
            console.log('scrolling');
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
        console.log('scrolled-down: '+($(window).scrollTop()));
        if ($(window).scrollTop() + $(window).height() === $(document).height()) {
                return true;
        }else return false;
   }
   function scrolled_up(){
        console.log('scrolled-up: '+($(window).scrollTop()));
        if ($(window).scrollTop()===0) {
                return true;
        }else return false;
   }   