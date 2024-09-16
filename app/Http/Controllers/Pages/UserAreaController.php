<?php

namespace App\Http\Controllers\Pages;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;

class UserAreaController extends Controller
{
    public function get(Request $request): Response
    {
        return Inertia::render('UserArea', 
            ["user" => Auth::user()]);
    }
}
