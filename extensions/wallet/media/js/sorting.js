function generate_sort_placeholders(){

    var placeholder;  
    var it=1;

    var el_width;
    var el_height;

    $('.sort-placeholder').remove();            
    $('.leafs .leaf:not(.dragging)').each(function(index,el){   

        if (!$(el).hasClass('last')){
            el_width=$(el).width();
            el_height=$(el).height();
        }
        placeholder = $('<div/>',{
            "class":    'sort-placeholder drag-container',
            "width":    el_width,
            "height":   el_height                    
        }).css("left",$(el).offset().left+"px").css("top",($(el).offset().top+$('.page').scrollTop())+"px");
        $(el).before(placeholder);
        
        //$(el).css('left',$(el).offset().left+'px').css('top',$(el).offset().top+'px').css('position','absolute');

    }).promise().done(function(){
        
        var targets = document.querySelectorAll('.drag-container');
        [].forEach.call(targets, function(target) {
          addTargetEvents(target);
        });                 
    });
}

function dragStart(e) {
    if (config.debug) console.log('Drag Start'); 
    $(this).addClass('dragging');
    startLocation = e;
    dragging = true;
    blocked = false;
    clicked = true;         
};

function dragEnter(e) {}
function dragLeave(e) {}

function dragOver(e)  { 
    currentLocation = e;
    if (currentLocation.clientX!==startLocation.clientX || currentLocation.clientY!==startLocation.clientY){
        clearTimeout(dragging_timeout);
        clicked = false;
    }

    if  (!dragging) return;
    if  (blocked)   return;

    e.preventDefault();            
    var targets = document.querySelectorAll('.leafs .leaf:not(.dragging), .sort-placeholder');

    [].forEach.call(targets, function(target) {
        var box2 = target.getBoundingClientRect(),
            x2 = box2.left,
            y2 = box2.top,
            h2 = target.offsetHeight,
            w2 = target.offsetWidth,
            b2 = y2 + h2,
            r2 = x2 + w2;               
        if (currentLocation.clientX>x2 && currentLocation.clientY<b2 && currentLocation.clientY>y2 && currentLocation.clientX<r2){
           if ($('.resonible').length && $(target).hasClass('resonible')){
               
           }
           
            if (!$(target).hasClass('sort-placeholder')){
               
                $('.sort-placeholder').remove();
                placeholder = $('<div/>',{
                    "class":    'sort-placeholder drag-container active',
                    "width":    ($(target).width()+30)+'px',
                    "height":   ($(target).height()+30)+'px'                    
                }).css("left",$(target).offset().left+"px").css("top",($(target).offset().top+$('.page').scrollTop())+"px");
                
                if ($(target).hasClass('resonible')){
                    $(target).removeClass('resonible').before(placeholder);
                }else{
                    $(target).addClass('resonible').after(placeholder);   
                }
            }
            $('.leaf.dragging').show();
            
        }else{
            $('.leaf.dragging').hide();
        }
    });



    if (currentLocation.clientY > window.innerHeight || currentLocation.clientY < 0 ) {
        if (x === 1) {
              x = 0;
              pageScroll(currentLocation.clientY, h);
        }
    } else {
        clearTimeout(scrollDelay);
        x = 1;
    }
}
function dragDrop(e)  {}
function dragEnd(e) {
    if (config.debug) console.log('Drag end');
    dragging = false;
    blocked = true;
    clicked = false;
    
    currentLocation = e;
    e.preventDefault();            
    var targets = document.querySelectorAll('.leafs .leaf:not(.dragging), .sort-placeholder');
    [].forEach.call(targets, function(target) {
        var box2 = target.getBoundingClientRect(),
            x2 = box2.left,
            y2 = box2.top,
            h2 = target.offsetHeight,
            w2 = target.offsetWidth,
            b2 = y2 + h2,
            r2 = x2 + w2;               
        if (currentLocation.clientX>x2 && currentLocation.clientY<b2 && currentLocation.clientY>y2 && currentLocation.clientX<r2){           
            if ($(target).hasClass('sort-placeholder')){               
                $(target).replaceWith($('.leaf.dragging'));
                if (mvc.model === 'wallet' && mvc.view !== 'observed'){
                    mystocks_sort();
                }
                if (mvc.model === 'wallet' && mvc.view === 'observed'){
                    observed_sort();
                }                
            }            
        }
    });    
    
    $('.leaf.dragging').show().removeClass('dragging');
    $('.sort-placeholder').remove();
}

