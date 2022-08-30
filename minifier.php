<?php
require_once dirname(__FILE__) . '/vendor/autoload.php';
use MatthiasMullie\Minify;

try{
    
    $locations = array( 'media/css/','media/js/internal/','media/js/external/','extensions/entities/media/js/','extensions/entities/media/css','extensions/wallet/media/js/');    
    foreach($locations as $location){
        $files = array_diff(scandir($location), array('..', '.','.htaccess','tmp','backup'));
        foreach($files as $file){
            if ( substr($file, -6)!=='min.js' && substr($file, -7)!=='min.css' ){
                
                if (substr($file, -3)==='.js'){
                    $minifier = new Minify\JS($location.$file);
                    file_put_contents(str_replace('.js','.min.js',$location.$file),$minifier->minify());                    
                    echo $location.$file.' minified<br />';
                }
                if (substr($file, -4)==='.css'){
                    $minifier = new Minify\CSS($location.$file);
                    file_put_contents(str_replace('.css','.min.css',$location.$file),$minifier->minify());
                    echo $location.$file.' minified<br />';                    
                }
                
            }
        }
    }
    
}catch(error $err){
    die($err);
}