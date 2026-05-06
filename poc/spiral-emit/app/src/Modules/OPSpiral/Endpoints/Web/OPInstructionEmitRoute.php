<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Endpoints\Web;

use App\Modules\OPSpiral\Infrastructure\InstructionEmitter;
use Psr\Http\Message\ResponseInterface;
use Spiral\Http\ResponseWrapper;
use Spiral\Router\Annotation\Route;

class OPInstructionEmitRoute
{
    #[Route('/op/instruction', name: 'op.instruction.emit', methods: ['GET'])]
    public function __invoke(InstructionEmitter $emitter, ResponseWrapper $response): ResponseInterface
    {
        $instruction = $emitter->emit();

        $r = $response->create(200)->withHeader('Content-Type', 'text/yaml');

        $r->getBody()->write($instruction->toYaml());

        return $r;
    }
}
