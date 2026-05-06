<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure\Internal\Reflection;
use ReflectionProperty;

class PropertyReader
{
    public function read(object $object, string $property): mixed
    {
        $ref = new ReflectionProperty($object, $property);

        return $ref->getValue($object);
    }
}
