import { useState } from "react";
import { ThemeButton } from "@/Components/Commons/ThemeButton";

export default function CarouselMap({ maps, index = 0,
    setIndex = (i) => { index = i }, otherButtons = (<></>) }) {

    let [urlImage, setUrlImage] = useState(maps[index].url);
    const listButtons = maps.map((element, i) => (
        <ThemeButton className="size-min mx-px my-2" key={i} pill onClick={() => {
            setUrlImage(element.url);
            setIndex(i);
        }}>
            {i}
        </ThemeButton>
    ));
    return (
        <div className="size-full flex justify-center items-center">
            <div className="w-full h-full flex justify-center ">
                <img className="max-w-full max-h-full aspect-auto" src={urlImage} alt="" />
            </div>
            <div className="flex flex-col justify-center w-min m-2 p-1 rounded-full bg-gray-100 shadow">
                {listButtons}{otherButtons}
            </div>
        </div>
    );
}