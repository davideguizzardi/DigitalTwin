import { Button } from "flowbite-react"

export function ThemeButton({ className = '', ...props }) {

    return (
        <Button {...props}
            className={'bg-lime-400 text-gray-800 enabled:hover:bg-lime-500 shadow focus:ring-0 ' + className}>
        </Button>
    )

}