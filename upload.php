<?php 

$type      =  filter_input(INPUT_GET, 'type');
if ($type && $type === 'photo'){
    
    $username   = filter_input(INPUT_GET, 'me'); // TODO..     
    $username   = strtolower($username);
    
    $path        = '../data/avatars/'.$username.'.jpeg';
    $avatar_path = '../data/avatars/'.$username;
    
    if (file_exists($avatar_path.'.png')) { unlink($avatar_path.'.png');}
    if (file_exists($avatar_path.'.jpg')) { unlink($avatar_path.'.jpg');}
    if (file_exists($avatar_path.'.jpeg')){ unlink($avatar_path.'.jpeg');}
                    
    move_uploaded_file($_FILES['webcam']['tmp_name'],$path);
    
    $x      =  filter_input(INPUT_GET, 'x');
    $y      =  filter_input(INPUT_GET, 'y');
    
    $width  =  filter_input(INPUT_GET, 'width');
    $height =  filter_input(INPUT_GET, 'height');    

    $resized  = imagecreatetruecolor(300, 300);
    $source   = imagecreatefromjpeg($path);    
    
    imagecopyresized($resized, $source, 0, 0, 0, 0, 300, 300, $width, $height);

    imagejpeg($resized, $path);    
    imagedestroy($resized);
    
    echo json_encode(['success' => true, 'photo' => 'yes', 'path' => str_replace('../data/','https://data.stocktok.online/',$path) ]);
    die();
}

if($fileError == UPLOAD_ERR_OK){
   
    $fileName = $_FILES['file']['name'];
    $fileType = $_FILES['file']['type'];
    $fileError = $_FILES['file']['error'];
    $fileContent = file_get_contents($_FILES['file']['tmp_name']);  
    $fileExt  = substr($fileName, -3) !== 'epg' ? substr($fileName, -3) : 'jpeg';

     
    $username   = filter_input(INPUT_POST, 'me'); // TODO..     
    $username   = strtolower($username);        
    
    $path       = '../data/avatars/'.$username.'.'.$fileExt;
    $avatar_path = '../data/avatars/'.$username;
    
    if (file_exists($avatar_path.'.png')) { unlink($avatar_path.'.png');}
    if (file_exists($avatar_path.'.jpg')) { unlink($avatar_path.'.jpg');}
    if (file_exists($avatar_path.'.jpeg')){ unlink($avatar_path.'.jpeg');}    
    
    file_put_contents($path, $fileContent); 

    $x      =  filter_input(INPUT_POST, 'x');
    $y      =  filter_input(INPUT_POST, 'y');
    $size   =  filter_input(INPUT_POST, 'size');

    $width  =  filter_input(INPUT_POST, 'width');
    $height =  filter_input(INPUT_POST, 'height');
    $newwidth  =  filter_input(INPUT_POST, 'newwidth');
    $newheight =  filter_input(INPUT_POST, 'newheight');

    $resized  = imagecreatetruecolor($newwidth, $newheight);
    
    if ($fileExt === 'png'){
        $source   = imagecreatefrompng($path);
    }else{
        $source   = imagecreatefromjpeg($path);
    }
    
    imagecopyresized($resized, $source, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

    $cropped = imagecrop($resized, ['x' => $x, 'y' => $y, 'width' => 300, 'height' => 300]);

    if ($fileExt === 'png'){
        imagepng($cropped, $path);
    }else{
        imagejpeg($cropped, $path);
    }
    imagedestroy($resized);
    imagedestroy($cropped);

    echo json_encode(['success' => true, 'path' => str_replace('../data/','https://data.stocktok.online/',$path) ]);

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