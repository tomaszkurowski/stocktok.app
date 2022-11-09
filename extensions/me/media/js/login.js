
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
                $('#password').show().focus();
            }
        }else{                           
            $.ajax({
                url: config.api_url,
                data: { endpoint: '/me/exists', username:username },
                type: 'GET',
                dataType: 'JSON',
                cache:false,
                success: function(response){
                    
                    $(btn).attr('data-step',2);                    
                    $('#password').show().focus();

                }
            });     
        }
    } 
});
$(document).off('keyup', '#username');
$(document).on('keyup','#username',function(){
    if ($('[data-action="step2"]').attr('data-step') === "2"){
        $('[data-action="step2"]').attr('data-step',"1");
        $('#password').hide();
        $('.infoNote').hide();        
    }
});