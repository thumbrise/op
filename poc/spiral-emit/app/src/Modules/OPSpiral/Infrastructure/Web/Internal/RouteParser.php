<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure\Web\Internal;

use App\Modules\OPSpiral\Infrastructure\Internal\Reflection\DocBlockSummaryReader;
use App\Modules\OPSpiral\Infrastructure\Internal\Reflection\PropertyReader;
use ReflectionMethod;
use RuntimeException;
use Spatie\Attributes\Attributes;
use Spiral\Router\Route;
use Spiral\Router\Target\Action;
use Thumbrise\OP\Universal\Schema\Attributes\OPComment;
use Thumbrise\OP\Universal\Schema\Attributes\OPError;
use Thumbrise\OP\Universal\Schema\Attributes\OPID;
use Thumbrise\OP\Universal\Schema\Attributes\OPInput;
use Thumbrise\OP\Universal\Schema\Attributes\OPOutput;
use Thumbrise\OP\Universal\Schema\Attributes\OPTrait;
use Thumbrise\OP\Universal\Schema\Operation;
use Thumbrise\OP\Universal\Schema\Term;

class RouteParser
{
    public function __construct(
        private readonly PropertyReader $propertyReader,
        private readonly DocBlockSummaryReader $docBlockSummaryReader,
    ) {}

    public function parse(string $routeKey, Route $route): Operation
    {
        $target = $route->getTarget();
        if (! $target instanceof Action) {
            throw new RuntimeException(sprintf(
                'Unsupported route target type: %s',
                is_object($target) ? $target::class : gettype($target),
            ));
        }
        $controller       = $this->propertyReader->read($target, 'controller');
        $action           = $this->propertyReader->read($target, 'action');
        $reflectionMethod = new ReflectionMethod($controller, $action);

        $idAttr      = $this->readAttribute($controller, $action, OPID::class);
        $commentAttr = $this->readAttribute($controller, $action, OPComment::class);
        $inputAttr   = $this->readAttribute($controller, $action, OPInput::class);
        $outputAttr  = $this->readAttribute($controller, $action, OPOutput::class);
        $errorAttr   = $this->readAttribute($controller, $action, OPError::class);
        $traitAttr   = $this->readAttribute($controller, $action, OPTrait::class);

        $id      = $idAttr->value      ?? $routeKey;
        $comment = $commentAttr->value ?? $this->suggestComment($reflectionMethod);
        $input   = $inputAttr->values  ?? $this->suggestInput($reflectionMethod);
        $output  = $outputAttr->values ?? $this->suggestOutput($reflectionMethod);
        $error   = $errorAttr->values  ?? $this->suggestError($reflectionMethod);
        $trait   = $traitAttr->values  ?? $this->suggestTrait($reflectionMethod);

        return new Operation(
            id: $id,
            comment: $comment,
            input: $input,
            output: $output,
            error: $error,
            trait: $trait,
        );
    }

    /**
     * @template T of object
     *
     * @param null|class-string<T> $attribute
     *
     * @return null|T
     */
    private function readAttribute($controller, $action, $attribute): ?object
    {
        return Attributes::onMethod($controller, $action, $attribute);
    }

    private function suggestComment(ReflectionMethod $reflectionMethod): string
    {
        return $this->docBlockSummaryReader->read($reflectionMethod);
    }

    /**
     * @return array<Term>
     */
    private function suggestInput(ReflectionMethod $reflectionMethod): array
    {
        return [];
    }

    /**
     * @return array<Term>
     */
    private function suggestOutput(ReflectionMethod $reflectionMethod): array
    {
        return [];
    }

    /**
     * @return array<Term>
     */
    private function suggestError(ReflectionMethod $reflectionMethod): array
    {
        return [];
    }

    /**
     * @return array<Term>
     */
    private function suggestTrait(ReflectionMethod $reflectionMethod): array
    {
        return [];
    }
}
