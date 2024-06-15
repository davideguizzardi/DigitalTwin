import { Button } from "flowbite-react"

export function ThemeButton({className = '', ...props}){

    return (
        <Button {...props} 
        className="bg-lime-200
        text-gray-700
        enabled:hover:bg-lime-300
        shadow
        focus:ring-lime-400
        ">
        </Button>
    )

}