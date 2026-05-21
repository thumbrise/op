<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\List;

class Banana_List_Output
{
    /**
     * @param array{array{id: string, variety: string, ripeness: string, origin: string}} $bananas
     */
    public function __construct(
        public array $bananas,
        public int $total,
    ) {}
}
