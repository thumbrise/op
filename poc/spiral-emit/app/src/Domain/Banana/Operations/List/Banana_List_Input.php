<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\List;

class Banana_List_Input
{
    public function __construct(
        public ?string $variety = null,
        public ?string $ripeness = null,
        public ?int $limit = null,
        public ?int $offset = null,
    ) {}
}
