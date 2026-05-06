<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class BuyDogResponse
{
    public function __construct(
        public string $orderId,
        public string $status,
        public string $dogId,
        public int $totalPriceCents,
    ) {}
}
