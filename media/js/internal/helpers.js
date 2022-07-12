    // shows 1000 as 1,000.00
    function numberWithCommas(x) { 
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Count up number in element
    function count(el){ 
        el.each(function () {
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
            }, {
                duration: 200,
                easing: 'swing',
                step: function (now) {
                    $(this).text(numberWithCommas(now.toFixed(3).slice(0,-1)));
                }
            });
        });
    }

    function format_percentage(x){
        return x.toFixed(2);
    }
    function format_price(x,digits=null){

        if (x==null){ return; }

        var integer = x.toString().split('.');    
        var number_of_digits = integer[0].length;

        if (number_of_digits>9) return numberWithCommas((integer[0]/1000000000).toFixed(2))+' mld';
        if (number_of_digits>6) return numberWithCommas((integer[0]/1000000).toFixed(2))+' mln';

        if (digits){
            return parseFloat(x).toFixed(digits);
        }else{
            return parseFloat(x);
        }

    }

    $(document).bind("mobileinit", function(){
        $.mobile.page.prototype.options.domCache = false;
    });

    // SWIPE UP/DOWN
    var supportTouch = $.support.touch,
            scrollEvent = "touchmove scroll",
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                            time: (new Date).getTime(),
                            coords: [ data.pageX, data.pageY ],
                            origin: $(event.target)
                        },
                        stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        //event.preventDefault();
                    }
                }
                $this
                        .bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);

                    // Swiping up/down <120, vertical ~25
                    if (start && stop) {
                        if (stop.time - start.time < 130 &&
                                Math.abs(start.coords[0] - stop.coords[0]) < 30 &&
                                Math.abs(start.coords[1] - stop.coords[1]) < 130) {
                            start.origin
                                    .trigger("swipeupdown")
                                    .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
    $.each({
        swipedown: "swipeupdown",
        swipeup: "swipeupdown"
    }, function(event, sourceEvent){
        $.event.special[event] = {
            setup: function(){
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

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
    function about_checkVersion(){
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/api/version' },
            type: 'GET',
            dataType: 'JSON',
            cache:false,
            success: function(response){
                $('.version').text(response.version);
                $('.version_update').text(response.updated_at);
            },
            error: function(response){
                console.log(response);
            }
        });
    }

    function getMaxFromJson(arr, prop) {
        var max;
        for (var i=0 ; i<arr.length ; i++) {
            if (max == null || parseFloat(arr[i][prop]) > parseFloat(max[prop]))
                max = arr[i];
        }
        return max;
    }
    function getMinFromJson(arr, prop) {
        var min;
        for (var i=0 ; i<arr.length ; i++) {
            if (min == null || parseFloat(arr[i][prop]) < parseFloat(min[prop]))
                min = arr[i];
        }
        return min;
    }
    function getPositionOfFirstToday(arr) {

        var cday;
        var ctime;
        for (var i=0 ; i<arr.length ; i++) {

            cday = arr[i]['x'];
            ctime = cday.slice(0,-3).substring(11);
            if (ctime === '12:00') return i;


        }
    }
    function capitalize(str) {
        const lower = str.toLowerCase();
        return str.charAt(0).toUpperCase() + lower.slice(1);
    }
    function format_datetime(timestamp){
        var date = new Date(timestamp);
        return (date.getDate() > 9 ? date.getDate() : '0'+date.getDate()) +
               "." + ((date.getMonth()+1) > 9 ? (date.getMonth()+1) : '0'+(date.getMonth()+1)) + ", "+
               " " + (date.getHours() > 9 ? date.getHours() : '0'+date.getHours()) +
               ":" + (date.getMinutes() > 9 ? date.getMinutes() : '0'+date.getMinutes()) +
               ":" + (date.getSeconds() > 9 ? date.getSeconds() : '0'+date.getSeconds());
    }
    function format_date(timestamp){
        var date = new Date(timestamp);
        return (date.getDate() > 9 ? date.getDate() : '0'+date.getDate()) +
               "." + ((date.getMonth()+1) > 9 ? (date.getMonth()+1) : '0'+(date.getMonth()+1)) +
               "." + date.getFullYear(); 
    }


    function get_currencies(){
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/currencies' },
            type: 'GET',
            dataType: 'JSON',
            cache:false,
            success: function(response){

                currencies = response.items;              
                if (config.debug) console.log('\n','Currency Rates:',response,'\n\n');
            },
            error: function(response){
                console.log(response);
            }
        });
    }
    
    
    function iosDatesFix(date){
        
        var date_raw = date;
        var t = date_raw.split(/[- :]/);
        var dt = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
        var d = new Date(dt);

        return (d.getDate()>9 ? d.getDate() : "0" + d.getDate())+ '.' +((d.getMonth()+1)>9 ? (d.getMonth()+1) : ("0"+(d.getMonth()+1)))+', '+(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();                                                

    }
    
    
    
    function updateSettings(key,value){

        if (settings.hasOwnProperty(key)){
            settings[key] = value;
            localStorage.setItem('settings',JSON.stringify(settings));
        }else{
            if (config.debug) console.log('Warning, no default setting in index.html for: '+key);
        }

    };



    $(document).on('click', '.tab-header', function(){    
        $(this).parent('.tab-container').toggleClass('active');
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
    });
    
    
    // WIDGETS
    $(document).on('click','.widget .actions .icon-btn',function(){
        $(this).toggleClass('active');
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
    });
    $(document).on('click','.widget .actions .btn-edit',function(){
        $(this).parents('.widget').toggleClass('editable');

        if ($(this).parents('.widget').hasClass('editable')){
            $(this).parents('.widget').removeClass('collapsed');
        }
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
    });
    $(document).on('click','.widget .actions .btn-delete',function(){
        var id = $(this).parents('.widget').attr('data-id');
        var type = $(this).parents('.widget').attr('data-type');

        var widgets = JSON.parse(localStorage.getItem('widgets'));


        if (widgets[type][id]) { delete widgets[type][id]; }

        localStorage.setItem('widgets',JSON.stringify(widgets));

        $(this).parents('.widget').remove();
        if ($('.slick-initialized')){ $('.slick-initialized').slick('setPosition'); }
    });

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

    });
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

    }); 


    // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
    // using ES5   (200 characters)
    var qd = {};
    if (location.search) location.search.substr(1).split("&").forEach(function(item) {var s = item.split("="), k = s[0], v = s[1] && decodeURIComponent(s[1]); (qd[k] = qd[k] || []).push(v)});

    // using ES6   (23 characters cooler)
    var qd = {};
    if (location.search) location.search.substr(1).split`&`.forEach(item => {let [k,v] = item.split`=`; v = v && decodeURIComponent(v); (qd[k] = qd[k] || []).push(v)});

    // as a function with reduce
    function getQueryParams() {
      return (location.search ? location.search.substr(1).split`&`.reduce((qd, item) => {let [k,v] = item.split`=`; v = v && decodeURIComponent(v); (qd[k] = qd[k] || []).push(v); return qd}, {}) : {});
    }
    
    function getFiltersParams(){
        let params  = getQueryParams();
        let filters = [];       
        
        // Filters
        Object.keys(params).forEach(function(index,value){            
            if (params[index][0] !== 'all'){
                filters.push({
                    code: index,
                    value: params[index][0],
                    type: 'LIKE'
                });
            }
        });
        
        return filters;
    }
    