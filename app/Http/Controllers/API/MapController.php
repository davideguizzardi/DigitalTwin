<?php

namespace App\Http\Controllers\API;

use App\Models\Map;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;
use App\Http\Controllers\Controller;

class MapController extends Controller
{
    
    public function get(Request $request)
    {
        return ["maps" => Map::all()];
    }

    public function store(Request $request)
    {
        $maps = $request->all();
        $directory = 'public/maps';
        $floors = array_keys($maps);

        for ($i=0; $i < count($maps); $i++) { 
            $floor = $floors[$i];
            $file = $maps[$floor];
            $extension = $file->getClientOriginalExtension();
            $fileName = 'map_' . $floor . '.' . $extension;
            $path = $file->storeAs($directory, $fileName);
            $url = "storage/maps/" . $fileName;
            Map::create(["floor" => $floor, "url" => $url]);
        }
        
    }

    public function delete(Request $request){
        DB::table('maps')->truncate();
    }
}
