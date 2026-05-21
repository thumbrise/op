<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\List;

class Banana_List
{
    public function __invoke(Banana_List_Input $input): Banana_List_Output
    {
        return new Banana_List_Output(
            bananas: [
                ['id' => 'cavendish', 'variety' => 'Cavendish', 'ripeness' => 'yellow', 'origin' => 'Ecuador'],
                ['id' => 'plantain', 'variety' => 'Plantain', 'ripeness' => 'green', 'origin' => 'Ghana'],
                ['id' => 'red', 'variety' => 'Red Dacca', 'ripeness' => 'red-purple', 'origin' => 'Costa Rica'],
            ],
            total: 3,
        );
    }
}
