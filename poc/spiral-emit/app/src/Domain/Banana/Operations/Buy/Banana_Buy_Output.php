<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Buy;

class Banana_Buy_Output
{
    public function __construct(
        public string $orderId,
        public string $status,
        public string $bananaId,
        public int $totalPriceCents,
    ) {}
}
