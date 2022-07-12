<?php 
session_start();

/*
 * NOTE:
 * 
 * This is internal connector to api.stocktok.app
 * That in opposition to other api consumers can work in unlimited mode and in
 * different limit policy.
 * 
 * Such kind of goal can be achived in model
 * /api.php -> api.stocktok.app
 * 
 * - CORS should secure unprevented consumers trying to connect to API via api.php from web
 * - Closed connection (/api.php instead of http) keeps communication internally which
 *   means that only /. scripts can launch api.php (htaccess & privilages of files)
 * - And lastly /api.php can control SESSIONS. Calls directly to api.stocktok.app
 *   because session is kept on on subdomain level
 *   Doing this on domain level starts to be a problem.
 *   session.cookie_domain is deprecated since php 5.4 (?))
 * 
 */



try{
    
    $api_mode = 'session';
    include('../api/index.php');
    
}catch(error $e){
    die($e);
}