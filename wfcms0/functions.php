<?php
function authenticate($password) {
    global $adminPassword;
    return $password === $adminPassword;
}

function getDirectoryContents($path) {
    $items = array_diff(scandir($path), ['.', '..']);
    return $items;
}

function readFileContent($filePath) {
    return file_get_contents($filePath);
}

function saveFileContent($filePath, $content) {
    return file_put_contents($filePath, $content);
}

function createFileOrDirectory($path, $isDir = false) {
    if ($isDir) {
        return mkdir($path);
    } else {
        return file_put_contents($path, '');
    }
}

function deleteFileOrDirectory($path, $isDir = false) {
    if ($isDir) {
        return rmdir($path);
    } else {
        return unlink($path);
    }
}

function getTemplateDirectories($baseDir) {
    $dirs = array_filter(glob($baseDir . '/*'), 'is_dir');
    return $dirs;
}
?>