
var uuid;


function check_fb() {
    var ua = navigator.userAgent || navigator.vendor || window.opera;

    var isFB = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
    if (isFB && localStorage.getItem('note_fb')===null)
        window.location.href = "/note_fb.html?ver=1"; 

    return isFB;
}         


function recalculate_css(){
    //alert(document.height());
}
$(window).on('resize',function(){
    recalculate_css();
    var banner_height = $('.my-account .banner').height();
    if (banner_height>180){
        $('.my-account .banner-icon').show();
        $('.my-account .banner h1').show();            
    }else{
        $('.my-account .banner-icon').hide();
        $('.my-account .banner h1').hide();
    }
    //$('.logo').append('height: '+banner_height);
});

$(document).on('click', '.show-password', function(){
    if ($(this).hasClass('active')) $('#password').attr('type','password');
        else $('#password').attr('type','text');
    $(this).toggleClass('active');
});
$(document).on('click', '[data-action="step2"]', function(){   
    
    var username=$('#username').val();
    if (username.length>0){

        if ($('.registration-form').hasClass('step-2')){
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
                    success: function(response){
                        
                        console.log(response);
                        
                        if (response.success){
                            
                            sessionStorage.setItem('username', response.username);
                            sessionStorage.setItem('persistence', response.persistence);                            
                            location.href='/';
                            return;
                            
                        }
                        
                        if (response.err===1){ // Wrong password, @TODO: forgot password
                            
                            $('.registration-form').addClass('step-2');
                            $('.info-inner').removeClass('active');
                            $('.wrong-password').addClass('active');
                            $('#password').delay(100).focus();
                            
                        }else{ // Wrong password and login is not email
                            
                            $('.registration-form').addClass('step-2');
                            $('.info-inner').removeClass('active');
                            $('.wrong-password-noemail').addClass('active');                                
                            $('#password').delay(100).focus();
                            
                        }

                    },
                    error: function(response){
                    }
                });
            }else{
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
                    
                    $('.registration-form').addClass('step-2');
                    $('.info-inner').removeClass('active');

                    if (response.success) $('.login-info').addClass('active');
                    else $('.registration-info').addClass('active');
                    
                    $('#password').focus();

                }
            });     
        }
    } 
});

var tc_opened = true;
$(document).on('click', '.tc', function(){
    if (tc_opened){
        $('.tc-content').addClass('active');
        $('.tc').addClass('active'); 
        $('.tc .show').removeClass('active');
        $('.tc .close').addClass('active');
        $('.my-account .logo img').addClass('left');
        tc_opened = false;
        return;
    }else{
        $('.tc-content').removeClass('active'); 
        $('.tc').removeClass('active'); 
        $('.tc .show').addClass('active');
        $('.tc .close').removeClass('active');
        $('.my-account .logo img').removeClass('left');            
        tc_opened = true;
        return;
    }
});
$(document).on('keyup','.registration-form #username',function(){
    if ($('.registration-form').hasClass('step-2')){
        $('.registration-form').removeClass('step-2');
        $('.info-inner').removeClass('active');
        $('.info-inner.init').addClass('active');
        $('.registration-form #password').val('');
    }
});

