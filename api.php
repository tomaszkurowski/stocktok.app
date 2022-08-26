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

include('config.php');

function get_parameters($method){
    
    $_DELETE = [];
    if ($method === 'DELETE'){
        $url_params = explode('&',urldecode(file_get_contents("php://input")));
        foreach ($url_params as $url_param){
            $param = explode('=',$url_param);
            $_DELETE[$param[0]] = $param[1];
        }
    }
    $_PUT = [];
    if ($method === 'PUT'){
        parse_str(file_get_contents("php://input"),$_PUT);
    }
                
    $_BODY = (array) json_decode(file_get_contents("php://input"));
    $params = array_merge($_DELETE,$_GET, $_POST, $_PUT, $_BODY);
    
    
    return $params;
            
} 

try{        
    
    $method = filter_input(INPUT_SERVER, 'REQUEST_METHOD');
    $params = get_parameters($method); 
    
    if ($config->api_connection === 'public'){ 
                
        $api_mode = 'session';

        if ($config->mode === 'staging'){       
            include('../api-STG/index.php');
        }else{
            include('../api/index.php');
        }
        
    }else{
       
        require_once dirname(__FILE__) . '/vendor/autoload.php';
        
        // https://requests.ryanmccue.info/docs/why-requests.html      
        $api_mode = 'token';
        
        $headers  = array('Authorization' => 'Bearer '.$config->api_token);
        $headers['Authorization'] = 'Bearer '.$config->api_token;
        $headers['Content-Type']  = 'application/json';
        
        switch($method){
            case 'GET': $response = WpOrg\Requests\Requests::get('https://stg-api.stocktok.online'.$params['endpoint'].'?'.http_build_query($params), $headers); print_r($response->body); break;
            case 'PUT': die('put'); break;
            case 'POST': $response = WpOrg\Requests\Requests::post('https://stg-api.stocktok.online'.$params['endpoint'], $headers, json_encode($params)); print_r($response->body);  break;
            case 'DELETE': die('delete'); break;
        }
        
        
    }  
    
}catch(error $e){
    die($e);
}