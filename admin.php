<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webfeather Zero</title>
    <style>
        .header {
            position: relative;
        }
        .logout {
            position: absolute;
            top: 0;
            right: 0;
        }
        .folder {
            font-weight: bold;
            color: blue;
            cursor: pointer;
        }
        .file {
            color: black;
        }
    </style>
</head>
<div class="header">
    <h1>Webfeather Zero 0.2</h1>
    <?php
    session_start();
    if ($_SESSION['authenticated']) {
        echo '<form method="POST" class="logout"><input type="submit" name="logout" value="Выйти" /></form>';
    }
    ?>
</div>


<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require 'config.php';
require 'functions.php';

if ($enableNicedit) {
    echo "
    <script type=\"text/javascript\" src=\"editors/nicEdit.js\"></script> 
    <script type=\"text/javascript\">
          bkLib.onDomLoaded(function() {
            new nicEditor({fullPanel : true, iconsPath : 'editors/nicEditorIcons.gif'}).panelInstance('editor1');
          });
    </script>
    ";
}

if (isset($_POST['password'])) {
    if (authenticate($_POST['password'])) {
        $_SESSION['authenticated'] = true;
    } else {
        $error = 'Неправильный пароль';
    }
}

if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
    echo '<form method="POST"><input type="password" name="password" /><input type="submit" value="Войти" /></form>';
    if (isset($error)) echo $error;
    exit;
}

$currentPath = isset($_GET['path']) ? $_GET['path'] : $rootDir;
$currentPath = realpath($currentPath);
if (strpos($currentPath, $rootDir) !== 0 || strpos($currentPath, '/cgi-bin') !== false || strpos($currentPath, 'wf-template') !== false) {
    $currentPath = $rootDir;
}

$successMessage = '';

if (isset($_POST['save'])) {
    $filePath = $_POST['filePath'];
    $contentToInsert = $_POST['content'];
    $startMarker = '<!-- ~wf-c-s -->';
    $endMarker = '<!-- ~wf-c-e -->';

    if ($overwriteFromTemplate) {
        $templateContent = readFileContent('./template/index.html');
        $newContent = str_replace($startMarker . $endMarker, $startMarker . $contentToInsert . $endMarker, $templateContent);
        saveFileContent($filePath, $newContent);
    } else {
        if (file_exists($filePath)) {
            $content = readFileContent($filePath);
            if (empty(trim($content))) {
                $templateContent = readFileContent('./template/index.html');
                $newContent = str_replace($startMarker . $endMarker, $startMarker . $contentToInsert . $endMarker, $templateContent);
            } else {
                $startPos = strpos($content, $startMarker) + strlen($startMarker);
                $endPos = strpos($content, $endMarker);
                $newContent = substr($content, 0, $startPos) . $contentToInsert . substr($content, $endPos);
            }
            saveFileContent($filePath, $newContent);
        }
    }

    $successMessage = 'Файл успешно сохранен.';
}


$items = getDirectoryContents($currentPath);

echo '<form method="GET"><label>Текущий путь: ' . htmlspecialchars($currentPath) . '/</label>';
echo '<select name="path" onchange="this.form.submit()">';
echo '<option value="/" class="folder">Выберите файл</option>';
foreach ($items as $item) {
    $itemPath = $currentPath . '/' . $item;
    $selected = (isset($_GET['path']) && $_GET['path'] === $itemPath) ? ' selected' : '';
    
    if (is_dir($itemPath)) {
        // /* на лучшее будущее, и TODO */
        // echo '<option value="' . htmlspecialchars($itemPath) . '"' . $selected . ' class="folder">/' . htmlspecialchars($item) . '/</option>';
    } else {
        echo '<option value="' . htmlspecialchars($itemPath) . '"' . $selected . ' class="file">' . htmlspecialchars($item) . '</option>';
    }
}

echo '</select></form>';


if (isset($_GET['path'])) {
    $selectedPath = $_GET['path'];
    if (is_file($selectedPath)) {
        $allowedTextExtensions = ['txt', 'html', 'htm', 'css', 'js', 'php', 'xml', 'json', 'md', 'csv', 'yaml'];
        $fileExtension = pathinfo($selectedPath, PATHINFO_EXTENSION);

        if (in_array($fileExtension, $allowedTextExtensions)) {
            $filePath = $selectedPath;
            $content = readFileContent($filePath);
            $startMarker = '<!-- ~wf-c-s -->';
            $endMarker = '<!-- ~wf-c-e -->';
            $startPos = strpos($content, $startMarker) + strlen($startMarker);
            $endPos = strpos($content, $endMarker);
            $editableContent = substr($content, $startPos, $endPos - $startPos);

            echo '<form method="POST">';
            echo '<input type="hidden" name="filePath" value="' . htmlspecialchars($filePath) . '" />';
            echo '<textarea id="editor1" name="content" rows="20" cols="85">' . htmlspecialchars($editableContent) . '</textarea>';
            echo '<input type="submit" name="save" value="Сохранить" />';
            echo '</form>';
            if ($successMessage) {
                echo '<p>' . $successMessage . '</p>';
            }
        } else {
            echo '<p>Выбранный файл не является текстовым. Пожалуйста, выберите текстовый файл для редактирования.</p>';
        }
    } else {
        echo '<p>Выбранный путь является директорией. Пожалуйста, выберите файл для редактирования.</p>';
    }
}



echo '<form method="POST">';
echo '<input type="text" name="newName" placeholder="Новый файл" />';
echo '<input type="submit" name="create" value="Создать" />';
echo '</form>';


echo '<form method="POST">';
echo '<select name="nameToRemove">';
foreach ($items as $item) {
    $itemPath = $currentPath . '/' . $item;
    if (is_dir($itemPath)) {
        // /* на лучшее будущее */
        // echo '<option value="' . htmlspecialchars($itemPath) . '" class="folder">' . htmlspecialchars($item) . '/</option>';
    } else {
        echo '<option value="' . htmlspecialchars($itemPath) . '" class="file">' . htmlspecialchars($item) . '</option>';
    }
}
echo '</select>';
echo '<input type="submit" name="delete" value="Удалить" />';
echo '</form>';




if (isset($_POST['create']) && isset($_POST['newName'])) {
    $newPath = $currentPath . '/' . $_POST['newName'];
    // /* на лучшее будущее */
    // if (substr($newPath, -1) === '/') {
    //     mkdir($newPath);
    // } else {
    //     touch($newPath);
    // }
    touch($newPath);
    header("Location: " . $_SERVER['REQUEST_URI']);
}

if (isset($_POST['delete']) && isset($_POST['nameToRemove'])) {
    $pathToRemove = $_POST['nameToRemove'];
    if (is_dir($pathToRemove)) {
        rmdir($pathToRemove);
    } elseif (is_file($pathToRemove)) {
        unlink($pathToRemove);
    }
    header("Location: " . $_SERVER['REQUEST_URI']);
}

// fast logout script
if (isset($_POST['logout'])) {
    session_destroy();
    unset($_POST['logout']);
    header('Location: admin.php');
}
?>
<p><i>&copy; Qwaderton, Forever</i></p>