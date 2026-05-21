<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Show;

class Banana_Show
{
    public function __invoke(Banana_Show_Input $input): Banana_Show_Output
    {
        return new Banana_Show_Output(
            id: 'banana_' . $input->variety,
            variety: $input->variety,
            ripeness: 'yellow',
            weightGrams: 120,
            priceCents: 150,
            origin: 'Ecuador',
        );
    }
}
