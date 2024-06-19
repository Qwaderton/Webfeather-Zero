<?php
/*
 * This library contains PHP class "NicEdit", who provides work of "Manager of Images" of WYSIWYG editor NicEdit on server side
 * ©2015-2016, Lead Pepelats ( http://lead-pepelats.ru/blog/tag/NicEdit/ )
 * 2023-01-31 fix imagecreatefrombmp redeclare trouble
 */

class NicEdit {

  protected $docRoot;
  protected $path = "";
  protected $thumbsDir = ".thumbs";
  protected $maxDimension = 500;
  protected $maxUploadSize = 10;
  protected $memoryLimit = "128M";
  protected $file;
  protected $files = array();
  protected $error = "";
  protected $types = array(1 => "gif", 2 => "jpg", 3 => "png", 6 => "bmp");
  protected $imgs = array("image/jpeg" => "jpg", "image/pjpeg" => "jpg", "image/x-png" => "png", "image/png" => "png", "image/gif" => "gif", "image/bmp" => "bmp");
  protected $uploadErr = array(
    1 => "Размер принятого файла изображения превысил максимально допустимый размер, который задан директивой upload_max_filesize конфигурационного файла php.ini",
    2 => "Размер загружаемого файла изображения превысил значение MAX_FILE_SIZE, указанное в HTML-форме",
    3 => "Загружаемый файл изображения был получен только частично",
    4 => "Файл изображения не был загружен",
    5 => "Отсутствует временная папка",
    6 => "Не удалось записать файл изображения на диск",
    7 => "Неподдерживаемый формат файла изображения",
    8 => "Не удалось переместить загруженный файл",
    9 => "Неверный формат файла изображения",
    10 => "Размер файла превысил допустимое значение %sМБ"
  );

  public function __construct($docRoot = false) {
    $this->docRoot = trim($docRoot);
  }

  public function imanager() {
    if (!$this->docRoot)
      return false;
    if (@$_POST["path"])
      $this->path = str_replace(str_replace("\\", "/", $this->docRoot), "", str_replace("\\", "/", realpath($this->docRoot . "/" . $_POST["path"]))) . "/";
    if (substr($this->path, 0, 1) == "/")
      $this->path = substr($this->path, 1);
    $this->file = @$_FILES["nicImg"];
    if ($this->file)
      return $this->upload();
    if ($delete = @$_POST["delete"])
      return $this->delete($delete);
    elseif (isset($_POST["path"]))
      return $this->scanDir();
  }

  protected function upload() {
    if (@$this->maxUploadSize && ($this->maxUploadSize * 1024 * 1024) < $this->file["size"])
      $this->error = sprintf($this->uploadErr[10], $this->maxUploadSize);
    if (!$this->error && $this->file["error"] && $this->file["error"] != 4)
      $this->error = $this->uploadErr[$this->file["error"]];
    if (!$this->error && !$this->file["error"] && !isset($this->imgs[$this->file["type"]]))
      $this->error = $this->uploadErr[7];
    if (!$this->error) {
      list($w, $h, $type) = @getimagesize($this->file["tmp_name"]);
      if (!isset($this->types[$type]))
        $this->error = $this->uploadErr[9];
    }
    if (!$this->error && !$this->file["error"]) {
      $tmp = split("\.", $this->file["name"]);
      $ext = strtolower($tmp[sizeof($tmp) - 1]);
      unset($tmp[sizeof($tmp) - 1]);
      $file_name = $this->translit(implode(".", $tmp)) . "." . $ext;
      if (!move_uploaded_file($this->file["tmp_name"], $this->docRoot . "/" . $this->path . $file_name))
        $this->error = $this->uploadErr[8];
    }
    $result = array("status" => ($this->error ? "error" : "successful"), "message" => ($this->error ? $this->error : ""));
    print $this->array2json($result);
  }
  
  protected function delete($delete = "") {
    if (!@unlink($this->docRoot . "/" . $this->path . $delete))
        return print $this->array2json(array("err" => "Не удалось удалить файл `" . $this->path . $delete . "`!"));
    else
        return print $this->array2json(array("ok" => "Файл `" . $this->path . $delete . "` успешно удалён!"));
  }

