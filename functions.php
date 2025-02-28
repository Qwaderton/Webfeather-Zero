<?php
session_start();

function authenticate($password) {
    require 'config.php';
    return password_verify($password, $adminPasswordHash);
}

function getDirectoryContents($path) {
    if (!is_dir($path)) {
        return [];
    }
    return array_values(array_diff(scandir($path), ['.', '..']));
}

function readFileContent($filePath) {
    return is_readable($filePath) ? file_get_contents($filePath) : '';
}

function saveFileContent($filePath, $content) {
    return file_put_contents($filePath, $content) !== false;
}

function createFile($filePath) {
    return touch($filePath);
}

function deleteFile($filePath) {
    return is_file($filePath) ? unlink($filePath) : false;
}

function isValidPath($path, $rootDir) {
    $realPath = realpath($path);
    return $realPath && strpos($realPath, $rootDir) === 0;
}

function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>
