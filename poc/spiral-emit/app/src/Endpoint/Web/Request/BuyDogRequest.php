<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Model\FilterInterface;

final class BuyDogRequest implements FilterInterface
{
    public string $breed;

    public int $budget;

    public bool $express = false;

    public ?string $deliveryAddress = null;
}
