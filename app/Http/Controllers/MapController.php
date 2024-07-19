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
        $files = $request->file();
        $maps = $request->all();
        $directory = 'public/maps';
        
        for ($i=0; $i < count($maps); $i++) { 
            $floor = $maps[$i]["floor"];
            $file = $maps[$i]["file"];
            $extension = $file->getClientOriginalExtension();
            $fileName = 'map_' . $floor . '.' . $extension;
            $path = $file->storeAs($directory, $fileName);
            $url = "storage/maps/" . $fileName;
            Map::create(["floor" => $floor, "url" => $url]);
        }

        return redirect('dashboard');
    }
}
