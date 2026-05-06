<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Model\FilterInterface;

final class OrderShowRequest implements FilterInterface
{
    public string $id;
}
