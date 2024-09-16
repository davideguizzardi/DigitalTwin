<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Pages\ConfigurationController;
use App\Http\Controllers\Pages\DashboardController;
use App\Http\Controllers\Pages\UserAreaController;
use App\Http\Controllers\API\MapController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    if(Auth::check()){
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard/{firstAccess?}', [DashboardController::class, 'show'])->name('dashboard');
    Route::get('/configuration', [ConfigurationController::class, "show"])->name('configuration');
    Route::get('/userarea', [UserAreaController::class, "get"])->name('userarea.get');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
