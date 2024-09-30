import { Button } from "flowbite-react"

export function ThemeButton({ className = '', ...props }) {

    return (
        <Button {...props}
            className={'bg-lime-400 dark:bg-lime-400 text-gray-800 shadow focus:ring-0 ' +
            'enabled:hover:bg-lime-500 dark:enabled:hover:bg-lime-500 ' + className}>
        </Button>
    )

}