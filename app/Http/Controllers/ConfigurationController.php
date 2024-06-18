<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Configuration');
    }
}
