import { ThemeButton } from "./ThemeButton"
import  CarouselMap  from "@/Components/CarouselMap"

export default function ConfigurationMap({maps}){
    return (
        <div className="flex flex-col h-full w-full justify-center items-center">
            <p className='h-min w-full p-4 text-center text-2xl'>Configure map house</p>
            <div className="flex flex-col lg:flex-row w-full h-5/6">
                <div className="w-5/6 h-full p-5">
                    <CarouselMap maps={maps}/>
                </div>
                <div className="w-5/6 h-full p-5">
                </div>
            </div>
            <ThemeButton>Edit</ThemeButton>
        </div>
    )
}