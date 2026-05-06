<?php

declare(strict_types=1);

namespace App\Endpoint\Web\Request;

use Spiral\Filter\Filterable;

final class DogShowRequest implements Filterable
{
    public string $breed;

    public bool $includeVaccinations = false;
}
