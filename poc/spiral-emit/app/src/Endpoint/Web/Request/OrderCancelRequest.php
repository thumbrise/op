<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filter\Filterable;

final class OrderCancelRequest implements Filterable
{
    public string $id;

    public ?string $reason = null;
}
