<?php

declare(strict_types=1);

namespace App\Domain\Banana\Operations\Buy;

use Random\RandomException;

class Banana_Buy
{
    /**
     * @throws RandomException
     */
    public function __invoke(Banana_Buy_Input $input): Banana_Buy_Output
    {
        return new Banana_Buy_Output(
            orderId: 'ord_' . bin2hex(random_bytes(8)),
            status: 'confirmed',
            bananaId: 'banana_' . $input->variety,
            totalPriceCents: $input->budget,
        );
    }
}
