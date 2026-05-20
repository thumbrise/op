<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class BananaListResponse
{
    /**
     * @param array{array{id: string, variety: string, ripeness: string, origin: string}} $bananas
     */
    public function __construct(
        public array $bananas,
        public int $total,
    ) {}
}
