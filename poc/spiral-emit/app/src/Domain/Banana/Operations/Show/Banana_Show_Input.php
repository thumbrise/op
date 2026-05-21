<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Show;

class Banana_Show_Input
{
    public function __construct(
        public string $variety,
        public bool $includeNutrition = false,
    ) {}
}
