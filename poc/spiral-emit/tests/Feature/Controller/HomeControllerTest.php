<?php

declare(strict_types=1);

namespace Tests\Feature\Controller;

use Spiral\Bootloader\I18nBootloader;
use Spiral\Testing\Http\FakeHttp;
use Tests\TestCase;

use function in_array;
use function strip_tags;

/**
 * @internal
 *
 * @coversNothing
 */
class HomeControllerTest extends TestCase
{
    private FakeHttp $http;

    protected function setUp(): void
    {
        parent::setUp();

        $this->http = $this->fakeHttp();
    }

    public function testDefaultActionWorks(): void
    {
        $response = $this->http->get('/')->assertOk();

        $this->assertStringContainsString(
            'The PHP Framework for future Innovators',
            strip_tags((string) $response->getOriginalResponse()->getBody()),
        );
    }

    public function testDefaultActionWithRuLocale(): void
    {
        if (! in_array(I18nBootloader::class, $this->getRegisteredBootloaders())) {
            $this->markTestSkipped('Component `spiral/translator` is not installed.');
        }

        $response = $this->http->withHeader('accept-language', 'ru')->get('/')->assertOk();

        $this->assertStringContainsString(
            'PHP Framework для будущих инноваторов',
            strip_tags((string) $response->getOriginalResponse()->getBody()),
        );
    }

    public function testInteractWithConsole(): void
    {
        $output = $this->runCommand('views:reset');

        $this->assertStringContainsString('cache', $output);
    }
}