function init_sorting(){
    
    if (config.debug) console.log('Init Sorting');
    var targets = document.querySelectorAll('.drag-item');
    [].forEach.call(targets, function(target) {
      addTargetEvents(target);
    });

    var listItems = document.querySelectorAll('.drag-item');
    [].forEach.call(listItems, function(item) {
      addEventsDragAndDrop(item);
    });
}

var dragging = false;
var blocked  = false;
var dragging_timeout;
var startLocation;
var currentLocation;
var clicked = false;
var swiped = false;

function touchStart(e) {
    
    if (config.debug) console.log('Touch Start');
    clicked = true;

    if (blocked) return;
    blocked = true;

    var that = this;
    dragging = true;

    currentLocation = e.targetTouches[0];
    startLocation = currentLocation;

    dragging_timeout = setTimeout(function(){          
        blocked = false;
        if (!dragging) return;   

        lastMove = e;
        touchEl = this;

        //generate_sort_placeholders();  
        placeholder = $('<div/>',{
            "class":    'sort-placeholder drag-container active',
            "width":    ($(that).width()+30)+'px',
            "height":   ($(that).height()+30)+'px'                    
        });
        $(that).before(placeholder);   

        $(that).addClass('dragging');

        var w = that.offsetWidth;
        var h = that.offsetHeight;

        that.style.position = 'fixed';
        that.style.left = currentLocation.clientX - w/2 + 'px';
        that.style.top = currentLocation.clientY - h/2 + 'px';

        var targets = document.querySelectorAll('.leafs .leaf');

        [].forEach.call(targets, function(target) {
            var box2 = target.getBoundingClientRect(),
                x2 = box2.left,
                y2 = box2.top,
                h2 = target.offsetHeight,
                w2 = target.offsetWidth,
                b2 = y2 + h2,
                r2 = x2 + w2;               

            if (currentLocation.clientX>x2 && currentLocation.clientY<b2 && currentLocation.clientY>y2 && currentLocation.clientX<r2){                
                $('body').addClass('can-drop');
            }else{
                $('body').removeClass('can-drop');
            }
        }); 
    },200);
                         
}

var scrollDelay = 0;
var scrollDirection = 1;

function pageScroll(a, b) {
    window.scrollBy(0,scrollDirection); // horizontal and vertical scroll increments
    scrollDelay = setTimeout(pageScroll,5); // scrolls every 100 milliseconds

    if (a > window.innerHeight - b) { scrollDirection = 1; }
    if (a < 0 + b) { scrollDirection = -1*scrollDirection; }
}

