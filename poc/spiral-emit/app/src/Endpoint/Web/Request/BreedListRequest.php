<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filter\Filterable;

final class BreedListRequest implements Filterable
{
    public ?string $size = null;

    public ?int $limit = null;

    public ?int $offset = null;
}
