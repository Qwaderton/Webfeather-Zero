<?php
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

function createFileOrDir($path, $isDir = false) {
    return $isDir ? mkdir($path) : touch($path);
}

function deleteFileOrDir($path) {
    return is_dir($path) ? rmdir($path) : unlink($path);
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
    // Convert headers
    $html = preg_replace('/<h1>(.*?)<\/h1>/', "# $1\n", $html);
    $html = preg_replace('/<h2>(.*?)<\/h2>/', "## $1\n", $html);
    $html = preg_replace('/<h3>(.*?)<\/h3>/', "### $1\n", $html);
    $html = preg_replace('/<h4>(.*?)<\/h4>/', "#### $1\n", $html);
    $html = preg_replace('/<h5>(.*?)<\/h5>/', "##### $1\n", $html);
    $html = preg_replace('/<h6>(.*?)<\/h6>/', "###### $1\n", $html);

    // Convert bold and italic
    $html = preg_replace('/<strong>(.*?)<\/strong>/', '**$1**', $html);
    $html = preg_replace('/<em>(.*?)<\/em>/', '*$1*', $html);

    // Convert images and links
    $html = preg_replace('/<img src="(.*?)" alt="(.*?)"\s*\/?>/', '![$2]($1)', $html);
    $html = preg_replace('/<a href="(.*?)">(.*?)<\/a>/', '[$2]($1)', $html);

    // Convert lists
    $html = preg_replace_callback('/<ul>(.*?)<\/ul>/s', function($m) {
        return preg_replace('/<li>(.*?)<\/li>/', "* $1\n", $m[1]);
    }, $html);
    $html = preg_replace_callback('/<ol>(.*?)<\/ol>/s', function($m) {
        $count = 1;
        return preg_replace_callback('/<li>(.*?)<\/li>/', function($m2) use (&$count) {
            return $count++ . ". $m2[1]\n";
        }, $m[1]);
    }, $html);

    // Convert paragraphs and line breaks
    $html = preg_replace('/<p>(.*?)<\/p>/s', "$1\n\n", $html);
    $html = str_replace(['<br>', '<br/>', '<br />'], "\n", $html);

    // Remove remaining HTML tags
    $html = strip_tags($html);

    return trim($html);
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
?>
