<?php
require 'config.php';
require 'functions.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

$csrfToken = generateCsrfToken();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (authenticate($_POST['password'])) {
        $_SESSION['authenticated'] = true;
    } else {
        $error = '❌ Неправильный пароль';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout']) && verifyCsrfToken($_POST['csrf_token'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

if (empty($_SESSION['authenticated'])) {
    include 'login_form.php';
    exit;
}

$currentPath = $_GET['path'] ?? $rootDir;
$currentPath = realpath($currentPath);
if (!isValidPath($currentPath, $rootDir)) {
    $currentPath = $rootDir;
}

$parentPath = dirname($currentPath);

$items = is_dir($currentPath) ? getDirectoryContents($currentPath) : [];
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Webfeather Zero</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Webfeather Zero</h1>
        <form method="POST" class="logout">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
            <button type="submit" name="logout">Выйти</button>
        </form>
    </header>

    <form method="GET">
        <label>Текущий путь: <?= htmlspecialchars($currentPath) ?> </label>
        <select name="path" onchange="this.form.submit()">
            <option value="<?= htmlspecialchars($rootDir) ?>">🏠 Корневая папка</option>
            <?php if ($currentPath !== $rootDir): ?>
                <option value="<?= htmlspecialchars($parentPath) ?>">⬆ .. (Назад)</option>
            <?php endif; ?>
            <?php foreach ($items as $item): ?>
                <?php $itemPath = realpath($currentPath . '/' . $item); ?>
                <?php if (is_dir($itemPath)): ?>
                    <option value="<?= htmlspecialchars($itemPath) ?>" class="folder">
                        📁 <?= htmlspecialchars($item) ?>
                    </option>
                <?php endif; ?>
            <?php endforeach; ?>
        </select>
    </form>

    <h3>Файлы в текущей директории:</h3>
    <ul>
        <?php foreach ($items as $item): ?>
            <?php $itemPath = realpath($currentPath . '/' . $item); ?>
            <?php if (is_file($itemPath)): ?>
                <li>
                    <a href="admin.php?path=<?= urlencode($itemPath) ?>" class="file">
                        📄 <?= htmlspecialchars($item) ?>
                    </a>
                </li>
            <?php endif; ?>
        <?php endforeach; ?>
    </ul>

    <?php if (isset($_GET['path']) && is_file($_GET['path'])): ?>
        <form method="POST">
            <input type="hidden" name="filePath" value="<?= htmlspecialchars($_GET['path']) ?>">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
            <textarea name="content"><?= htmlspecialchars(readFileContent($_GET['path'])) ?></textarea>
            <button type="submit" name="save">Сохранить</button>
        </form>
    <?php endif; ?>

    <footer>
        <p>(с) Qwaderton, 2024-2025</p>
    </footer>
</body>
</html>
