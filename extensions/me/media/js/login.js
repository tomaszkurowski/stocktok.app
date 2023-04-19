
var uuid;

$(document).off('click', '.show-password');
$(document).on('click', '.show-password', function(){
    if ($(this).hasClass('active')) $('#password').attr('type','password');
        else $('#password').attr('type','text');
    $(this).toggleClass('active');
});

$(document).off('click', '[data-action="step2"]');
$(document).on('click', '[data-action="step2"]', function(){   
    
    var btn = this;
    
    var username=$('#username').val();
    if (username.length>0){
        if ($(btn).attr('data-step') === "2"){
            
            var password = $('#password').val();
            if (password.length>0){
                $.ajax({
                    url: config.api_url,
                    data: { 
                        endpoint: '/me/login', 
                        username: username, 
                        password: password 
                    },
                    type: 'POST',
                    dataType: 'JSON',
                    cache:false,
                    success: function(response){
                        
                        if (config.debug) console.log(response);
                        if (response.success){
                            
                            if (settings.rememberMe === true){
                                Cookies.set('username', response.username, { expires: 365, path: '/' });
                                if (response.persistence) Cookies.set('persistence', response.persistence, { expires: 365, path: '/' });
                            }
                            sessionStorage.setItem('username', response.username);
                            if (response.persistence) sessionStorage.setItem('persistence', response.persistence);
                            
                            if (response.newUser){ 
                                location.href='/settings/intro';
                                return;
                            }
                            
                            let params = getQueryParams();
                            if (params.ref && params.ref !== '/me/login' && params.ref !== '/me/logout') location.href=params.ref[0];
                            else location.href='/';
                            return;
                            
                        }
                        
                        if (response.err===1){ // Wrong password, @TODO: forgot password
                            $('.infoNote').show().html('Sorry password doesn\'t match user. If you want to sign-up, you should try different nickname');                            
                        }else{ // Wrong password and login is not email
                            $('.infoNote').show().html('Sorry password doesn\'t match user. If you want to sign-up, you should try different nickname');                            
                        }

                    },
                    error: function(response){
                    }
                });
            }else{
                $('.password-container').show();
                $('#password').focus();
            }
        }else{                           
            $.ajax({
                url: config.api_url,
                data: { endpoint: '/me/exists', username:username },
                type: 'GET',
                dataType: 'JSON',
                cache:false,
                success: function(response){
                    
                    // response.success
                    // 0 = no such account
                    // 1 = there is such account ...
                    
                    
                    if (response.success !== 0){
                        $('.infoNote').addClass('active').show().html('There is already portfolio with this name. You can log in if its yours, or You can try different name.'); 
                    }else{
                        $('.infoNote').addClass('active').show().html('That name is available. Please set up some password to be able to log in future.'); 
                    }
                    $(btn).attr('data-step',2);                    
                    $('.password-container').show();
                    $('#password').focus();

                }
            });     
        }
    } 
});
$(document).off('keyup', '#username');
$(document).on('keyup','#username',function(){
    if ($('[data-action="step2"]').attr('data-step') === "2"){
        $('[data-action="step2"]').attr('data-step',"1");
        $('.password-container').hide();
        $('.infoNote').removeClass('active').html('Portfolio is like your virtual wallet where you can keep, manage & observe all your assets (stocks, currencies, tokens etc.)');        
    }
});