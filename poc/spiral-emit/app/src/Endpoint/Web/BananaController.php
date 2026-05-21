<?php

declare(strict_types=1);

namespace App\Endpoint\Web;

use App\Domain\Banana\Operations\Buy\Banana_Buy;
use App\Domain\Banana\Operations\Buy\Banana_Buy_Input;
use App\Domain\Banana\Operations\List\Banana_List;
use App\Domain\Banana\Operations\List\Banana_List_Input;
use App\Domain\Banana\Operations\Show\Banana_Show;
use App\Domain\Banana\Operations\Show\Banana_Show_Input;
use App\Endpoint\Web\Request\BananaListRequest;
use App\Endpoint\Web\Request\BananaShowRequest;
use App\Endpoint\Web\Request\BuyBananaRequest;
use OpenApi\Attributes as OA;
use Psr\Http\Message\ResponseInterface;
use Random\RandomException;
use Spiral\Http\ResponseWrapper;
use Spiral\Router\Annotation\Route;
use Thumbrise\OP\Universal\Schema\Attributes\OPComment;
use Thumbrise\OP\Universal\Schema\Attributes\OPID;
use Thumbrise\OP\Universal\Schema\Attributes\OPInput;
use Thumbrise\OP\Universal\Schema\Attributes\OPOutput;
use Thumbrise\OP\Universal\Schema\Attributes\OPTrait;
use Thumbrise\OP\Universal\Schema\Kind;
use Thumbrise\OP\Universal\Schema\Term;
use Thumbrise\OP\Universal\Vendors\Http\Path;
use Thumbrise\OP\Universal\Vendors\Http\Verb;

