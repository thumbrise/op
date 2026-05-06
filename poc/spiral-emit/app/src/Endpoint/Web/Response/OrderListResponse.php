<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class OrderListResponse
{
    /**
     * @param array{id: string, status: string, totalCents: int} $orders
     */
    public function __construct(
        public array $orders,
        public int $total,
    ) {}
}
