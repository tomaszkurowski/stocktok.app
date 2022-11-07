$(document).off('click', '[data-action="add-note"]');
$(document).on('click','[data-action="add-note"]',function(){  
    
    if (!me){
        $('body').addClass('with-popup').prepend('<div class="popup-info"><div class="popup-info-body"><div class="icon icon-key1"></div><div class="title">New note</div><div class="description">Feature only for logged users</div></div></div>');                            
        return;
    }    

    $('body').toggleClass('with-popup');                            
    if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

    button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
    $.ajax({
        url:"/extensions/entities/views/popups/notes.html",
        cache:false,
        success: function(data){ $("#popup").html(data); },
        error: function(e){ if (config.debug) console.log(e); }
    });
});
function notesReload(){
    if (me){
        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/me/notes',
                symbol: stock.symbol,
                market: stock.market
            },
            type: 'GET',
            dataType: 'JSON',
            cache: false,
            success: function(response){
                $('.my-notes .tab-content .notes').html('');
                
                if (!response.notes.length){
                    $('.my-notes .counter').text('0').removeClass('active');
                    return;
                }
                
                $('.my-notes .counter').text(response.notes.length).addClass('active');
                
                $.each(response.notes, function(i,note){                        
                    let el = $('<div class="note"></div>');  
                    $(el).append('<div class="date label">'+format_datetime(note.created_at)+'</div>');
                    $(el).append('<div class="body">'+note.body+'</div>');
                    $(el).prepend('<div class="actions"></div>');
                    $(el).find('.actions').append('<div class="icon-btn icon-settings" data-action="note-edit"></div>');
                    $(el).find('.actions').append('<div class="icon-btn icon-bin" data-action="note-delete"></div>');
                    
                    $(el).find('[data-action="note-delete"]').bind('click',function(){
                        $.ajax({
                            url: config.api_url,
                            data: { 
                                endpoint: '/me/notes',
                                id:note.id
                            },
                            type: 'DELETE',
                            dataType: 'JSON',
                            cache: false,
                            success: function(response){                  
                                notesReload();
                            }
                        }); 
                    });
                    $(el).find('[data-action="note-edit"]').bind('click',function(){
                        $('body').toggleClass('with-popup');                            
                        if (!$('body').hasClass('with-popup')){ $('#popup').html(''); $('.popup-btn').remove(); }

                        button({ class: 'icon-btn popup-btn icon-clear' }, function(){ $('#popup').html(''); $('.popup-btn').remove(); $('body').removeClass('with-popup'); });                            
                        $.ajax({
                            url:"/extensions/entities/views/popups/notes.html",
                            cache:false,
                            success: function(data){ 
                                $("#popup").html(data); 
                                $('.popup-notes #new-note').val(note.body).attr('data-id',note.id);
                            },
                            error: function(e){ if (config.debug) console.log(e); }
                        });                        
                    });                    
                    $('.my-notes .tab-content .notes').append(el);
                });
            },
            error: function(response){
                if (config.debug) console.log(response);
            }
        });
    }
}