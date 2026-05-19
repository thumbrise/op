<?php

declare(strict_types=1);

use Spiral\OpenApi\Generator\Parser\ConfigurationParser;
use Spiral\OpenApi\Generator\Parser\OpenApiParser;
use Spiral\OpenApi\Renderer\HtmlRenderer;
use Spiral\OpenApi\Renderer\JsonRenderer;
use Spiral\OpenApi\Renderer\YamlRenderer;

return [
    'documentation' => [
        'info' => [
            'title' => 'My API',
            'description' => 'API documentation',
            'version' => '1.0.0',
        ],
        'servers' => [
            ['url' => 'https://api.example.com', 'description' => 'Production'],
            ['url' => 'http://localhost:8080', 'description' => 'Development'],
        ],
    ],

    'parsers' => [
        ConfigurationParser::class,
        OpenApiParser::class,
    ],

    'renderers' => [
        JsonRenderer::FORMAT => JsonRenderer::class,
        YamlRenderer::FORMAT => YamlRenderer::class,
        HtmlRenderer::FORMAT => HtmlRenderer::class,
    ],

    'paths' => [
        directory('app') . '/src',
    ],

    'exclude' => null,
    'pattern' => '*.php',
    'version' => null,
    'cache_key' => 'swagger_docs',
    'use_cache' => env('DEBUG', false) === false,

    'generator_config' => [
        'operationId' => [
            'hash' => true,
        ],
    ],
];
