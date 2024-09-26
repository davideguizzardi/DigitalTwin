import React, { useEffect, useState } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export function ConsumptionComparisonGraph({ device_name, device_id }) {
  const [date1, setDate1] = useState(dayjs())
  const [date2, setDate2] = useState(dayjs())
  const [dataset, setDataset] = useState([])
  const [group, setGroup] = useState("daily")
  const [loading, setLoading] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [devicesList, setDeviceList] = useState([])

  useEffect(() => {
    fetchDevices()
  }, [])


  function handleNameChange(event) {
    const index = event.target.selectedIndex;
    const optionElement = event.target.childNodes[index];
    const optionElementId = optionElement.getAttribute('id');

    setDeviceName(event.target.value)
    setDeviceId(optionElementId)
  }

  const fetchDevices = async () => {
    const url = "http://127.0.0.1:8000/virtual/device?get_only_names=true"
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (response.ok) {
      const data = await response.json();
      var devices = [{ "device_id": "", "name": "Entire House" }]
      devices = devices.concat(data)
      setDeviceList(devices)
    }
  }




  const fetchConsumption = async () => {
    if (deviceName != "") {
      var url1, url2
      var endDate1 = date1
      var endDate2 = date2
      if (group == "monthly") {
        endDate1 = date1.endOf("month")
        endDate2 = date2.endOf("month")
      }
      if (deviceName == "Entire House") {
        url1 = `http://127.0.0.1:8000/consumption/total?` +
          `start_timestamp=${encodeURIComponent(date1.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(endDate1.format("YYYY-MM-DD"))}` +
          `&group=${group}`
        url2 = `http://127.0.0.1:8000/consumption/total?` +
          `start_timestamp=${encodeURIComponent(date2.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(endDate2.format("YYYY-MM-DD"))}` +
          `&group=${group}`
      }
      else {
        url1 = `http://127.0.0.1:8000/consumption/device?device_id=${deviceId}` +
          `&start_timestamp=${encodeURIComponent(date1.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(endDate1.format("YYYY-MM-DD"))}` +
          `&group=${group}`
        url2 = `http://127.0.0.1:8000/consumption/device?device_id=${deviceId}` +
          `&start_timestamp=${encodeURIComponent(date2.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(endDate2.format("YYYY-MM-DD"))}` +
          `&group=${group}`
      }

      const response1 = await fetch(
        url1,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

      const response2 = await fetch(
        url2,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      if (response1.ok && response2.ok) {
        const data1 = await response1.json();
        const data2 = await response2.json();
        setDataset(data1.concat(data2))
      }
    }
    setLoading(false)
  }


  //Loading new consumption data when data of the query change
  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [date1, date2, group, deviceId, deviceName])

  useEffect(() => {
    setDeviceName(device_name)
    setDeviceId(device_id)
  }, [device_name, device_id])

  const valueFormatter = (value) => `${value} Wh`;

  //const series=Object.keys(dataset).map(key=> ({ dataKey: "energy_consumption",color: '#a3e635', label:key, valueFormatter }))
  //        <h1 className="text-gray-800 text-base font-semibold font-[Inter]">{deviceName}</h1>
  return (
    <div className="bg-zinc-50 rounded-lg shadow-md size-full flex flex-col">
      <div className="grid grid-cols-5 mx-6 my-2 items-center">
        <div className="flex flex-col gap-2 col-span-1">


            <Label htmlFor="device" value="Energy consumption of" />
            <Select id="device" onChange={(event) => handleNameChange(event)} required>
              {
                devicesList
                  .filter(d => !["Sun", "Forecast"].includes(d.name))
                  .map(dev => (
                    <option id={dev.device_id}>{dev.name}</option>
                  ))
              }
            </Select>
        </div>
        <div className="flex flex-row gap-6 items-center justify-end flex-wrap col-span-4">
          <div className="flex flex-row gap-2 items-center">
            {group == "daily" &&
              <>
                <DatePicker value={date1} size="small" className="w-[146px]" label={'Day 1'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setDate1(val)} />
                <span className="text-2xl">vs</span>
                <DatePicker value={date2} className="w-[146px]" label={'Day 2'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setDate2(val)} />
              </>
            }
            {group == "monthly" &&
              <>
                <DatePicker value={date1} className="w-[146px]" label={'Month 1'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setDate1(val.date(1)) }} />
                <span className="text-2xl">vs</span>
                <DatePicker value={date2} className="w-[146px]" label={'Month 2'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setDate2(val.date(1)) }} />
              </>
            }
          </div>

          <div className="flex flex-row gap-2 items-center">
            {loading &&
              <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />
            }
            <Button.Group>
              <Button color="secondary" className={(group == "daily" ? "bg-lime-400" : "bg-neutral-50")}
                onClick={() => {
                  setGroup("daily");
                  setDate1(dayjs().subtract(1, "day"));
                  setDate2(dayjs())
                }}>
                Daily
              </Button>
              <Button color="secondary" className={(group == "monthly" ? "bg-lime-400" : "bg-neutral-50")}
                onClick={() => {
                  setGroup("monthly");
                  setDate1(dayjs().subtract(1, "month").date(1));
                  setDate2(dayjs().date(1))
                }}>
                Monthly
              </Button>
            </Button.Group>
          </div>

        </div>
      </div>
      <div className="flex size-full items-center">
        <BarChart
          className="flex size-full"
          dataset={dataset}
          xAxis={[{
            scaleType: 'band', dataKey: 'date',colorMap: {
              type: 'ordinal',
              colors: ['#a3e635', '#65A30D']
            }
          }]}
          yAxis={[{ valueFormatter: valueFormatter }]}
          series={[{ dataKey: "energy_consumption", valueFormatter }]}
          borderRadius={4}
          margin={{ left: 70 }}
        />
      </div>
    </div>
  )
}
