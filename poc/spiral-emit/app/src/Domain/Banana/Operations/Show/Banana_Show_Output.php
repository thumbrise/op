<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Show;

class Banana_Show_Output
{
    public function __construct(
        public string $id,
        public string $variety,
        public string $ripeness,
        public int $weightGrams,
        public int $priceCents,
        public string $origin,
    ) {}
}
