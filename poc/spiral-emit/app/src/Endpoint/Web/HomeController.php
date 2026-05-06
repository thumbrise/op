<?php

declare(strict_types=1);

namespace App\Endpoint\Web;

use Exception;
use Spiral\Prototype\Traits\PrototypeTrait;
use Spiral\Router\Annotation\Route;
use Thumbrise\OP\Universal\Schema\Attributes\OPComment;
use Thumbrise\OP\Universal\Schema\Attributes\OPError;
use Thumbrise\OP\Universal\Schema\Attributes\OPID;
use Thumbrise\OP\Universal\Schema\Attributes\OPTrait;
use Thumbrise\OP\Universal\Schema\Term;
use Thumbrise\OP\Universal\Vendors\Http\Path;
use Thumbrise\OP\Universal\Vendors\Http\Status;
use Thumbrise\OP\Universal\Vendors\Http\Verb;

/**
 * Simple home page controller. It renders home page template and also provides
 * an example of exception page.
 */
final class HomeController
{
    /**
     * Read more about Prototyping:
     *
     * @see https://spiral.dev/docs/basics-prototype/#installation
     */
    use PrototypeTrait;

    /**
     * Render home page html from docblock.
     */
    #[OPID(value: 'HomeRenderHTML')]
    #[OPComment(value: 'Render home page html from attribute. Has priority under docblock')]
    #[Route(route: '/', name: 'index')]
    public function index(): string
    {
        return $this->views->render('home');
    }

    /**
     * Example of exception page.
     */
    #[OPID(value: 'HomeException')]
    #[OPComment(value: 'Throws Exception')]
    #[OPError([
        new Term('TestException', 'This is a test exception.', trait: [
            new Status('500'),
        ]),
    ])]
    #[OPTrait([
        new Path('/exception'),
        new Verb('GET'),
    ])]
    #[Route(route: '/exception', name: 'exception')]
    public function exception(): never
    {
        throw new Exception('This is a test exception.');
    }
}
