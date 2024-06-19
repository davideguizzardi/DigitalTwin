<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;

class MapController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $maps = $request->file();
        $counter=0;
        foreach($maps as $map){
            $extension = $map->getClientOriginalExtension();
            $path = $map->storeAs('public/maps', 'map_' . $counter . '.'  . $extension);
            $counter=$counter+1;
        }
        return redirect('dashboard');
    }
}
