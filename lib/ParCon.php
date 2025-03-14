<?php
class MD2HTML
{
    private $codeBlocks = [];
    private $inlineCodes = [];

    public function parse($text)
    {
        $text = $this->processCodeBlocks($text);
        $text = $this->processInlineCode($text);
        $text = $this->processHeaders($text);
        $text = $this->processBlockquotes($text);
        $text = $this->processLists($text);
        $text = $this->processHorizontalRules($text);
        $text = $this->processParagraphs($text);
        $text = $this->processInlineElements($text);
        $text = $this->restoreCodePlaceholders($text);
        return trim($text);
    }
    private function processCodeBlocks($text)
    {
        $text = preg_replace_callback('/```\s*(\w*)\s*\n([\s\S]*?)\n\s*```/', function ($matches) {
            $this->codeBlocks[] = [
                'language' => $matches[1],
                'code' => trim($matches[2])
            ];
            return '%%CODEBLOCK' . (count($this->codeBlocks) - 1) . '%%';
        }, $text);
        return $text;
    }

    private function processInlineCode($text)
    {
        $text = preg_replace_callback('/`([^`]+)`/', function ($matches) {
            $this->inlineCodes[] = $matches[1];
            return '%%INLINECODE' . count($this->inlineCodes) - 1 . '%%';
        }, $text);
        return $text;
    }

    private function restoreCodePlaceholders($text)
    {
        foreach ($this->codeBlocks as $index => $codeBlock) {
            $html = '<pre><code class="language-' . htmlspecialchars($codeBlock['language']) . '">'
                . htmlspecialchars($codeBlock['code']) . '</code></pre>';
            $text = str_replace('%%CODEBLOCK' . $index . '%%', $html, $text);
        }
        foreach ($this->inlineCodes as $index => $code) {
            $html = '<code>' . htmlspecialchars($code) . '</code>';
            $text = str_replace('%%INLINECODE' . $index . '%%', $html, $text);
        }
        return $text;
    }

    private function processHeaders($text)
    {
        $text = preg_replace('/^(.+)\n={3,}$/m', '<h1>$1</h1>', $text);
        $text = preg_replace('/^(.+)\n-{3,}$/m', '<h2>$1</h2>', $text);
        for ($i = 6; $i >= 1; $i--) {
            $text = preg_replace('/^#{' . $i . '}\s+(.+)$/m', "<h$i>$1</h$i>", $text);
        }
        return $text;
    }

    private function processBlockquotes($text)
    {
        return preg_replace_callback('/(^>.*(\n>.*)*)/m', function ($matches) {
            $content = preg_replace('/^> ?(.*)/m', '$1', $matches[0]);
            return '<blockquote>' . trim($content) . '</blockquote>' . "\n";
        }, $text);
    }
    private function processLists($text)
    {
        // Process unordered lists
        $text = preg_replace_callback('/^([*+-]\s+.*)(\n\s+.*)*/m', function ($matches) {
            $items = explode("\n", $matches[0]);
            $html = "<ul>\n";
            foreach ($items as $item) {
                $item = preg_replace('/^\s*[*+-]\s+(.*)/', '$1', $item);
                $html .= "<li>$item</li>\n";
            }
            $html .= "</ul>";
            return $html;
        }, $text);
        // Similar processing for ordered lists
        return $text;
    }

    private function processHorizontalRules($text)
    {
        return preg_replace('/^[-*_]{3,}$/m', '<hr>', $text);
    }
    private function processParagraphs($text)
    {
        $blocks = preg_split('/(\n\s*){2,}/', $text);
        foreach ($blocks as &$block) {
            $block = trim($block);
            if ($block && !preg_match('/^</', $block)) {
                $block = "<p>$block</p>";
            }
        }
        return implode("\n\n", $blocks);
    }

    private function processInlineElements($text)
    {
        $text = preg_replace('/!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/', '<img src="$2" alt="$1" title="$3">', $text);
        $text = preg_replace('/\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/', '<a href="$2" title="$3">$1</a>', $text);
        $text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $text);
        $text = preg_replace('/__(.*?)__/', '<strong>$1</strong>', $text);
        $text = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $text);
        $text = preg_replace('/_(.*?)_/', '<em>$1</em>', $text);
        $text = preg_replace('/~~(.*?)~~/', '<del>$1</del>', $text);
        return $text;
    }
}

