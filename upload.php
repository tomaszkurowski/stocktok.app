<?php 

$type      =  filter_input(INPUT_GET, 'type');
if ($type && $type === 'photo'){
    
    $fileName = $_FILES['file']['name'];
    $fileExt  = pathinfo($fileName, PATHINFO_EXTENSION);
    
    $username   = filter_input(INPUT_GET, 'me'); // TODO..     
    $username   = strtolower($username);
    
    $path       = '../data/avatars/'.$username.'.'.$fileExt;
    $dest       = '../data/avatars/'.$username.'.png';   
                    
    move_uploaded_file($_FILES['webcam']['tmp_name'],$path);
    
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
    
    $x      =  filter_input(INPUT_GET, 'x');
    $y      =  filter_input(INPUT_GET, 'y');
    
    $width  =  filter_input(INPUT_GET, 'width');
    $height =  filter_input(INPUT_GET, 'height');    

    $resized  = imagecreatetruecolor(300, 300);        
    imagecopyresized($resized, $source, 0, 0, 0, 0, 300, 300, $width, $height);
        
    if ($path !== $dest){ unlink($path); } 
    imagepng($resized, $dest);    
    
    imagedestroy($resized);
    
    echo json_encode(['success' => true, 'photo' => 'yes', 'path' => str_replace('../data/','https://data.stocktok.online/',$path) ]);
    die();
}

if($fileError == UPLOAD_ERR_OK){
   
    $fileName = $_FILES['file']['name'];
    $fileType = $_FILES['file']['type'];
    $fileError = $_FILES['file']['error'];
    $fileContent = file_get_contents($_FILES['file']['tmp_name']);  
    $fileExt  = pathinfo($fileName, PATHINFO_EXTENSION);

     
    $username   = filter_input(INPUT_POST, 'me'); // TODO..     
    $username   = strtolower($username);        
    
    $path       = '../data/avatars/'.$username.'.'.$fileExt;
    $dest       = '../data/avatars/'.$username.'.png';
           
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
    $size   =  filter_input(INPUT_POST, 'size');

    $width  =  filter_input(INPUT_POST, 'width');
    $height =  filter_input(INPUT_POST, 'height');
    $newwidth  =  filter_input(INPUT_POST, 'newwidth');
    $newheight =  filter_input(INPUT_POST, 'newheight');

    $resized  = imagecreatetruecolor($newwidth, $newheight);    
    imagecopyresized($resized, $source, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    $cropped = imagecrop($resized, ['x' => $x, 'y' => $y, 'width' => 300, 'height' => 300]);

    if ($path !== $dest){ unlink($path); }    
    imagepng($cropped, $dest);
    
    imagedestroy($resized);
    imagedestroy($cropped);

    echo json_encode(['success' => true, 'path' => str_replace('../data/','https://data.stocktok.online/',$dest) ]);

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
     echo json_encode(['success' => true, //'message' => $message
     ]);
}