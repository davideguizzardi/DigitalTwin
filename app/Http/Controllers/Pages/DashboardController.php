<?php

namespace App\Http\Controllers\Pages;

use App\Models\Map;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function show($firstAccess = false): Response
    {
        $user = Auth::user();
        $token = $user->createToken("auth-api")->plainTextToken;

        return Inertia::render('Dashboard', [
            'maps' => Map::all(),
            'token' => $token
        ]);
    }



}
