/**
 * Presets for Playground — полные инструкции (Instruction).
 * Каждый preset = полная программа (version, id, comment, trait, operations).
 */

import type {Instruction} from '@op-sdk'

export interface Preset {
  id: string
  name: string
  json: string
}

// Dog Shop — полная инструкция
const dogShopInstruction: Instruction = {
  version: '1.0.0',
  id: 'dog-shop',
  comment: 'Dog Shop API — demonstrates HTTP, CLI, errors, nested objects, arrays, enums, traits',
  trait: [],
  operations: [
    {
      id: 'BuyDog',
      comment: 'Purchase a dog by breed with a budget limit. Demonstrates object composition, enum choice, and compound traits.',
      input: [
        {id: 'breed', kind: 'string', required: true, comment: 'Exact breed name, e.g. "labrador"'},
        {id: 'budget', kind: 'integer', required: true, comment: 'Maximum price in cents'},
        {id: 'express', kind: 'boolean', comment: 'Next-day delivery'},
        {id: 'deliveryAddress', kind: 'object', comment: 'Where to deliver the dog', of: [
          {id: 'street', kind: 'string', comment: 'Street name and number'},
          {id: 'city', kind: 'string', comment: 'City name'},
          {id: 'zip', kind: 'string', comment: 'Postal code, not an archive'},
          {id: 'country', kind: 'string', value: 'US', comment: 'ISO 3166-1 alpha-2'},
        ]},
        {id: 'preferredSize', kind: 'enum', comment: 'Desired dog size category', of: [
          {id: 'small', comment: 'Up to 10 kg'},
          {id: 'medium', comment: '10–25 kg'},
          {id: 'large', comment: 'Over 25 kg'},
        ]},
      ],
      output: [
        {id: 'orderId', kind: 'string', comment: 'UUID of the created order'},
        {id: 'dog', kind: 'object', comment: 'The matched dog', of: [
          {id: 'id', kind: 'string', comment: 'UUID of the dog'},
          {id: 'name', kind: 'string', comment: 'The name the shelter gave it'},
          {id: 'breed', kind: 'string', comment: 'Breed name'},
          {id: 'birthDate', kind: 'datetime', comment: 'Date of birth'},
          {id: 'weightKg', kind: 'float', comment: 'Weight at last checkup'},
          {id: 'vaccinated', kind: 'boolean', comment: 'Whether the dog is vaccinated'},
        ]},
        {id: 'totalPrice', kind: 'float', comment: 'Final price including delivery, in cents'},
      ],
      error: [
        {id: 'BreedNotFound', comment: 'No such breed in our catalog'},
        {id: 'BudgetExceeded', comment: 'All matching dogs cost more than budget'},
        {id: 'OutOfStock', comment: 'Breed exists but no dogs available right now'},
        {id: 'DeliveryUnavailable', comment: 'We do not deliver to this address'},
      ],
      trait: [
        {id: 'http/method', value: 'POST', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/dogs/buy', comment: 'URL path for this operation'},
        {id: 'auth/type', value: 'bearer', comment: 'Authentication scheme'},
        {id: 'otel/span', value: 'BuyDog', comment: 'OpenTelemetry span name'},
        {id: 'resilience/retry', kind: 'object', comment: 'Retry policy for transient failures', of: [
          {id: 'maxAttempts', kind: 'integer', value: 3, comment: 'Maximum number of retry attempts'},
          {id: 'backoff', kind: 'enum', comment: 'Delay growth strategy between retries', of: [
            {id: 'linear', comment: 'Fixed delay between attempts'},
            {id: 'exponential', comment: 'Doubling delay between attempts'},
          ]},
          {id: 'delayMs', kind: 'integer', value: 500, comment: 'Initial delay in milliseconds'},
        ]},
        {id: 'cli/command', value: 'buy-dog', comment: 'CLI command name for this operation'},
      ],
    },
    {
      id: 'ListBreeds',
      comment: 'Get all available dog breeds with optional size filter. Demonstrates array output and enum input.',
      input: [
        {id: 'size', kind: 'enum', comment: 'Filter by dog size, or "any" for all', of: [
          {id: 'small', comment: 'Up to 10 kg'},
          {id: 'medium', comment: '10–25 kg'},
          {id: 'large', comment: 'Over 25 kg'},
          {id: 'any', comment: 'No size filter — return all breeds'},
        ]},
      ],
      output: [
        {id: 'breeds', kind: 'array', comment: 'List of available breeds', of: [
          {id: 'breed', kind: 'object', comment: 'A single breed entry', of: [
            {id: 'name', kind: 'string', comment: 'Breed name'},
            {id: 'size', kind: 'string', comment: 'Size category'},
            {id: 'avgPriceUsd', kind: 'float', comment: 'Average market price in USD'},
            {id: 'available', kind: 'boolean', comment: 'At least one dog in stock'},
          ]},
        ]},
      ],
      error: [],
      trait: [
        {id: 'http/method', value: 'GET', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/breeds', comment: 'URL path for this operation'},
        {id: 'cli/command', value: 'list-breeds', comment: 'CLI command name for this operation'},
      ],
    },
    {
      id: 'GetOrder',
      comment: 'Retrieve order details by ID. Demonstrates nested objects and datetime.',
      input: [
        {id: 'orderId', kind: 'string', required: true, comment: 'UUID of the order'},
      ],
      output: [
        {id: 'order', kind: 'object', comment: 'The order object', of: [
          {id: 'id', kind: 'string', comment: 'UUID of the order'},
          {id: 'status', kind: 'enum', comment: 'Current lifecycle stage', of: [
            {id: 'pending', comment: 'Order placed, not yet confirmed'},
            {id: 'confirmed', comment: 'Order confirmed by the shop'},
            {id: 'shipped', comment: 'Dog is on the way'},
            {id: 'delivered', comment: 'Dog delivered to the owner'},
            {id: 'cancelled', comment: 'Order was cancelled'},
          ]},
          {id: 'createdAt', kind: 'datetime', comment: 'When the order was placed'},
          {id: 'dog', kind: 'object', comment: 'Snapshot of the dog at purchase time', of: [
            {id: 'id', kind: 'string', comment: 'UUID of the dog'},
            {id: 'name', kind: 'string', comment: 'Name of the dog'},
            {id: 'breed', kind: 'string', comment: 'Breed name'},
          ]},
          {id: 'totalPrice', kind: 'float', comment: 'Total price in cents'},
          {id: 'express', kind: 'boolean', comment: 'Whether express delivery was chosen'},
        ]},
      ],
      error: [
        {id: 'OrderNotFound', comment: 'No order with this ID exists'},
        {id: 'Unauthorized', comment: 'You do not have access to this order'},
      ],
      trait: [
        {id: 'http/method', value: 'GET', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/orders/{orderId}', comment: 'URL path for this operation'},
        {id: 'auth/type', value: 'bearer', comment: 'Authentication scheme'},
        {id: 'otel/span', value: 'GetOrder', comment: 'OpenTelemetry span name'},
      ],
    },
    {
      id: 'UploadVaccineCard',
      comment: 'Upload a vaccine card scan for a dog. Demonstrates binary input.',
      input: [
        {id: 'dogId', kind: 'string', required: true, comment: 'UUID of the dog'},
        {id: 'scan', kind: 'binary', required: true, comment: 'JPEG or PNG scan of the vaccine card'},
        {id: 'issueDate', kind: 'datetime', comment: 'When the card was issued by the vet'},
      ],
      output: [
        {id: 'cardId', kind: 'string', comment: 'UUID of the uploaded card'},
        {id: 'verified', kind: 'boolean', comment: 'Whether the card passed automated verification'},
      ],
      error: [
        {id: 'DogNotFound', comment: 'No dog with this ID exists'},
        {id: 'InvalidFile', comment: 'Not a readable image'},
        {id: 'FileTooLarge', comment: 'Exceeds 10 MB limit'},
      ],
      trait: [
        {id: 'http/method', value: 'POST', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/dogs/{dogId}/vaccine-card', comment: 'URL path for this operation'},
        {id: 'auth/type', value: 'bearer', comment: 'Authentication scheme'},
      ],
    },
    {
      id: 'CancelOrder',
      comment: 'Cancel a pending order. Demonstrates operation with minimal output and multiple error paths.',
      input: [
        {id: 'orderId', kind: 'string', required: true, comment: 'UUID of the order to cancel'},
        {id: 'reason', kind: 'string', comment: 'Reason for cancellation'},
      ],
      output: [
        {id: 'cancelled', kind: 'boolean', comment: 'Whether the order was successfully cancelled'},
      ],
      error: [
        {id: 'OrderNotFound', comment: 'No order with this ID exists'},
        {id: 'OrderAlreadyShipped', comment: 'Cannot cancel — the dog is already on the way'},
        {id: 'OrderAlreadyCancelled', comment: 'This order has already been cancelled'},
        {id: 'Unauthorized', comment: 'You do not have access to this order'},
      ],
      trait: [
        {id: 'http/method', value: 'POST', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/orders/{orderId}/cancel', comment: 'URL path for this operation'},
        {id: 'auth/type', value: 'bearer', comment: 'Authentication scheme'},
        {id: 'cli/command', value: 'cancel-order', comment: 'CLI command name for this operation'},
        {id: 'resilience/timeout', kind: 'object', comment: 'Timeout policy for this operation', of: [
          {id: 'ms', kind: 'integer', value: 5000, comment: 'Timeout in milliseconds'},
        ]},
      ],
    },
    {
      id: 'SearchDogs',
      comment: 'Full-text search across available dogs. Demonstrates array of objects with pagination.',
      input: [
        {id: 'query', kind: 'string', required: true, comment: 'Free-text search query'},
        {id: 'limit', kind: 'integer', value: 20, comment: 'Maximum number of results to return'},
        {id: 'offset', kind: 'integer', value: 0, comment: 'Number of results to skip for pagination'},
        {id: 'filters', kind: 'object', comment: 'Optional filters to narrow the search', of: [
          {id: 'minPrice', kind: 'float', comment: 'Minimum price in cents'},
          {id: 'maxPrice', kind: 'float', comment: 'Maximum price in cents'},
          {id: 'vaccinated', kind: 'boolean', comment: 'Only show vaccinated dogs'},
          {id: 'sizes', kind: 'array', comment: 'Filter by size categories', of: [
            {id: 'size', kind: 'string', comment: 'Size category: small, medium, or large'},
          ]},
        ]},
      ],
      output: [
        {id: 'total', kind: 'integer', comment: 'Total number of matching dogs'},
        {id: 'dogs', kind: 'array', comment: 'List of matching dogs', of: [
          {id: 'dog', kind: 'object', comment: 'A single dog entry', of: [
            {id: 'id', kind: 'string', comment: 'UUID of the dog'},
            {id: 'name', kind: 'string', comment: 'Name of the dog'},
            {id: 'breed', kind: 'string', comment: 'Breed name'},
            {id: 'priceUsd', kind: 'float', comment: 'Price in USD'},
            {id: 'photoUrl', kind: 'string', comment: 'URL of the dog\'s photo'},
          ]},
        ]},
      ],
      error: [
        {id: 'InvalidQuery', comment: 'The search query is malformed or empty'},
      ],
      trait: [
        {id: 'http/method', value: 'GET', comment: 'HTTP method for this operation'},
        {id: 'http/path', value: '/dogs/search', comment: 'URL path for this operation'},
        {id: 'cli/command', value: 'search-dogs', comment: 'CLI command name for this operation'},
        {id: 'otel/span', value: 'SearchDogs', comment: 'OpenTelemetry span name'},
      ],
    },
  ],
}

export const presets: Preset[] = [
  {
    id: 'dog-shop',
    name: 'Dog Shop API',
    json: JSON.stringify(dogShopInstruction),
  },
]

export function getPreset(index: number): Preset | undefined {
  return presets[index]
}

export function getPresetById(id: string): Preset | undefined {
  return presets.find(p => p.id === id)
}

// Legacy compatibility - create empty operation
export function emptyOperation() {
  return {
    id: '',
    comment: '',
    input: [],
    output: [],
    error: [],
    trait: [],
  }
}