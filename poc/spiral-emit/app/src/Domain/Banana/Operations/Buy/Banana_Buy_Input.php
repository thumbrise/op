<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Buy;

class Banana_Buy_Input
{
    public function __construct(
        public string $variety,
        public int $quantity,
        public int $budget,
        public bool $express = false,
        public ?string $deliveryAddress = null,
    ) {}
}
