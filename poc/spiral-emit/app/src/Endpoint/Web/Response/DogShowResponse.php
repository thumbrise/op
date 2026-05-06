<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Response;

final class DogShowResponse
{
    public function __construct(
        public string $id,          // UUID
        public string $name,
        public string $breed,
        public int $ageYears,
        public int $priceCents,
    ) {}
}
