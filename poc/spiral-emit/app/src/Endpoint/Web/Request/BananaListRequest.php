<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Attribute\Input\Path;
use Spiral\Filters\Attribute\Input\Query;
use Spiral\Filters\Model\FilterInterface;

final class BananaListRequest implements FilterInterface
{
    #[Path]
    public ?string $variety = null;

    #[Query]
    public ?string $ripeness = null;

    #[Query]
    public ?int $limit = null;

    #[Query]
    public ?int $offset = null;
}
