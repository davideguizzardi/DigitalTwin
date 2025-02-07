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
        $maps = Map::all();

        if($firstAccess){
            $token = $user->createToken("auth-api")->plainTextToken;
            if ($maps->isEmpty()) {
                return Inertia::render('FirstConfigurationPage', [
                    'maps' => $maps ,
                    'isFirstConfiguration'=>TRUE,
                    'token' => $token
                ]);
            }
            return Inertia::render('Dashboard3', [
                'maps' => $maps ,
                'token' => $token
            ]);
        }
        if ($maps->isEmpty()) {
            return Inertia::render('FirstConfigurationPage', [
                'maps' => $maps ,
                'isFirstConfiguration'=>TRUE,
            ]);
        }
        return Inertia::render('Dashboard3', [
            'maps' => $maps 
        ]);
    }



}
