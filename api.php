<?php 
session_start();
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
    
    if ($config['api_connection'] === 'public'){ 
                
        $api_mode = 'session';

        if ($config['mode'] === 'staging'){       
            include('../api-STG/index.php');
        }else{
            include('../api/index.php');
        }
        
    }else{
       
        require_once dirname(__FILE__) . '/vendor/autoload.php';
        
        // https://requests.ryanmccue.info/docs/why-requests.html      
        $api_mode = 'token';
        
        $headers  = array('Authorization' => 'Bearer '.$config['api_token']);
        $headers['Authorization'] = 'Bearer '.$config['api_token'];
        $headers['Content-Type']  = 'application/json';
        
        switch($method){
            case 'GET': $response = WpOrg\Requests\Requests::get('https://stg-api.stocktok.online'.$params['endpoint'].'?'.http_build_query($params), $headers); print_r($response->body); break;
            case 'PUT': $response = WpOrg\Requests\Requests::put('https://stg-api.stocktok.online'.$params['endpoint'].'?'.http_build_query($params), $headers); print_r($response->body); break;
            case 'POST': $response = WpOrg\Requests\Requests::post('https://stg-api.stocktok.online'.$params['endpoint'], $headers, json_encode($params)); print_r($response->body);  break;
            case 'DELETE': $response = WpOrg\Requests\Requests::delete('https://stg-api.stocktok.online'.$params['endpoint'].'?'.http_build_query($params), $headers); print_r($response->body); break;
        }
      
    }  
    
}catch(error $e){
    die($e);
}