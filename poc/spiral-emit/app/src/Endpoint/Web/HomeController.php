<?php

declare(strict_types=1);

namespace App\Endpoint\Web;

use Spiral\Router\Annotation\Route;

final class HomeController
{
    #[Route(route: '/', name: 'index')]
    public function index(): string
    {
        return '<h1>Banana Shop</h1>';
    }
}