#[OA\Tag(name: 'bananas', description: 'Banana operations')]
final class BananaController
{
    #[OPID('BananaList')]
    #[OPComment('List available banana varieties')]
    #[OPInput([
        new Term('variety', 'Filter by variety', kind: Kind::String),
        new Term('ripeness', 'Filter by ripeness', kind: Kind::String),
        new Term('limit', 'Max results', kind: Kind::Integer),
        new Term('offset', 'Skip results', kind: Kind::Integer),
    ])]
    #[OPOutput([
        new Term('bananas', 'List of bananas', kind: Kind::Array, of: [
            new Term('id', 'Banana ID', kind: Kind::String),
            new Term('variety', 'Variety name', kind: Kind::String),
            new Term('ripeness', 'Ripeness level', kind: Kind::String),
            new Term('origin', 'Country of origin', kind: Kind::String),
        ]),
        new Term('total', 'Total count', kind: Kind::Integer),
    ])]
    #[OPTrait([new Path('/bananas'), new Verb('GET')])]
    #[Route(route: '/bananas', name: 'bananas.list', methods: 'GET')]
    #[OA\Get(
        path: '/bananas',
        summary: 'List available banana varieties',
        tags: ['bananas'],
        parameters: [
            new OA\Parameter(name: 'variety', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'ripeness', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'offset', in: 'query', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of banana varieties',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'total', type: 'integer'),
                        new OA\Property(
                            property: 'bananas',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'string'),
                                    new OA\Property(property: 'variety', type: 'string'),
                                    new OA\Property(property: 'ripeness', type: 'string'),
                                    new OA\Property(property: 'origin', type: 'string'),
                                ],
                                type: 'object',
                            ),
                        ),
                    ],
                    type: 'object',
                ),
            ),
        ],
    )]
    public function list(BananaListRequest $request, ResponseWrapper $response, Banana_List $operation): ResponseInterface
    {
        $input = new Banana_List_Input(
            variety: $request->variety,
            ripeness: $request->ripeness,
            limit: $request->limit,
            offset: $request->offset,
        );
        $output = $operation($input);

        return $response->json($output);
    }

    #[OPID('BananaShow')]
    #[OPComment('Show details of a specific banana variety')]
    #[OPInput([
        new Term('variety', 'Variety identifier', required: true, kind: Kind::String),
        new Term('includeNutrition', 'Include nutrition data', kind: Kind::Boolean),
    ])]
    #[OPOutput([
        new Term('id', 'Banana ID', kind: Kind::String),
        new Term('variety', 'Variety name', kind: Kind::String),
        new Term('ripeness', 'Ripeness level', kind: Kind::String),
        new Term('weightGrams', 'Weight in grams', kind: Kind::Integer),
        new Term('priceCents', 'Price in cents', kind: Kind::Integer),
        new Term('origin', 'Country of origin', kind: Kind::String),
    ])]
    #[OPTrait([new Path('/bananas/{variety}'), new Verb('GET')])]
    #[Route(route: '/bananas/<variety>', name: 'bananas.show', methods: 'GET')]
    #[OA\Get(
        path: '/bananas/{variety}',
        summary: 'Show details of a specific banana variety',
        tags: ['bananas'],
        parameters: [
            new OA\Parameter(name: 'variety', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Banana variety details',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'string'),
                        new OA\Property(property: 'variety', type: 'string'),
                        new OA\Property(property: 'ripeness', type: 'string'),
                        new OA\Property(property: 'weightGrams', type: 'integer'),
                        new OA\Property(property: 'priceCents', type: 'integer'),
                        new OA\Property(property: 'origin', type: 'string'),
                    ],
                    type: 'object',
                ),
            ),
        ],
    )]
    public function show(BananaShowRequest $request, ResponseWrapper $response, Banana_Show $operation): ResponseInterface
    {
        $input = new Banana_Show_Input(
            variety: $request->variety,
            includeNutrition: $request->includeNutrition,
        );
        $output = $operation($input);

        return $response->json($output);
    }

    /**
     * @throws RandomException
     */
    #[OPID('BuyBanana')]
    #[OPComment('Purchase bananas with optional delivery')]
    #[OPInput([
        new Term('variety', 'Variety to buy', required: true, kind: Kind::String),
        new Term('quantity', 'Number of bananas', required: true, kind: Kind::Integer),
        new Term('budget', 'Maximum budget in cents', required: true, kind: Kind::Integer),
        new Term('express', 'Express delivery', kind: Kind::Boolean),
        new Term('deliveryAddress', 'Delivery address', kind: Kind::String),
    ])]
    #[OPOutput([
        new Term('orderId', 'Order identifier', kind: Kind::String),
        new Term('status', 'Order status', kind: Kind::String),
        new Term('bananaId', 'Purchased banana ID', kind: Kind::String),
        new Term('totalPriceCents', 'Total price in cents', kind: Kind::Integer),
    ])]
    #[OPTrait([new Path('/bananas/buy'), new Verb('POST')])]
    #[Route(route: '/bananas/buy', name: 'bananas.buy', methods: 'POST')]
    #[OA\Post(
        path: '/bananas/buy',
        summary: 'Purchase bananas with optional delivery',
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'variety', type: 'string'),
                    new OA\Property(property: 'quantity', type: 'integer'),
                    new OA\Property(property: 'budget', type: 'integer'),
                    new OA\Property(property: 'express', type: 'boolean'),
                    new OA\Property(property: 'deliveryAddress', type: 'string'),
                ],
                type: 'object',
            ),
        ),
        tags: ['bananas'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Order confirmed',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'orderId', type: 'string'),
                        new OA\Property(property: 'status', type: 'string'),
                        new OA\Property(property: 'bananaId', type: 'string'),
                        new OA\Property(property: 'totalPriceCents', type: 'integer'),
                    ],
                    type: 'object',
                ),
            ),
        ],
    )]
    public function buy(BuyBananaRequest $request, ResponseWrapper $response, Banana_Buy $operation): ResponseInterface
    {
        $input = new Banana_Buy_Input(
            variety: $request->variety,
            quantity: $request->quantity,
            budget: $request->budget,
            express: $request->express,
            deliveryAddress: $request->deliveryAddress,
        );
        $output = $operation($input);

        return $response->json($output);
    }
}
