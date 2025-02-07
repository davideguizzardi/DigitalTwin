import { useState, useEffect } from "react";
import { Button, Modal, Select, TextInput, Label } from "flowbite-react"
import { backend } from "../Commons/Constants";

export function ServicePopup({ selectedEntity, open, closeFun, entityList ,submitFun=undefined}) {

    const [entity, setEntity] = useState(null)

    const [selectedService, setSelectedService] = useState(null)
    const [selectedServiceKey, setSelectedServiceKey] = useState(null)

    const [data, setData] = useState({})

    const [isProcessing, setIsProcessing] = useState(false)


    function resetPopup() {
        setSelectedService(null)
        setSelectedServiceKey(null)
        setData({})
        closeFun()
    }

    function selectService(key) {
        setSelectedServiceKey(key)
        setSelectedService(entity.services[key])
        setData({})
    }

    const callService = async (e) => {
        e.preventDefault()
        setIsProcessing(true)
        let body = {}
        body["entity_id"] = entity["entity_id"]
        body["service"] = selectedServiceKey
        body["user"] = "Davide" //todo: METTERE IL NOME GIUSTO
        body["data"] = Object.entries(data).filter(([key, value]) => value !== "")
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        const response = await fetch(`${backend}${"/service"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        setIsProcessing(false)
    }

    function usePassedFunction(e){
        e.preventDefault()
        let body = {}
        body["service"] = `${entity["entity_id"].split('.')[0]}.${selectedServiceKey}`
        body["data"] = Object.entries(data).filter(([key, value]) => value !== "")
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

        submitFun(body)
        resetPopup()
    }


    function addData(key, val) {
        const newData = data
        newData[key] = val
        setData(newData)
    }

    useEffect(() => {
        setEntity(selectedEntity)
    }, [selectedEntity])

    function getCorrectInput(field_key, onChangeFun, selector) {
        if (!selector || Object.keys(selector).length === 0) {
            return <TextInput id={field_key} onChange={(value) => onChangeFun(field_key, value.target.value)} required={selectedService?.fields?.[field_key]?.required} />;
        }

        const selector_type = Object.keys(selector)[0]
        switch (selector_type) {
            case "entity":
                const domain = selector['entity']['domain']
                return <Select onChange={(value) => onChangeFun(field_key, value.target.value)}>
                    <option>Select</option>
                    {
                        entityList.filter(e => e.entity_id.startsWith(domain)).map(en => (
                            <option key={en.entity_id}>
                                {en.entity_id}
                            </option>
                        ))
                    }
                </Select>

            case "boolean":
                return <Select onChange={(value) => onChangeFun(field_key, value.target.value)}>
                    <option>Select</option>
                    <option key={true}>True</option>
                    <option key={false}>False</option>
                </Select>

            case "select":
                const options = selector['select']['options']
                return <Select onChange={(value) => onChangeFun(field_key, value.target.value)}>
                    <option>Select</option>
                    {options.map(op => (
                        <option key={op}>{op}</option>
                    ))
                    }
                </Select>

            case "number":
                const min = "min" in selector['number'] ? selector['number']['min'] : ""
                const max = "max" in selector['number'] ? selector['number']['max'] : ""
                return <TextInput type="number" min={min} max={max} id={field_key} onChange={(value) => onChangeFun(field_key, value.target.value)} required={"required" in selectedService.fields[field_key]} />

            case "text":
                return <TextInput id={field_key} onChange={(value) => onChangeFun(field_key, value.target.value)} required={"required" in selectedService.fields[field_key]} />
            default:
                return <TextInput id={field_key} onChange={(value) => onChangeFun(field_key, value.target.value)} required={"required" in selectedService.fields[field_key]} />
        }
    }



    return (
        <Modal show={open} size="lg" popup onClose={() => resetPopup()}>
            <Modal.Header className="ms-4">
                Call a service for <span className="font-bold">{entity && entity.friendly_name}</span>
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-3">
                    <div>
                        <h3 className="text-lg font-bold">Service</h3>
                        <Select onChange={(sel) => selectService(sel.target.value)} id="service">
                            <option value={null} selected>Select a service</option>
                            {entity != null && Object.keys(entity.services).map(key => (
                                <option key={key} value={key}>{entity.services[key].name}</option>
                            ))}
                        </Select>
                        {selectedService &&
                            <div>
                                {selectedService.description}
                            </div>
                        }
                    </div>
                    {selectedService &&
                        <div className="flex flex-col">
                            {Object.keys(selectedService.fields).length > 0 &&
                                <h3 className="text-lg font-bold">Parameters</h3>
                            }
                            <form onSubmit={submitFun? usePassedFunction:callService} className="flex max-w-md flex-col gap-4">
                                {
                                    Object.keys(selectedService.fields).map(field_key => (
                                        <div>
                                            <div className="mb-2 flex flex-col">
                                                <div className="flex flex-row items-center gap-1">
                                                    <Label className="font-bold" htmlFor={field_key} value={field_key} />
                                                    {"required" in selectedService.fields[field_key] && "*"}
                                                    {selectedService.fields[field_key]['selector']?.number?.unit_of_measurement && (
                                                        <p className="text-xs">
                                                            [{selectedService.fields[field_key]['selector'].number.unit_of_measurement}]
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs">{selectedService.fields[field_key]["description"]}</p>
                                            </div>
                                            {getCorrectInput(field_key, addData, selectedService.fields[field_key]['selector'])}
                                        </div>
                                    ))
                                }
                                <Button isProcessing={isProcessing} type="submit">Call service</Button>
                            </form>
                        </div>
                    }
                </div>
            </Modal.Body>
        </Modal>
    )

}