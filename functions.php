<?php
require "lib/ParCon.php";

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

function deleteFileOrDir($path) {
    if (!file_exists($path)) {
        throw new Exception("Файл или директория не существует");
    }
    if (is_dir($path)) {
        $files = array_diff(scandir($path), ['.', '..']);
        if (!empty($files)) {
            throw new Exception("Директория не пуста");
        }
        if (!rmdir($path)) {
            throw new Exception("Ошибка удаления директории");
        }
    } else {
        if (!unlink($path)) {
            throw new Exception("Ошибка удаления файла");
        }
    }
    return true;
}

function createFileOrDir($path, $isDir = false) {
    if (file_exists($path)) {
        throw new Exception("Файл или директория уже существует");
    }
    if ($isDir) {
        if (!mkdir($path, 0755, true)) {
            throw new Exception("Ошибка создания директории");
        }
    } else {
        if (!touch($path)) {
            throw new Exception("Ошибка создания файла");
        }
    }
    return true;
}

function moveFileOrDir($oldPath, $newPath) {
    return rename($oldPath, $newPath);
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


function htmlToMarkdown($html) {
    $converter = new HTML2MD();
    return $converter->parse($html);
}

function markdownToHtml($markdown) {
    $parser = new MD2HTML();
    return $parser->parse($markdown);
}

function extractContentFromHtml($html) {
    if (!preg_match('/<!--wfcb-->(.*?)<!--wfce-->/s', $html, $matches)) {
        throw new Exception("Anchor tags not found");
    }
    return htmlToMarkdown(trim($matches[1]));
}

function updateContentWithTemplate($markdown, $targetPath) {
    $templatePath = 'template/index.html';
    if (!file_exists($templatePath)) throw new Exception("Template missing");
    
    $template = file_get_contents($templatePath);
    if (strpos($template, '<!--wfcb-->') === false || strpos($template, '<!--wfce-->') === false) {
        throw new Exception("Template missing anchors");
    }

    $htmlContent = markdownToHtml($markdown);
    $newContent = preg_replace(
        '/<!--wfcb-->.*?<!--wfce-->/s',
        "<!--wfcb-->\n$htmlContent\n<!--wfce-->",
        $template
    );

    if (!is_dir(dirname($targetPath))) {
        mkdir(dirname($targetPath), 0755, true);
    }

    if (file_put_contents($targetPath, $newContent) === false) {
        throw new Exception("Failed to save file");
    }
    return true;
}

function isTemplateBased($content) {
    return strpos($content, '<!--wfcb-->') !== false && strpos($content, '<!--wfce-->') !== false;
}