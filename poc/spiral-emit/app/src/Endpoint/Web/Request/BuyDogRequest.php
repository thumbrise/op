<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filter\Filterable;

final class BuyDogRequest implements Filterable
{
    public string $breed;

    public int $budget;

    public bool $express = false;

    public ?string $deliveryAddress = null;
}
