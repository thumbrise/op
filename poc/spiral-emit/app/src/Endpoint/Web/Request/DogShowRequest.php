<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filters\Model\FilterInterface;

final class DogShowRequest implements FilterInterface
{
    public string $breed;

    public bool $includeVaccinations = false;
}
