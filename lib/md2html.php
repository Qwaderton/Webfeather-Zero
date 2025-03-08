<!--
## Made by github.com/atarwn
## MIT license
-->

<?php
function markdownToHtml($markdown) {
    // Headers
    $markdown = preg_replace('/^###### (.*$)/m', '<h6>$1</h6>', $markdown);
    $markdown = preg_replace('/^##### (.*$)/m', '<h5>$1</h5>', $markdown);
    $markdown = preg_replace('/^#### (.*$)/m', '<h4>$1</h4>', $markdown);
    $markdown = preg_replace('/^### (.*$)/m', '<h3>$1</h3>', $markdown);
    $markdown = preg_replace('/^## (.*$)/m', '<h2>$1</h2>', $markdown);
    $markdown = preg_replace('/^# (.*$)/m', '<h1>$1</h1>', $markdown);

    // Bold
    $markdown = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $markdown);
    $markdown = preg_replace('/__(.*?)__/', '<strong>$1</strong>', $markdown);

    // Italic
    $markdown = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $markdown);
    $markdown = preg_replace('/_(.*?)_/', '<em>$1</em>', $markdown);

    // Images
    $markdown = preg_replace('/!\[(.*?)\]\((.*?)\)/', '<img src="$2" alt="$1">', $markdown);

    // Links
    $markdown = preg_replace('/\[(.*?)\]\((.*?)\)/', '<a href="$2">$1</a>', $markdown);

    // Unordered Lists
    $markdown = preg_replace('/^\* (.*$)/m', '<li>$1</li>', $markdown);
    $markdown = preg_replace('/(<li>.*<\/li>)/s', '<ul>$1</ul>', $markdown);

    // Ordered Lists
    $markdown = preg_replace('/^[0-9]+\. (.*$)/m', '<li>$1</li>', $markdown);
    $markdown = preg_replace('/(<li>.*<\/li>)/s', '<ol>$1</ol>', $markdown);

    // Paragraphs
    $markdown = preg_replace('/^(?!<h[1-6]|<ul|<ol|<li)(.*)$/m', '<p>$1</p>', $markdown);

    // Line breaks
    $markdown = str_replace("\n", '<br>', $markdown);

    return $markdown;
}
?>