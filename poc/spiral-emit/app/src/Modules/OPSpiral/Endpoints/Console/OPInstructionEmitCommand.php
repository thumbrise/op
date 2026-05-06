<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Endpoints\Console;

use App\Modules\OPSpiral\Infrastructure\InstructionEmitter;
use Spiral\Console\Attribute\AsCommand;
use Spiral\Console\Command;

#[AsCommand(name: 'op:instruction:emit', description: 'Emit OP instruction')]
final class OPInstructionEmitCommand extends Command
{
    public function __invoke(InstructionEmitter $emitter): int
    {
        $this->info(json_encode($emitter->emit(), JSON_THROW_ON_ERROR));

        return self::SUCCESS;
    }
}
