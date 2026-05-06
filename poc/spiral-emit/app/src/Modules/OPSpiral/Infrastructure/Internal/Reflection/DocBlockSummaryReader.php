<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure\Internal\Reflection;

use phpDocumentor\Reflection\DocBlockFactory;
use ReflectionMethod;

class DocBlockSummaryReader
{
    /**
     * @todo Wrong docblock for method WITHOUT docblock, if above exist use trait WITH docblock
     */
    public function read(ReflectionMethod $method): string
    {
        $v = $method->getDocComment();
        if (empty($v)) {
            return '';
        }

        $factory  = DocBlockFactory::createInstance();
        $docBlock = $factory->create($v);

        return $docBlock->getSummary();
    }
}
