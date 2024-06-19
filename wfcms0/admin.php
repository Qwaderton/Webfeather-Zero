<h1>Webfeather Zero</h1>

<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

session_start();
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
    echo '<form method="POST"><input type="password" name="password" /><input type="submit" value="Login" /></form>';
    if (isset($error)) echo $error;
    exit;
}

$currentPath = isset($_GET['path']) ? $_GET['path'] : $rootDir;
$currentPath = realpath($currentPath);
if (strpos($currentPath, $rootDir) !== 0 || strpos($currentPath, '/cgi-bin') !== false || strpos($currentPath, '/wf-templates') !== false) {
    $currentPath = $rootDir;
}

$successMessage = '';

if (isset($_POST['save'])) {
    $filePath = $_POST['filePath'];
    $contentToInsert = $_POST['content'];
    $startMarker = '<!-- ~wf-c-s -->';
    $endMarker = '<!-- ~wf-c-e -->';

    if ($overwriteFromTemplate) {
        $templateContent = readFileContent($rootDir . '/wf-templates/index.html');
        $newContent = str_replace($startMarker . $endMarker, $startMarker . $contentToInsert . $endMarker, $templateContent);
        saveFileContent($filePath, $newContent);
    } else {
        if (file_exists($filePath)) {
            $content = readFileContent($filePath);
            if (empty(trim($content))) {
                $templateContent = readFileContent($rootDir . '/wf-templates/index.html');
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

if (isset($_POST['create'])) {
    $newPath = rtrim($currentPath, '/') . '/' . $_POST['newName'];
    // createFileOrDirectory($newPath, substr($newPath, -1) === '/');
    createFileOrDirectory($newPath, false);
}

if (isset($_POST['delete'])) {
    $path = rtrim($currentPath, '/') . '/' . $_POST['nameToRemove'];
    deleteFileOrDirectory($path, false);
}

$items = getDirectoryContents($currentPath);

echo '<form method="GET"><label>Текущий путь: ' . htmlspecialchars($currentPath) . '</label>';
echo '<select name="path" onchange="this.form.submit()">';
echo '<option value="' . htmlspecialchars($rootDir) . '">/</option>';

foreach ($items as $item) {
    $itemPath = $currentPath . '/' . $item;
    if (!is_dir($itemPath)) {
        $selected = (isset($_GET['path']) && $_GET['path'] === $itemPath) ? ' selected' : '';
        echo '<option value="' . htmlspecialchars($itemPath) . '"' . $selected . '>/' . htmlspecialchars($item) . '</option>';
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
echo '<option value="' . htmlspecialchars($rootDir) . '">/</option>';

foreach ($items as $item) {
    $itemPath = $currentPath . '/' . $item;
    if (!is_dir($itemPath)) {
        echo '<option value="' . htmlspecialchars($itemPath) . '">' . htmlspecialchars($item) . '</option>';
    }
}

echo '</select>';
echo '<input type="submit" name="delete" value="Удалить" />';
echo '</form>';

if (isset($_POST['delete']) && isset($_POST['nameToRemove'])) {
    $fileToDelete = $_POST['nameToRemove'];
    echo $fileToDelete;
    if (is_file($fileToDelete)) {
        if (deleteFileOrDirectory($fileToDelete)) {
            echo '<p>Файл успешно удален.</p>';
        } else {
            echo '<p>Не удалось удалить файл.</p>';
        }
    } else {
        echo '<p>Выбранный объект не является файлом или не существует.</p>';
    }
}

?>