  protected function scanDir() {
    $levelup = $folders = $files = array();
    $path = realpath($this->docRoot . "/" . $this->path);
    $thumbsDir = $path . "/" . $this->thumbsDir;
    $miniatures = 0;
    if (is_dir($path)) {
      $dh = opendir($path);
      while ($file = readdir($dh)) {
        if (is_file($path . "/" . $file)) {
          list($w, $h, $type) = @getimagesize($path . "/" . $file);
          if (isset($this->types[$type])) {
            $hash = md5_file($path . "/" . $file);
            $this->files[$file] = array("hash" => $hash, "type" => $this->types[$type], "width" => $w, "height" => $h);
            if ($miniatures == 0 && !@is_dir($thumbsDir)) {
              if (mkdir($thumbsDir)) {
                chmod($thumbsDir, octdec(755));
                $miniatures = 1;
              }
              else
                $miniatures = -1;
            }
            else
              $miniatures = 1;
            if ($miniatures > 0) {
              $this->files[$file]["preview"] = $this->miniatures($file);
              $this->files[$file]["thumb"] = $this->miniatures($file, true);
              if ($this->files[$file]["preview"]) {
                list($pw, $ph) = @getimagesize($thumbsDir . "/" . $this->files[$file]["hash"] . "." . $this->files[$file]["type"]);
                $this->files[$file]["preview_height"] = $ph;
                $this->files[$file]["preview_width"] = $pw;
              }
            }
          }
        }
        elseif ($file != "." && $file != ".." && $file != $this->thumbsDir && is_dir($path . "/" . $file))
          $folders[$file] = array("type" => "folder");
        elseif ($file == ".." && $file != $this->thumbsDir && $this->path && $this->path != "/")
          $levelup[$file] = array("type" => "folder");
      }
      closedir($dh);
      uksort($folders, "my_ksort");
      uksort($this->files, "my_ksort");
      $result = array("error" => $this->error, "path" => str_replace("\\", "/", $this->path), "items" => $levelup + $folders + $this->files);
      print $this->array2json($result);
    }
  }

  protected function translit($st) {
    $a = array_merge(array_combine(preg_split("//u", "абвгдеёзийклмнопрстуфхцьыэАБВГДЕЁЗИЙКЛМНОПРСТУФХЦЬЫЭabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_ "), preg_split("//u", "abvgdeeziyklmnoprstufhc'ieABVGDEEZIYKLMNOPRSTUFHC'IEabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-__")), array("ж" => "zh", "ч" => "ch", "ш" => "sh", "щ" => "shch", "ъ" => "", "ю" => "yu", "я" => "ya", "Ж" => "Zh", "Ч" => "Ch", "Ш" => "Sh", "Щ" => "Shch", "Ъ" => "", "Ю" => "Yu", "Я" => "Ya"));
    $r = preg_split("//u", $st);
    $out = "";
    foreach ($r as $v) {
      if (isset($a[$v]))
        $out .= $a[$v];
    }
    return $out;
  }

