<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filter\Filterable;

final class OrderListRequest implements Filterable
{
    public ?string $status = null;

    public ?int $limit = null;

    public ?int $offset = null;
}
