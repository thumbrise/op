<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class BuyBananaResponse
{
    public function __construct(
        public string $orderId,
        public string $status,
        public string $bananaId,
        public int $totalPriceCents,
    ) {}
}
