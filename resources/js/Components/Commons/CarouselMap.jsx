import { useState } from "react";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";

export default function CarouselMap({ maps, index = 0,
    setIndex = (i) => { index = i }, otherButtons = (<></>) }) {
    const [urlImage, setUrlImage] = useState(maps[index].url);
    console.log(maps)

    const listButtons = maps.map((element, i) => (
        <StyledButton className="size-min mx-px my-2" key={i} pill onClick={() => {
            setUrlImage(element.url);
            setIndex(i);
        }}>
            {element.floor}
        </StyledButton>
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