class HTML2MD
{
    public function parse($html)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        $output = '';
        foreach ($dom->childNodes as $node) {
            $output .= $this->processNode($node);
        }
        return trim($output);
    }

    private function processNode($node, $indentLevel = 0)
    {
        $markdown = '';
        switch ($node->nodeType) {
            case XML_TEXT_NODE:
                $text = preg_replace('/([*_~`#-])/', '\\\\$1', $node->nodeValue);
                $markdown .= $text;
                break;
            case XML_ELEMENT_NODE:
                $tag = $node->tagName;
                switch ($tag) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        $level = substr($tag, 1);
                        $content = $this->getInnerMarkdown($node);
                        $markdown .= str_repeat('#', $level) . ' ' . $content . "\n\n";
                        break;
                    case 'p':
                        $content = $this->getInnerMarkdown($node);
                        $markdown .= $content . "\n\n";
                        break;
                    case 'ul':
                    case 'ol':
                        $listMarkdown = '';
                        foreach ($node->childNodes as $li) {
                            if ($li->nodeName === 'li') {
                                $prefix = $tag === 'ul' ? '* ' : '1. ';
                                $liContent = $this->getInnerMarkdown($li);
                                $listMarkdown .= str_repeat('  ', $indentLevel) . $prefix . $liContent . "\n";
                                foreach ($li->childNodes as $child) {
                                    if ($child->nodeType === XML_ELEMENT_NODE && in_array($child->tagName, ['ul', 'ol'])) {
                                        $listMarkdown .= $this->processNode($child, $indentLevel + 1);
                                    }
                                }
                            }
                        }
                        $markdown .= $listMarkdown;
                        break;
                    case 'blockquote':
                        $content = trim($this->getInnerMarkdown($node));
                        foreach (explode("\n\n", $content) as $para) {
                            foreach (explode("\n", $para) as $line) {
                                $markdown .= '> ' . $line . "\n";
                            }
                            $markdown .= ">\n";
                        }
                        $markdown .= "\n";
                        break;
                    case 'pre':
                        $code = '';
                        $language = '';
                        foreach ($node->childNodes as $child) {
                            if ($child->nodeName === 'code') {
                                $code = $this->getInnerMarkdown($child);
                                $class = $child->getAttribute('class');
                                if (preg_match('/language-(\w+)/', $class, $matches)) {
                                    $language = $matches[1];
                                }
                                break;
                            }
                        }
                        $markdown .= "```$language\n" . trim($code) . "\n```\n\n";
                        break;
                    case 'code':
                        $content = $this->getInnerMarkdown($node);
                        $maxBackticks = preg_match_all('/`+/', $content, $matches) ? max(array_map('strlen', $matches[0])) : 0;
                        $delim = str_repeat('`', $maxBackticks + 1);
                        $markdown .= $delim . $content . $delim;
                        break;
                    case 'a':
                        $href = $node->getAttribute('href');
                        $title = $node->getAttribute('title');
                        $content = $this->getInnerMarkdown($node);
                        $title = $title ? ' "' . $title . '"' : '';
                        $markdown .= '[' . $content . '](' . $href . $title . ')';
                        break;
                    case 'img':
                        $src = $node->getAttribute('src');
                        $alt = $node->getAttribute('alt');
                        $title = $node->getAttribute('title');
                        $title = $title ? ' "' . $title . '"' : '';
                        $markdown .= '![' . $alt . '](' . $src . $title . ')';
                        break;
                    case 'strong':
                    case 'b':
                        $content = $this->getInnerMarkdown($node);
                        $markdown .= '**' . $content . '**';
                        break;
                    case 'em':
                    case 'i':
                        $content = $this->getInnerMarkdown($node);
                        $markdown .= '*' . $content . '*';
                        break;
                    case 'del':
                        $content = $this->getInnerMarkdown($node);
                        $markdown .= '~~' . $content . '~~';
                        break;
                    case 'hr':
                        $markdown .= "---\n\n";
                        break;
                    case 'br':
                        $markdown .= "  \n";
                        break;
                    default:
                        $markdown .= $this->getInnerMarkdown($node);
                        break;
                }
                break;
        }
        return $markdown;
    }

    private function getInnerMarkdown($node)
    {
        $markdown = '';
        foreach ($node->childNodes as $child) {
            $markdown .= $this->processNode($child);
        }
        return trim($markdown);
    }
}