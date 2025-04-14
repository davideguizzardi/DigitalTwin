<?php

use App\Http\Controllers\API\MapController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function(){
    Route::get("/maps", [MapController::class, "get"])->name('map.index');
    Route::post('/maps', [MapController::class, "store"])->name('map.store');
    Route::delete("/maps", [MapController::class, "delete"])->name('map.delete');
    Route::get("/user",  [UserController::class, "get"])->name("user.index");
    Route::get("/users",  [UserController::class, "index"])->name("users.index");
    Route::post("/user", [UserController::class, "update"])->name("user.update");
    Route::get("/logout", [AuthController::class, "logout"])->name("user.logout");
});