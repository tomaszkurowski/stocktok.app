
    function load_layout(callback = null){
        
        localStorage.setItem('settings',JSON.stringify(settings));
        if (config.debug) console.log('\n','Settings:',settings,'\n\n');
        
        let css = '';
        Object.keys(settings.design).forEach(function(key){
            css += '--'+key.replace(/_/gi,'-')+': '+settings.design[key]+';'; });        
        $('#css').html('<style>html {'+css+'}</style>');
        
        if (settings.design.hand_preference === 'left') $('#app').addClass('left-handed');
        else $('#app').removeClass('left-handed');
                
        if ($('footer.initiated').length && $('nav.initiated').length && mvc.url !== '/me/login') return;        
        $.get({ url:"/extensions/cms/views/footer.html", cache:false },function(data){
            
            $("footer").html(data).addClass('initiated');
            $.get({ url:"/extensions/cms/views/nav.html", cache:false },function(data){ 
                
                $("nav").html(data).addClass('initiated'); 
                if (callback) callback();
                
            });  
        });                     
    }
    
    function reload_ui(){
        
        Object.keys(settings).forEach(function(key){
            $('[data-key="'+key+'"]').attr('data-value',settings[key]); 
         });
        
    }
    
    function load_extension(){
        
        if (mvc.url[0] === '/') 
            mvc.url = mvc.url.substring(1);
        
        mvc.model       = mvc.url.split('/')[0];
        mvc.view        = mvc.url.split('/')[1];
        mvc.controller  = mvc.url.split('/')[2];
        
        let title = config.title_prefix + (mvc.model ? ' - '+mvc.model : '') + (mvc.view ? ' - '+mvc.view : '') + (mvc.controller ? ' - '+mvc.controller : '');
        if (mvc.model === 'entities'){
            title = config.title_prefix + (mvc.view ? ' - '+mvc.view : '') + (mvc.controller ? ' - '+mvc.controller : '');
        }
        document.title = title;
        
        // ACL
        if (mvc.model !== 'me'){
            $.ajax({
                url: config.api_url,
                data: { 
                    endpoint:    '/me', 
                    username:    sessionStorage.getItem('username'), 
                    persistence: sessionStorage.getItem('persistence') 
                },
                type: 'GET',
                dataType: 'JSON',
                cache:false,
                success: function(response){
                    if (config.debug) console.log('','Me:','');
                    if (config.debug) console.log('',response);
                    
                    me = response.me;
                    
                    // Navigation update
                    if (response.me.hasOwnProperty('username')){
                        $('.nav .username').text(response.me.username);
                        $('.nav .btn-menu.me').attr('onclick',"location.href='/me/logout'").find('.info').html('Logout<br /><span class="label">Here you can logout</span>');
                        $('.nav .rank').html(response.me.public ? 'Player mode' : 'Silent mode');
                        if (me.avatar_type === 'image'){
                            $('.nav .avatar-container').html("<img src='"+me.avatar+"' class='avatar-image' alt='Avatar' />");
                        }else{
                            $('.nav .avatar-container').html('<div class="avatar avatar-user"></div>').css('color',(response.me.avatar_color ? response.me.avatar_color : 'var(--color-base-invert)'));
                        } 
                    }

                    // ACL 
                    if (response.me.hasOwnProperty('username') || 
                        mvc.model === 'entities' || 
                        mvc.model === 'players' || 
                        (mvc.model === 'cms' && mvc.view === 'dashboard')
                    ){
                        $.getScript('/extensions/'+mvc.model+'/'+mvc.model+'.js?version='+config.version).fail(function(){
                            mvc.view = '404';
                            $.getScript('/extensions/cms/cms.js?version='+config.version);
                        });                        
                    }else{
                        mvc.view = 'not_logged';
                        $.getScript('/extensions/cms/cms.js?version='+config.version);                        
                    }

                },
                error: function(e){ if (config.debug) console.log(e); }
            });       
        }else{ $.getScript('/extensions/me/me.js?version='+config.version); }     
    }
    
    function load_page(url,push_url = false){
        
        if (push_url){ window.history.pushState({}, '', url) }
        settings.editable = false;
        
        $('.footer .heading').html('');
        $('.page-views-slider').remove();
        $('#popup').html('');
        $('body').removeClass('with-popup').removeClass('no-blur').removeClass('editable').removeClass('not-swipeable');
        $('.toggleHeading').remove();
        $('.footer-bottom').removeClass('short');
        
        $('#app').removeClass('nav-active');
        
        mvc.url     = url;        
        mvc.target  = $('main');
        mvc.params  = new URLSearchParams(window.location.search);
        if (config.debug) console.log(mvc.params);
        
        load_extension();
        if (!settings.mute){
            var audio = new Audio("/media/sounds/page-1.mp3");
            
            var promise = audio.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    audio.play();
                }).catch(error => {});
            }

        }        
        //window.history.pushState({}, '', url+window.location.search);                              
    }
    
    function load_popup(url){
        
        mvc.url = url;
        mvc.target = $('.footer .popup');        
        
        init_extension();
    }
        
    function load_menu(active = true){ 
        
        if (!settings.mute){
            var audio = new Audio("/media/sounds/button-50.mp3");
            audio.play();
        }
        $('#app').toggleClass('nav-active');
    }

    function init_SW() { 

      if ('serviceWorker' in navigator) { 
        var sleepTime = 100;
        var hasSWButNotInstalled = ('serviceWorker' in navigator && navigator.serviceWorker.controller === null);  

        try {        
            $.ajax({
                url: config.api_url,
                data: { endpoint: '/api/version' },
                type: 'GET',
                dataType: 'JSON',
                cache:false,
                success: function(response){
                    if (config.debug) console.log('\n','Service-Worker & App version \n\n','  Index.html version: '+config.version,'\n','  Response version:   '+response.version,'\n\n');

                    if ('serviceWorker' in navigator){

                        var scope = config.base_url;
                        var current_version = scope + "sw.js?version=" + response.version;
                        var upgrade_needed = false;

                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            registrations.forEach(function(registration){
                                if (registration.scope===scope){
                                    if (config.debug) console.log('\n','Current app SW url: \n',current_version,'\n\n');

                                    var waiting_version = '';
                                    if (registration.waiting!==null){
                                        waiting_version = registration.waiting.scriptURL;
                                        if (config.debug) console.log(waiting_version);
                                    }

                                    if (current_version!==registration.active.scriptURL && current_version!==waiting_version){   
                                        registration.unregister();
                                        upgrade_needed = true;                                                                                                                                                     
                                    }
                                }
                            });
                            if (config.debug) console.log(registrations);
                        }).then(function(){
                            if (upgrade_needed===true){
                                $('#loader').addClass('active');
                                $('#loader > span').html('Automatic upgrade to version: '+response.version);
                                setTimeout(location.reload.bind(location), 3000);
                            }else{
                                navigator.serviceWorker.register('/sw.js?version='+response.version);
                                $('#loader').removeClass('active').addClass('hide');
                            } 
                        });                                       
                    }else{
                          navigator.serviceWorker.register('/sw.js?version='+response.version)
                          .then(function(){
                              if (config.debug) console.log("Service-worker registered");                
                              if(hasSWButNotInstalled) {
                                  if (config.debug) console.log("Has got Service-worker, but not installed");
                                  sleep(sleepTime,function(){
                                      location.reload();
                                  });
                              }else {
                                  $('#loader').addClass('hide');
                              }
                          });
                    }
              }
            });      
        } catch (e) {
            if (config.debug) console.log('ERROR: ServiceWorker registration failed'); 
            $('#loader').addClass('hide');
        }
      } else {
        document.querySelector('#loader').classList.add('hide'); 
        $('#loader').addClass('hide');
      }
    }