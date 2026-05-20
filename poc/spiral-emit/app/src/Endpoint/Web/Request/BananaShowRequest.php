<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Attribute\Input\Path;
use Spiral\Filters\Attribute\Input\Query;
use Spiral\Filters\Model\FilterInterface;

final class BananaShowRequest implements FilterInterface
{
    #[Path]
    public string $variety;

    #[Query]
    public bool $includeNutrition = false;
}
