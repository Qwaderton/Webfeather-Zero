<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
require_once 'functions.php';

$csrfToken = generateCsrfToken();

# Проверка аутентификации
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (authenticate($_POST['password'])) {
        $_SESSION['authenticated'] = true;
    } else {
        $error = '❌ Неправильный пароль';
    }
}

# Выход из системы
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout']) && verifyCsrfToken($_POST['csrf_token'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

# Показать окно входа
if (empty($_SESSION['authenticated'])) {
?>
    <!DOCTYPE html>
    <html lang="ru">

    <head>
        <meta charset="UTF-8">
        <title>Вход в Webfeather Zero</title>
        <link rel="stylesheet" href="styles.css">
    </head>

    <body>
        <div class="login-container">
            <h2>🔑 Авторизация</h2>

            <?php if (!empty($error)): ?>
                <p class="error-message"><?= htmlspecialchars($error) ?></p>
            <?php endif; ?>

            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <input type="password" name="password" placeholder="Введите пароль" required>
                <button type="submit">Войти</button>
            </form>

            <p class="footer">&copy; Qwaderton, 2024-2025</p>
        </div>
    </body>
    </html>
<?php
    exit;
}

# Задать текущий путь
$currentPath = $_GET['path'] ?? $rootDir;
$currentPath = realpath($currentPath);
if (!isValidPath($currentPath, $rootDir)) {
    $currentPath = $rootDir;
}

$parentPath = dirname($currentPath);

$items = is_dir($currentPath) ? getDirectoryContents($currentPath) : [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && verifyCsrfToken($_POST['csrf_token'])) {
    if (isset($_POST['create']) && !empty($_POST['newName'])) {
        $newPath = $currentPath . '/' . basename($_POST['newName']);
        createFileOrDir($newPath, isset($_POST['isDir']));
    }

    if (isset($_POST['delete']) && !empty($_POST['deleteName'])) {
        $deletePath = realpath($currentPath . '/' . $_POST['deleteName']);
        deleteFileOrDir($deletePath);
    }

    if (isset($_POST['move']) && !empty($_POST['oldName']) && !empty($_POST['newName'])) {
        $oldPath = realpath($currentPath . '/' . $_POST['oldName']);
        $newPath = $currentPath . '/' . basename($_POST['newName']);
        moveFileOrDir($oldPath, $newPath);
    }


    if (isset($_POST['save'])) {
        try {
            $filePath = $_POST['filePath'];
            $content = $_POST['content'];
            $mode = $_POST['mode'];

            if ($mode === 'content') {
                updateContentWithTemplate($content, $filePath);
            } else {
                saveFileContent($filePath, $content);
            }

            header("Location: " . $_SERVER['REQUEST_URI']);
            exit;
        } catch (Exception $e) {
            $error = "Ошибка сохранения: " . $e->getMessage();
        }
    }

    header('Location: ' . $_SERVER['REQUEST_URI']);
    exit;
}
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
        <form method="POST" id="logout">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
            <button type="submit" name="logout" class="logout">Выйти</button>
        </form>
    </header>

    <form method="GET">
        <label>Текущий путь: <?= htmlspecialchars($currentPath) ?> </label><br>
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

    <?php if (is_dir($currentPath)): ?>
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
    <?php endif; ?>

    <?php if (is_file($currentPath)): ?>
        <?php
        $fileContent = readFileContent($currentPath);
        $mode = 'file';
        $editableContent = $fileContent;

        try {
            if (isTemplateBased($fileContent)) {
                $editableContent = extractContentFromHtml($fileContent);
                $mode = 'content';
            }
        } catch (Exception $e) {
            $error = "Template Error: " . $e->getMessage();
        }
        ?>
        <form method="POST">
            <input type="hidden" name="filePath" value="<?= htmlspecialchars($currentPath) ?>">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
            <input type="hidden" name="mode" value="<?= $mode ?>">
            <textarea name="content" style="width:100%; height:400px;"><?= htmlspecialchars($editableContent) ?></textarea>
            <button type="submit" name="save">Сохранить</button>
            <?php
            $isTemplate = isTemplateBased($fileContent);
            if ($isTemplate): ?>
                <div class="mode-switch">
                    <a href="?path=<?= urlencode($currentPath) ?>&mode=<?= $mode === 'content' ? 'file' : 'content' ?>">
                        ⚡ Switch to <?= $mode === 'content' ? 'HTML' : 'MD' ?> Mode
                    </a>
                </div>
            <?php endif; ?>
        </form>
    <?php endif; ?>

    <?php if (is_file($currentPath)): ?>
        <details>
            <summary>Управление файлами</summary>

            <h3>Создать файл или папку</h3>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <input type="text" name="newName" placeholder="Название">
                <label><input type="checkbox" name="isDir"> Папка</label>
                <button type="submit" name="create">Создать</button>
            </form>

            <h3>Удалить файл или папку</h3>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <select name="deleteName">
                    <?php foreach ($items as $item): ?>
                        <option value="<?= htmlspecialchars($item) ?>"><?= htmlspecialchars($item) ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" name="delete">Удалить</button>
            </form>

            <h3>Переименовать или переместить</h3>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>">
                <select name="oldName">
                    <?php foreach ($items as $item): ?>
                        <option value="<?= htmlspecialchars($item) ?>"><?= htmlspecialchars($item) ?></option>
                    <?php endforeach; ?>
                </select>
                <input type="text" name="newName" placeholder="Новое имя или путь">
                <button type="submit" name="move">Переименовать / Переместить</button>
            </form>

        </details>
    <?php endif; ?>

    <footer>
        <p>(с) Qwaderton, 2024-2025</p>
    </footer>
</body>

</html>