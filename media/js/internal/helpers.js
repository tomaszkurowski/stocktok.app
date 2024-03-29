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
                if (config.debug) console.log(response);
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
    function format_datetime(datetime,options = {}){        
        if (!options.format) options.format = 'L, LT';
        return moment.utc(datetime).local().format(options.format);
    }
    function format_date(timestamp){
        var date = new Date(timestamp);
        return (date.getDate() > 9 ? date.getDate() : '0'+date.getDate()) +
               "." + ((date.getMonth()+1) > 9 ? (date.getMonth()+1) : '0'+(date.getMonth()+1)) +
               "." + date.getFullYear(); 
    }

    var currencies = {};
    function get_currencies(callback=null){
        $.ajax({
            url: config.api_url,
            data: { endpoint: '/currencies' },
            type: 'GET',
            dataType: 'JSON',
            cache:false,
            success: function(response){

                $.each(response.items, function(i, item){ 
                    currencies[i] = parseFloat(item);
                });
                
                if (config.debug) console.log('Currency Rates',currencies); 
                if (callback) callback();
                
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
    }
    
    function get_market_currency(market){
        switch(market){
            case 'gpw':
            case 'newconnect': return 'pln';
            default: return 'usd';
        }
    }
    
    
    function iosDatesFix(date){
        
        var date_raw = date;
        var t = date_raw.split(/[- :]/);
        var dt = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
        var d = new Date(dt);

        return (d.getDate()>9 ? d.getDate() : "0" + d.getDate())+ '.' +((d.getMonth()+1)>9 ? (d.getMonth()+1) : ("0"+(d.getMonth()+1)))+', '+(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();                                                

    }
    
    // https://stackoverflow.com/questions/1726630/formatting-a-number-with-exactly-two-decimals-in-javascript
    function round(value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
          return Math.round(value);

        value = +value;
        exp = +exp;

        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
          return NaN;

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    }    
    
    
    function updateSettings(key,value){

        if (settings.hasOwnProperty(key)){
            settings[key] = value;
            localStorage.setItem('settings',JSON.stringify(settings));
        }else{
            if (config.debug) console.log('Warning, no default setting in index.html for: '+key);
        }

    };

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
    
    function updateQueryParams(params,full_url = false) {
        var url_ending='';
      
        if (Object.keys(params).length>0) url_ending = '?';
        Object.keys(params).forEach(function(index,value){            
            if (url_ending !== '?'){ url_ending += '&'; }
            url_ending += '' + index + '=' + params[index];            
        });
        
        if (full_url){
            return window.location.pathname+url_ending;
        }else{
            return url_ending;
        }
      
    }
    
    var filters = [];
    function updateFilter(filter,push_url = false,with_reset = false){
                
        
        if (with_reset){
            let params  = getQueryParams(); 
            filters = [];            
            $.each(params,function(i,p){              
                let filter = i.split("-");
                if (filter[0] === 'sort'){
                    filters.push({
                        code:  filter[0],
                        type:  filter[1],                
                        value: filter[2]                
                    });
                }
            });
        }else{
            filters = getFilters();
        }       

        if (filters.length === 0){
            filters.push({
            code: filter.code,
            value: filter.value ? filter.value : null,
            type: filter.type ? filter.type : 'is'
            });
            if (push_url){ window.history.pushState({}, '', getFiltersUrl(filters,false)) }
            return;
        }
        
        var newFilter = true;
        $.each(filters,function(index,old_filter){           
            if (filter.code === old_filter.code){
                old_filter.value = filter.value;
                old_filter.type = filter.type ? filter.type : old_filter.type;
                newFilter = false;
            }       
        });        
        if (newFilter){ 
            filters.push({
            code: filter.code,
            value: filter.value ? filter.value : null,
            type: filter.type ? filter.type : 'is'
            });        
        }        
        
        if (push_url){ window.history.pushState({}, '', getFiltersUrl(filters,false)); }
    }
    function removeFilter(filter,push_url = false){
        $.each(filters,function(index,old_filter){           
            if (filter.code === old_filter.code){
                delete filters[index];
            }       
        }); 
        if (push_url){ window.history.pushState({}, '', getFiltersUrl(filters,false)); }
    }
    function getFiltersUrl(filters,full_url = false){
                
        console.log('before url',filters);
        var url_ending='';
        if (filters.length>0){ 
            url_ending = '?';
            $.each(filters,function(index,filter){
                if (!filter) return;
                if (url_ending !== '?'){ url_ending += '&'; }
                url_ending += '' + filter.code + (filter.type ? '-'+ filter.type : '') + (filter.value ? '-'+ filter.value : '');            
            });
        }

        if (full_url){
            return window.location.pathname+url_ending;
        }else{
            return url_ending;
        }        
    } 
    
    function getFilters(){
        let params  = getQueryParams(); 
        filters = [];
        
        $.each(params,function(i,p){              
            let filter = i.split("-");
            filters.push({
                code:  filter[0],
                type:  filter[1],                
                value: filter[2]                
            });
        });
        
        return filters;
    }
    function getFilter(code){
        let params  = getQueryParams(); 
        var filterJSON  = {};
        $.each(params,function(i,p){              
            let filter = i.split("-");
            if (filter[0] === code){ filterJSON = { code: filter[0], type: filter[1], value: filter[2] }; }
        });        
        return filterJSON;
    } 
    
    var highcharts;
    function load_highcharts(callback){   
        if (highcharts){
            if (callback) callback();            
        }else{
            highcharts = true;
            $.getScript('/media/js/external/highcharts/highcharts'+(config.minify===1 ? '.min' : '')+'.js',function(){
                $.getScript('/media/js/external/highcharts/highcharts-accessibility'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-data'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-indicators'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-annotations'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-fullscreen'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-tools'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/highcharts/highcharts-dragpanes'+(config.minify===1 ? '.min' : '')+'.js');
                if (callback) callback();
            });
        }
    } 
    
    var apexcharts;
    function load_apexcharts(callback){      
        if (apexcharts){
            if (callback) callback();            
        }else{
            apexcharts = true;
            $.getScript('/media/js/external/apexchart'+(config.minify===1 ? '.min' : '')+'.js',function(){
                if (callback) callback();
            }); 
        }
    }
    
    var datatables = false;
    function load_datatables(callback){
        if (datatables === true){
            if (callback) callback();            
        }else{
            datatables = true;
            $.getScript('/media/js/external/dataTables/dataTables'+(config.minify===1 ? '.min' : '')+'.js',function(){
                $.getScript('/media/js/external/dataTables/dataTables-responsive'+(config.minify===1 ? '.min' : '')+'.js');
                $.getScript('/media/js/external/dataTables/dataTables-colReorder'+(config.minify===1 ? '.min' : '')+'.js');
                if (callback) callback();
            }); 
        } 
    }
    
    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            /* next line works with strings and numbers, 
             * and you may want to customize it to your needs
             */
            var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    }
    
    function sortJsonByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }