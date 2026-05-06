<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure;

use App\Modules\OPSpiral\Infrastructure\Web\WebOperationsEmitter;
use Thumbrise\OP\Universal\Schema\Term;

class InstructionEmitter
{
    public function __construct(
        private readonly WebOperationsEmitter $webOperationsEmitter,
    ) {}

    public function emit(): SerializableInstruction
    {
        $web = $this->webOperationsEmitter->emit();

        $operations = array_merge(
            $web,
            // TODO cli,
            // TODO anything,
        );

        return new SerializableInstruction(
            id: 'Dog shop',
            comment: 'Dowg',
            version: '1.0.0',
            operations: $operations,
            trait: [
                new Term('my/opinion', 'my honest opinion'),
            ],
        );
    }
}
