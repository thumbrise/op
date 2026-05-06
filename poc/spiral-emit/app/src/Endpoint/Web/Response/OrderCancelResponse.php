<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class OrderCancelResponse
{
    public function __construct(
        public string $id,
        public bool $cancelled,
    ) {}
}
