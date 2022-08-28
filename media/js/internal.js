$(document).ready(function(){ 
    $.getScript('/media/js/internal/helpers'+(config.minify===1 ? '.min' : '')+'.js?version='+config.version);               
    $.getScript('/media/js/internal/ui'+(config.minify===1 ? '.min' : '')+'.js?version='+config.version);  
});
