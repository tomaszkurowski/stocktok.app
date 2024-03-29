<?php

function findSharp($orig, $final) // function from Ryan Rud (http://adryrun.com)
{
    $final	= $final * (750.0 / $orig);
    $a		= 52;
    $b		= -0.27810650887573124;
    $c		= .00047337278106508946;

    $result = $a + $b * $final + $c * $final * $final;

    return max(round($result), 0);
} // findSharp()

if($fileError == UPLOAD_ERR_OK){
   
    $fileName = $_FILES['file']['name'];
    $fileType = $_FILES['file']['type'];
    $fileError = $_FILES['file']['error'];
    $fileContent = file_get_contents($_FILES['file']['tmp_name']);  
    $fileExt  = pathinfo($fileName, PATHINFO_EXTENSION);

    $market =  filter_input(INPUT_POST, 'market');
    $symbol =  filter_input(INPUT_POST, 'symbol');
    
    $username   = filter_input(INPUT_POST, 'me'); // TODO..     
    $username   = strtolower($username);        
    
    
    
    $path       = '../data/covers/'.$market.'/'.$symbol.'.'.$fileExt;
    $dest       = '../data/covers/'.$market.'/nextGen/'.$symbol.'.webp';
    
    if (!file_exists('../data/covers/'.$market)) { mkdir('../data/covers/'.$market, 0777, true); }
    if (!file_exists('../data/covers/'.$market.'/nextGen')) { mkdir('../data/covers/'.$market.'/nextGen', 0777, true); }

    file_put_contents($path, $fileContent); 

    switch($fileExt){
        case 'jpg':
        case 'jpeg':
            $source = imagecreatefromjpeg($path);
            break;
        case 'png':
            $source = imagecreatefrompng($path);
            break;
        case 'webp':
            $source = imagecreatefromwebp($path);
            break;
        case 'bmp':
            $source = imagecreatefrombmp($path);
            break;
        case 'gif':
            $source = imagecreatefromgif($path);
            break;
        default:
            echo json_encode(['success' => false, 'msg' => 'Not supported extension: '.$fileExt.'. Please upload one of those: JPG, JPEG, PNG, WEBP, BMP or GIF' ]);
            die();
    }
    
    $x      =  filter_input(INPUT_POST, 'x');
    $y      =  filter_input(INPUT_POST, 'y');

    list($width, $height, $type, $attr) = getimagesize($path);    
            
    $newwidth  =  996;
    $newheight =  ($height / $width) * 996;
    
    $resized  = imagecreatetruecolor($newwidth, $newheight);
    
    if ($fileExt === 'png' || $fileExt === 'gif'){
        //$white = imagecolorallocate($resized, 255, 255, 255);
        //imagefill($resized, 0, 0, $white);        
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
    }    
    
    imagecopyresampled($resized, $source, 0, 0 , $x * $width/$newwidth, $y * $width/$newwidth, $newwidth, $newheight, $width, $height);
    //$cropped = imagecrop($resized, ['x' => $x, 'y' => $y, 'width' => 450, 'height' => 300]);
    
    // Sharpening try
    $sharpness	= findSharp($width, $newwidth);
    $sharpenMatrix	= array(
            array(-1, -2, -1),
            array(-2, $sharpness + 12, -2),
            array(-1, -2, -1)
    );
    $divisor = $sharpness;
    $offset  = 0;
    imageconvolution($resized, $sharpenMatrix, $divisor, $offset); 
    

    if ($path !== $dest){ unlink($path); }    
    imagewebp($resized, $dest);

    imagedestroy($resized);
    //imagedestroy($cropped);

    echo json_encode(['success' => true, 'path' => str_replace('../data/','https://data.stocktok.online/',$dest).'?cache='.uniqid() ]);

}else{
       switch($fileError){
         case UPLOAD_ERR_INI_SIZE:   
              $message = 'Error al intentar subir un archivo que excede el tamaño permitido.';
              break;
         case UPLOAD_ERR_FORM_SIZE:  
              $message = 'Error al intentar subir un archivo que excede el tamaño permitido.';
              break;
         case UPLOAD_ERR_PARTIAL:    
              $message = 'Error: no terminó la acción de subir el archivo.';
              break;
         case UPLOAD_ERR_NO_FILE:    
              $message = 'Error: ningún archivo fue subido.';
              break;
         case UPLOAD_ERR_NO_TMP_DIR: 
              $message = 'Error: servidor no configurado para carga de archivos.';
              break;
         case UPLOAD_ERR_CANT_WRITE: 
              $message= 'Error: posible falla al grabar el archivo.';
              break;
         case  UPLOAD_ERR_EXTENSION: 
              $message = 'Error: carga de archivo no completada.';
              break;
         default: $message = 'Error: carga de archivo no completada.';
                  break;
        }
        echo json_encode(['success' => false, 'message' => $message ]);
}