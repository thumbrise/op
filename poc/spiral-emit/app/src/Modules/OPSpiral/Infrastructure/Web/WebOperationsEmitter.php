<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure\Web;

use App\Modules\OPSpiral\Infrastructure\Web\Internal\RouteParser;
use Spiral\Router\RouterInterface;
use Thumbrise\OP\Universal\Schema\Operation;

class WebOperationsEmitter
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly RouteParser $routeParser,
    ) {}

    /** @return Operation[] */
    public function emit(): array
    {
        /** @var Operation[] $result */
        $result = [];
        $routes = $this->router->getRoutes();
        foreach ($routes as $key => $route) {
            $result[] = $this->routeParser->parse($key, $route);
        }

        return $result;
    }
}
