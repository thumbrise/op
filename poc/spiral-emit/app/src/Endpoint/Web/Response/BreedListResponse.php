<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class BreedListResponse
{
    /**
     * @param array{array{id: string, name: string, size: string}} $breeds
     */
    public function __construct(
        public array $breeds,
        public int $total,
    ) {}
}
