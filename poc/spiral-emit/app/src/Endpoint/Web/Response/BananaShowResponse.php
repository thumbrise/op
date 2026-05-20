<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class BananaShowResponse
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
