<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MapController;

    Route::get("/maps", [MapController::class, "get"])->name('map.index');
    Route::post('/maps', [MapController::class, "store"])->name('map.store');
    Route::delete("/maps", [MapController::class, "delete"])->name('map.delete');