  protected function miniatures($name = "", $thumb = false) {
    $path = realpath($this->docRoot . "/" . $this->path);
    header("Debug: path " . $path, false);
    $result = $path . "/" . $this->thumbsDir . "/" . $this->files[$name]["hash"] . ($thumb ? "_thumb" : "") . "." . str_replace("bmp", "jpg", $this->files[$name]["type"]);
    header("Debug: result " . $result, false);
    if (file_exists($result))
      return true;
    if (!extension_loaded("gd") || !function_exists("gd_info"))
      return false;
    $maxDimension = $thumb ? 36 : $this->maxDimension;
    if ($maxDimension >= $this->files[$name]["width"] && $maxDimension >= $this->files[$name]["height"])
      return false;
    $r = $this->files[$name]["width"] / $this->files[$name]["height"];
    if ($r > 1) {
      $x = round(intval($maxDimension) / $r);
      $y = intval($maxDimension);
    }
    elseif ($r < 1) {
      $x = intval($maxDimension);
      $y = round(intval($maxDimension) * $r);
    }
    else
      $x = $y = intval($maxDimension);
    if ($this->memoryLimit > 0)
      ini_set("memory_limit", $this->memoryLimit);
    $picSize = $this->files[$name]["width"] * $this->files[$name]["height"] * 4; // 4 bytes per pixel
    if ($this->get_memory_limit() * .9 <= $picSize)
      return false;
    $imagecreatefn = "imagecreatefrom" . str_replace("jpg", "jpeg", $this->files[$name]["type"]);
    if ($src = $imagecreatefn($path . "/" . $name)) {
      $out = imagecreatetruecolor($y, $x);
      imagesavealpha($out, true);
      imagealphablending($out, true);
      $trans = imagecolorallocatealpha($out, 255, 255, 255, 127);
      imagefill($out, 0, 0, $trans);
      imagecopyresampled($out, $src, 0, 0, 0, 0, $y, $x, $this->files[$name]["width"], $this->files[$name]["height"]);
      switch ($this->files[$name]["type"]) {
        case "bmp":
        case "jpg":
          if (!@imagejpeg($out, $result, 90))
            return false;
          break;
        case "gif":
          if (!@imagegif($out, $result))
            return false;
          break;
        case "png":
          if (!@imagepng($out, $result))
            return false;
          break;
      }
      imagedestroy($out);
      return true;
    }
  }

  protected function get_memory_limit() {
    $bytes = substr(ini_get("memory_limit"), 0, -1);
    switch (strtoupper(substr(ini_get("memory_limit"), -1))) {
      case "P":
        $bytes *= 1024;
      case "T":
        $bytes *= 1024;
      case "G":
        $bytes *= 1024;
      case "M":
        $bytes *= 1024;
      case "K":
        $bytes *= 1024;
        break;
    }
    return $bytes;
  }

  protected function array2json($arr) {
    if (function_exists("json_encode"))
      return json_encode($arr); //Lastest versions of PHP already has this functionality.
    $parts = array();
    $is_list = false;
    //Find out if the given array is a numerical array
    $keys = array_keys($arr);
    $max_length = count($arr)-1;
    if (($keys[0] === 0) and ($keys[$max_length] === $max_length)) {//See if the first key is 0 and last key is length - 1
      $is_list = true;
      for($i = 0; $i < count($keys); $i++) { //See if each key correspondes to its position
        if ($i != $keys[$i]) { //A key fails at position check.
          $is_list = false; //It is an associative array.
          break;
        }
      }
    }
    foreach($arr as $key => $value) {
      if (is_array($value)) { //Custom handling for arrays
        if ($is_list) $parts[] = $this->array2json($value); /* :RECURSION: */
        else $parts[] = '"' . $key . '":' . $this->array2json($value); /* :RECURSION: */
      }
      else {
        $str = "";
        if (!$is_list) $str = '"' . $key . '":';
        //Custom handling for multiple data types
        if (is_numeric($value)) $str .= $value; //Numbers
        elseif ($value === false) $str .= "false"; //The booleans
        elseif ($value === true) $str .= "true";
        else $str .= '"' . addslashes($value) . '"'; //All other things
        // :TODO: Is there any more datatype we should be in the lookout for? (Object?)
        $parts[] = $str;
      }
    }
    $json = implode(",", $parts);
    if ($is_list)
      return "[" . $json . "]"; //Return numerical JSON
    return "{" . $json . "}"; //Return associative JSON
  }   

}

