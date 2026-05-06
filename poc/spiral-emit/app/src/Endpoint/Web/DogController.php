<?php

declare(strict_types=1);

namespace App\Endpoint\Web;

use App\Endpoint\Web\Request\BreedListRequest;
use App\Endpoint\Web\Request\BuyDogRequest;
use App\Endpoint\Web\Request\DogShowRequest;
use App\Endpoint\Web\Response\BreedListResponse;
use App\Endpoint\Web\Response\BuyDogResponse;
use App\Endpoint\Web\Response\DogShowResponse;
use Spiral\Router\Annotation\Route;

use function bin2hex;
use function random_bytes;

final class DogController
{
    #[Route(route: '/dogs', name: 'dogs.list', methods: 'GET')]
    public function list(BreedListRequest $request): BreedListResponse
    {
        return new BreedListResponse(
            breeds: [
                ['id' => 'labrador', 'name' => 'Labrador Retriever', 'size' => 'large'],
                ['id' => 'golden', 'name' => 'Golden Retriever', 'size' => 'large'],
                ['id' => 'bulldog', 'name' => 'Bulldog', 'size' => 'medium'],
            ],
            total: 3,
        );
    }

    #[Route(route: '/dogs/<breed>', name: 'dogs.show', methods: 'GET')]
    public function show(DogShowRequest $request): DogShowResponse
    {
        return new DogShowResponse(
            id: 'dog_' . $request->breed,
            name: 'Rex',
            breed: $request->breed,
            ageYears: 3,
            priceCents: 50000,
        );
    }

    #[Route(route: '/dogs/buy', name: 'dogs.buy', methods: 'POST')]
    public function buy(BuyDogRequest $request): BuyDogResponse
    {
        return new BuyDogResponse(
            orderId: 'ord_' . bin2hex(random_bytes(8)),
            status: 'confirmed',
            dogId: 'dog_' . $request->breed,
            totalPriceCents: $request->budget,
        );
    }
}
