import { getIcon } from "../Commons/Constants";
const iconsSize="size-12"
const steps = [
    { icon: getIcon("home",iconsSize), label: "Planimetry configuration" },
    { icon: getIcon("devices",iconsSize), label: "Devices configuration" },
    { icon: getIcon("power",iconsSize), label: "Energy plan configuration" },
    { icon: getIcon("check",iconsSize), label: "Done!" }
];

export default function StepProgress({ state, setState }) {
    const darkMode = localStorage.getItem("darkMode") == "true";
    return (
        <div className="flex flex-row items-center py-6 px-20 rounded bg-white dark:bg-neutral-900 shadow">
            {steps.map((step, index) => (
                <>
                    <div key={index} className="relative flex flex-col items-center justify-center">
                        <div
                            className={"rounded-full p-2 size-min border solid " + (state >= index ? "bg-lime-400" : "bg-gray-300")}
                            onClick={() => setState(index)}
                        >
                            {step.icon}
                        </div>
                        <div className="absolute top-16 text-center flex w-fit whitespace-nowrap">
                            {step.label}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={"w-full h-2 rounded " + (state > index ? "bg-lime-400" : "bg-gray-300 dark:bg-neutral-700")} />
                    )}
                </>
            ))}
        </div>
    );
}
