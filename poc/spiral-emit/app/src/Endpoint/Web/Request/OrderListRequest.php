<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Model\FilterInterface;

final class OrderListRequest implements FilterInterface
{
    public ?string $status = null;

    public ?int $limit = null;

    public ?int $offset = null;
}
