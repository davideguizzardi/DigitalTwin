import { useState } from "react";
import { ThemeButton } from "./ThemeButton";

export default function CarouselMap({ maps }) {
    let [urlImage, setUrlImage] = useState(maps[0].url);
    const listButtons =maps.map((element, index)=> (
        <ThemeButton className="size-min mx-px my-2" pill onClick={() =>{
            setUrlImage(element.url)
        }}>
            {index}
        </ThemeButton>
    ));
    return (
        <div className="size-full flex justify-center items-center">
            <div className="w-full h-full flex justify-center">
                <img className="max-w-full max-h-full aspect-auto" src={urlImage} alt="" />
            </div>
            <div className="flex flex-col justify-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
                {listButtons}
            </div>
        </div>
    );
}