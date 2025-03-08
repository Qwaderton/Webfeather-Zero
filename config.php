<?php
$adminPasswordHash = password_hash('your_password', PASSWORD_DEFAULT); // Задайте пароль администратора
$rootDir = $_SERVER['DOCUMENT_ROOT']; // Корневой каталог сайта
$overwriteFromTemplate = true; // Перезаписывать ли файлы из шаблона
?>
