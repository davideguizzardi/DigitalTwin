<?php

namespace App\Http\Controllers;

use App\Models\Map;
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
        $directory = 'public/maps';
        foreach($maps as $map){
            $extension = $map->getClientOriginalExtension();
            $fileName = 'map_' . $counter . '.'  . $extension;
            $path = $map->storeAs($directory, $fileName);
            $url = $directory .'/'. $fileName;
            $counter=$counter+1;
            Map::create(['floor' => $counter, "url" => $url]);
        }
        return redirect('dashboard');
    }
}
