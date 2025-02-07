<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Pages\ConfigurationController;
use App\Http\Controllers\Pages\DashboardController;
use App\Http\Controllers\Pages\UserAreaController;
use App\Http\Controllers\Pages\ConsumptionController;
use App\Http\Controllers\API\MapController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    if(Auth::check()){
        return redirect()->route('home');
    }
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/home/{firstAccess?}', [DashboardController::class, 'show'])->name('home');
    Route::get('/configuration', [ConfigurationController::class, "show"])->name('configuration');
    Route::get('/userarea', [UserAreaController::class, "get"])->name('userarea.get');
    Route::get('/consumption', [ConsumptionController::class, "show"])->name('consumption');
    Route::get('/automation', function(Request $request){ return Inertia::render("Automation");})->name("automation");
    Route::get('/automation_add', function(Request $request){ return Inertia::render("AddAutomation");})->name("automation.add");
    Route::get('/first-configuration', function (Request $request) {
        $maps = session('maps', collect());
        return Inertia::render("FirstConfiguration", [
            'maps' => $maps,
        ]);
    })->name("firstConfiguration");
    //Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    //Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    //Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
