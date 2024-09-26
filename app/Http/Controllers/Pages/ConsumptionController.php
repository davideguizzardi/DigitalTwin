<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsumptionController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Consumption');
    }
}
