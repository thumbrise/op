<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Attribute\Input\Post;
use Spiral\Filters\Model\FilterInterface;

final class BuyBananaRequest implements FilterInterface
{
    #[Post]
    public string $variety;

    #[Post]
    public int $quantity;

    #[Post]
    public int $budget;

    #[Post]
    public bool $express = false;

    #[Post]
    public ?string $deliveryAddress = null;
}
