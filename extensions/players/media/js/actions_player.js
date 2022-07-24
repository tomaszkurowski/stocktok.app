    $(document).on('click','[data-action="observe"]',function(){

        var el      = $(this);
        var player  = $(el).parents('.box').attr('data-username');

        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/players/observed',
                player: player
            },
            type: 'POST',
            dataType: 'JSON',
            cache: false,
            success: function(response){  
                if (response.success === false){ return; }

                $('[data-username="'+player+'"] [data-action="observe"]')
                    .removeClass('icon-bookmark_outline').addClass('icon-bookmark1')
                    .attr('data-action','stop-observe');

                if (mvc.model === 'players' && mvc.view === 'observed'){
                    get_observed_players();
                }
            }
        });                

    });

    $(document).on('click','[data-action="stop-observe"]',function(){

        var el      = $(this);
        var player  = $(el).parents('.box').attr('data-username');

        $.ajax({
            url: config.api_url,
            data: { 
                endpoint: '/players/observed',
                player: player
            },
            type: 'DELETE',
            dataType: 'JSON',
            cache: false,
            success: function(response){  
                if (response.success === false){ return; }

                $('[data-username="'+player+'"] [data-action="stop-observe"]')
                    .addClass('icon-bookmark_outline').removeClass('icon-bookmark1')
                    .attr('data-action','observe');  

                if (mvc.model === 'players' && mvc.view === 'observed'){
                    get_observed_players();
                }
            }
        });                

    });

     