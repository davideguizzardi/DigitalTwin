<?php

namespace App\Http\Controllers\Pages;

use App\Models\Map;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;

class ConfigurationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('Configuration', [
            'maps' => Map::all()
        ]);
    }
}
