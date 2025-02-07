import React from "react";
import { Button } from "flowbite-react";

export const StyledDiv = ({ variant = "primary",className="", children }) => {
  const theme = {
    primary: "bg-zinc-50 text-gray-800  dark:bg-neutral-800 dark:text-gray-300 rounded-lg px-5 py-5",
    secondary: "bg-gray-300 py-10 px-10",
  };

  const classSyle=`${theme[variant]} ${className}`
  return <div className={classSyle}>{children}</div>;
};


export const StyledButton = ({ variant = "primary",className="", onClick={},children , disabled=false, ...props}) => {
  const theme = {
    primary: "bg-lime-400 hover:bg-lime-500 text-gray-800 shadow-md",
    secondary: "bg-neutral-50 rounded-lg shadow-md hover:bg-lime-400",
    delete: "bg-red-400 rounded-lg shadow-md hover:bg-red-500"
  };

  const classSyle=`${theme[variant]} ${className}`
  return <Button {...props} className={classSyle} color="test" onClick={onClick} disabled={disabled}>{children}</Button>;
};
