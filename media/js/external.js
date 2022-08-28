$(document).ready(function(){    
    $.getScript('/media/js/external/slick.min.js?version=1.8.1');
    $.getScript('/media/js/external/jquery-ui'+(config.minify===1 ? '.min' : '')+'.js?version=1.13.2',function(){
        $.getScript('/media/js/external/jquery.ui.touch-punch.min.js?version=0.2.3');        
    });    
    $.getScript('/media/js/external/moment.min.js?version=2.29.4'); 
    $.getScript('https://unpkg.com/dayjs@1.8.21/dayjs.min.js');               
});