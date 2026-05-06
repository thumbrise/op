<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class OrderShowResponse
{
    public function __construct(
        public string $id,
        public string $status,
        public int $totalCents,
        public array $dog,
    ) {}
}
