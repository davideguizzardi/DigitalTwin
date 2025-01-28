<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function get(Request $request)
    {
        return ["user" => Auth::user()];
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $values = $request->all();
        $keys = array_keys($values);
        $directory = 'public/profiles';
        for($i=0; $i<count($values); $i++){
            $key = $keys[$i];
            if($key == "profile"){
                $file = $values[$key];
                $extension = $file->getClientOriginalExtension();
                $fileName = "profile_{$user->id}.{$extension}";
                $path = $file->storeAs($directory, $fileName);
                $url = "storage/profiles/{$fileName}";
                $user->url_photo = $url;
            }elseif($key=="new_password"){
                $oldPassword = $values["old_password"];
                if(!Hash::check($oldPassword, $user->password) ){
                    $errorData = array(
                        "status" => "error",
                        "detail" => "old_password",
                        "message" => "Current password is incorrect"
                    );
                    return response()->json($errorData);
                }
                $validator = Validator::make($values, [
                    "new_password" => [Password::min(8)]
                ]);
                if($validator->fails()){
                    $errorData = array(
                        "status" => "error",
                        "detail" => "new_password",
                        "message" => "Password too short"
                    );
                    return response()->json($errorData);
                }else{
                    $password = $validator->safe()->only(["new_password"])["new_password"];
                    $user->password = Hash::make($password);
                }
            }elseif($key=="privacy_1"){
                $user->privacy_1 = $values[$key] == 'true' ? 1 : 0;
            }elseif($key=="privacy_2"){
                $user->privacy_2 = $values[$key] == 'true' ? 1 : 0;
            }elseif($key=="preference"){
                $user->preference = $values[$key];
            }
        }
        $user->save();
        $successData = array(
            "status" => "success",
            "user" => $user
        );
        return response()->json([
            "status"=>"success",
            "user"=>$user
        ]);
    }
}