if (!function_exists("imagecreatefrombmp")) {
	function imagecreatefrombmp($filename) {
	  if (!$f1 = fopen($filename, "rb"))
		return false;
	  $file = unpack("vfile_type/Vfile_size/Vreserved/Vbitmap_offset", fread($f1, 14));
	  if ($file["file_type"] != 19778)
		return false;
	  $bmp = unpack("Vheader_size/Vwidth/Vheight/vplanes/vbits_per_pixel" .
		  "/Vcompression/Vsize_bitmap/Vhoriz_resolution" .
		  "/Vvert_resolution/Vcolors_used/Vcolors_important", fread($f1, 40));
	  $bmp["colors"] = pow(2, $bmp["bits_per_pixel"]);
	  if ($bmp["size_bitmap"] == 0)
		$bmp["size_bitmap"] = $file["file_size"] - $file["bitmap_offset"];
	  $bmp["bytes_per_pixel"] = $bmp["bits_per_pixel"] / 8;
	  $bmp["bytes_per_pixel2"] = ceil($bmp["bytes_per_pixel"]);
	  $bmp["decal"] = ($bmp["width"] * $bmp["bytes_per_pixel"] / 4);
	  $bmp["decal"] -= floor($bmp["width"] * $bmp["bytes_per_pixel"] / 4);
	  $bmp["decal"] = 4 - (4 * $bmp["decal"]);
	  if ($bmp["decal"] == 4)
		$bmp["decal"] = 0;
	  $palette = array();
	  if ($bmp["colors"] < 16777216 && $bmp["colors"] != 65536)
		$palette = unpack("V" . $bmp["colors"], fread($f1, $bmp["colors"] * 4));
	  $img = fread($f1, $bmp["size_bitmap"]);
	  $vide = chr(0);
	  $res = imagecreatetruecolor($bmp["width"], $bmp["height"]);
	  $P = 0;
	  $y = $bmp["height"] - 1;
	  while ($y >= 0) {
		$x = 0;
		while ($x < $bmp["width"]) {
		  if ($bmp["bits_per_pixel"] == 24)
			$color = unpack("V", substr($img, $P, 3) . $vide);
		  elseif ($bmp["bits_per_pixel"] == 16) {
			$color = unpack("v", substr($img, $P, 2));
			$blue = ($color[1] & 0x001f) << 3;
			$green = ($color[1] & 0x07e0) >> 3;
			$red = ($color[1] & 0xf800) >> 8;
			$color[1] = $red * 65536 + $green * 256 + $blue;
		  }
		  elseif ($bmp["bits_per_pixel"] == 8) {
			$color = unpack("n", $vide . substr($img, $P, 1));
			$color[1] = $palette[$color[1] + 1];
		  }
		  elseif ($bmp["bits_per_pixel"] == 4) {
			$color = unpack("n", $vide . substr($img, floor($P), 1));
			if (($P * 2) % 2 == 0)
			  $color[1] = ($color[1] >> 4);
			else
			  $color[1] = ($color[1] & 0x0F);
			$color[1] = $palette[$color[1] + 1];
		  }
		  elseif ($bmp["bits_per_pixel"] == 1) {
			$color = unpack("n", $vide . substr($img, floor($P), 1));
			if (($P * 8) % 8 == 0)
			  $color[1] = $color[1] >> 7;
			elseif (($P * 8) % 8 == 1)
			  $color[1] = ($color[1] & 0x40) >> 6;
			elseif (($P * 8) % 8 == 2)
			  $color[1] = ($color[1] & 0x20) >> 5;
			elseif (($P * 8) % 8 == 3)
			  $color[1] = ($color[1] & 0x10) >> 4;
			elseif (($P * 8) % 8 == 4)
			  $color[1] = ($color[1] & 0x8) >> 3;
			elseif (($P * 8) % 8 == 5)
			  $color[1] = ($color[1] & 0x4) >> 2;
			elseif (($P * 8) % 8 == 6)
			  $color[1] = ($color[1] & 0x2) >> 1;
			elseif (($P * 8) % 8 == 7)
			  $color[1] = ($color[1] & 0x1);
			$color[1] = $palette[$color[1] + 1];
		  }
		  else
			return false;
		  imagesetpixel($res, $x, $y, $color[1]);
		  $x++;
		  $P += $bmp["bytes_per_pixel"];
		}
		$y--;
		$P+=$bmp["decal"];
	  }
	  fclose($f1);
	  return $res;
	}
}

function my_ksort($a, $b) {
  return intval(strtolower($a) > strtolower($b));
}

?>