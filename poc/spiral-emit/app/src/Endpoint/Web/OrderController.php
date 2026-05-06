<?php

declare(strict_types=1);

namespace App\Endpoint\Web;

use App\Endpoint\Web\Request\OrderCancelRequest;
use App\Endpoint\Web\Request\OrderListRequest;
use App\Endpoint\Web\Request\OrderShowRequest;
use App\Endpoint\Web\Response\OrderCancelResponse;
use App\Endpoint\Web\Response\OrderListResponse;
use App\Endpoint\Web\Response\OrderShowResponse;
use Spiral\Router\Annotation\Route;

final class OrderController
{
    #[Route(route: '/orders', name: 'orders.list', methods: 'GET')]
    public function list(OrderListRequest $request): OrderListResponse
    {
        return new OrderListResponse(
            orders: [
                ['id' => 'ord_1', 'status' => 'delivered', 'totalCents' => 15000],
                ['id' => 'ord_2', 'status' => 'pending', 'totalCents' => 25000],
            ],
            total: 2,
        );
    }

    #[Route(route: '/orders/<id>', name: 'orders.show', methods: 'GET')]
    public function show(OrderShowRequest $request): OrderShowResponse
    {
        return new OrderShowResponse(
            id: $request->id,
            status: 'pending',
            totalCents: 15000,
            dog: [
                'id'   => '1',
                'name' => 'Rex',
            ],
        );
    }

    #[Route(route: '/orders/<id>/cancel', name: 'orders.cancel', methods: 'POST')]
    public function cancel(OrderCancelRequest $request): OrderCancelResponse
    {
        return new OrderCancelResponse(
            id: $request->id,
            cancelled: true,
        );
    }
}