var x = 1;        
function touchMove(e) {

    currentLocation = e.targetTouches[0];
    if (currentLocation.clientX!==startLocation.clientX || currentLocation.clientY!==startLocation.clientY){
        clearTimeout(dragging_timeout);
        clicked = false;
    }

    if  (!dragging) return;
    if  (blocked)   return;

    e.preventDefault();            
    lastMove = e;
    touchEl = this;

    var w = this.offsetWidth;
    var h = this.offsetHeight;

    this.style.position = 'fixed';
    this.style.left = currentLocation.clientX - w/2 + 'px';
    this.style.top = currentLocation.clientY - h/2 + 'px';

    var it=1;
    var box1 = this.getBoundingClientRect(),
        x1 = box1.left,
        y1 = box1.top,
        h1 = this.offsetHeight,
        w1 = this.offsetWidth,
        b1 = y1 + h1,
        r1 = x1 + w1;

    var targets = document.querySelectorAll('.leafs .leaf:not(.dragging), .sort-placeholder');

    [].forEach.call(targets, function(target) {
        var box2 = target.getBoundingClientRect(),
            x2 = box2.left,
            y2 = box2.top,
            h2 = target.offsetHeight,
            w2 = target.offsetWidth,
            b2 = y2 + h2,
            r2 = x2 + w2;               
        if (currentLocation.clientX>x2 && currentLocation.clientY<b2 && currentLocation.clientY>y2 && currentLocation.clientX<r2){
           if ($('.resonible').length && $(target).hasClass('resonible')){
               
           }
           
            if (!$(target).hasClass('sort-placeholder')){
               
                $('.sort-placeholder').remove();
                placeholder = $('<div/>',{
                    "class":    'sort-placeholder drag-container active',
                    "width":    ($(target).width()+30)+'px',
                    "height":   ($(target).height()+30)+'px'                    
                }).css("left",$(target).offset().left+"px").css("top",($(target).offset().top+$('.page').scrollTop())+"px");
                
                if ($(target).hasClass('resonible')){
                    $(target).removeClass('resonible').before(placeholder);
                }else{
                    $(target).addClass('resonible').after(placeholder);   
                }
            }
            
        }else{
            //$('body').removeClass('can-drop');
        }
    });



    if (currentLocation.clientY > window.innerHeight || currentLocation.clientY < 0 ) {
        if (x === 1) {
              x = 0;
              pageScroll(currentLocation.clientY, h);
        }
    } else {
        clearTimeout(scrollDelay);
        x = 1;
    }
}

function touchEnd(e) {            
  
    clearTimeout(dragging_timeout);

    if (dragging && !blocked){
        var box1 = this.getBoundingClientRect(),
            x1 = box1.left,
            y1 = box1.top,
            h1 = this.offsetHeight,
            w1 = this.offsetWidth,
            b1 = y1 + h1,
            r1 = x1 + w1;

        var targets = document.querySelectorAll('.leafs .leaf');
        [].forEach.call(targets, function(target) {
            var box2 = target.getBoundingClientRect(),
                x2 = box2.left,
                y2 = box2.top,
                h2 = target.offsetHeight,
                w2 = target.offsetWidth,
                b2 = y2 + h2,
                r2 = x2 + w2;

            if (currentLocation.clientX>x2 && currentLocation.clientY<b2 && currentLocation.clientY>y2 && currentLocation.clientX<r2){                   
                $('body').removeClass('in-dragging').removeClass('can-drop');
                $('.drag-container.active').after(touchEl);
                $('.drag-container').removeClass('active');
                $('.dragging').removeClass('dragging').css({ 'position':'initial','left':0,'top':0 });
                $('.lock').removeClass('lock');
                
                
                if (mvc.model === 'wallet' && mvc.view !== 'observed'){
                    mystocks_sort();
                }
                if (mvc.model === 'wallet' && mvc.view === 'observed'){
                    observed_sort();
                }
                              
            }                               
        });  

        dragging  = false;
        blocked   = false;

        $('.dragging').removeClass('dragging').removeClass('can-drop');
        $('.lock').removeClass('lock');
        $('body').removeClass('in-dragging');

        this.removeAttribute('style');
        this.classList.remove('drag-item--touchmove');
        $(this).removeClass('dragging');
        $('.drag-container').removeClass('active');        
        
        
        
    }

    dragging  = false;
    blocked   = false;

    $('.dragging').removeClass('dragging');

    this.removeAttribute('style');
    this.classList.remove('drag-item--touchmove');
    $(this).removeClass('dragging');
    $('.drag-container').removeClass('active');

    clearTimeout(scrollDelay);
    x = 1;
}

function addEventsDragAndDrop(el) {
    el.addEventListener('dragstart', dragStart, false);
    el.addEventListener('dragend', dragEnd, false);
    el.addEventListener('touchstart', touchStart, false);
    el.addEventListener('touchmove', touchMove, false);
    el.addEventListener('touchend', touchEnd, false);
}

function addTargetEvents(target) {
    target.addEventListener('dragover', dragOver, false);
    target.addEventListener('dragenter', dragEnter, false);
    target.addEventListener('dragleave', dragLeave, false);
    target.addEventListener('dragdrop', dragDrop, false);
}