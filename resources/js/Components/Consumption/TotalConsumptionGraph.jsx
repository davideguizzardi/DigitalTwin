import React, { useEffect, useState } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export function TotalConsumptionGraph({ device_name, device_id }) {
  const [from, setFrom] = useState(dayjs())
  const [to, setTo] = useState(dayjs())
  const [dataset, setDataset] = useState([])
  const [group, setGroup] = useState("hourly")
  const [loading, setLoading] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [devicesList, setDeviceList] = useState([])

  const heightGraph = window.innerHeight > 1000 ? 800 : 550
  console.log(heightGraph)
  const isDark = localStorage.getItem("darkMode") =="true"
  const sxDatePicker = {
    '.MuiInputBase-root': {
      color: isDark ?"white" : "black",
      "&:hover > .MuiOutlinedInput-notchedOutline":{
        border: "1px " +( isDark ? " white " : " black " )+ " solid"
      }
    },
    '.MuiIconButton-root': {
      color: isDark ?"white" : "black",
    },
    '.MuiInputLabel-root': {
      color: isDark ?"white" : "black",
    },
    '.MuiOutlinedInput-notchedOutline ': {
      border: "1px " + (isDark ? " white " : " black ") + " solid"
    },
  }

  const sxGraph = {
    //change left yAxis label styles
    "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.4",
      fill: isDark ? "white" : "black"
    },
    // change bottom label styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
      strokeWidth: "0.5",
      fill: isDark ? "white" : "black"
    },
    // bottomAxis Line Styles
    "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    // leftAxis Line Styles
    "& .MuiChartsAxis-left .MuiChartsAxis-line": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .MuiChartsAxis-bottom .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .MuiChartsAxis-left .MuiChartsAxis-tick": {
      stroke: isDark ? "white" : "black",
      strokeWidth: 1
    },
    "& .css-1j25yxu-MuiResponsiveChart-container":{
      color: isDark ? "white" : "black"
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])


  function handleItemClick(params) {
    switch (group) {
      case "daily":
        //need to go from daily to hourly of the clicked day
        var clickedItem = dataset[params["dataIndex"]]
        setFrom(dayjs(clickedItem.date, "DD-MM-YYYY"))
        setTo(dayjs(clickedItem.date, "DD-MM-YYYY"))
        setGroup("hourly")
        break;

      case "monthly":
        //need to go from monthly to daily of the clicked month
        var clickedItem = dataset[params["dataIndex"]]
        setFrom(dayjs(clickedItem.date, "MM-YYYY").date(1))
        setTo(dayjs(clickedItem.date, "MM-YYYY").endOf("month"))
        setGroup("daily")
        break;
    }
  }

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
      var url;
      if (deviceName == "Entire House") {
        url = `http://127.0.0.1:8000/consumption/total?` +
          `start_timestamp=${encodeURIComponent(from.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(to.format("YYYY-MM-DD"))}` +
          `&group=${group}`
      }
      else {
        url = `http://127.0.0.1:8000/consumption/device?device_id=${deviceId}` +
          `&start_timestamp=${encodeURIComponent(from.format("YYYY-MM-DD"))}` +
          `&end_timestamp=${encodeURIComponent(to.format("YYYY-MM-DD"))}` +
          `&group=${group}`
      }

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
        data.map(item => item.date = item.date.split(" ").length > 1 ? item.date.split(" ")[1] : item.date)
        setDataset(data)
      }
    }
    setLoading(false)
  }



  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [from, to, group, deviceId, deviceName])

  useEffect(() => {
    setDeviceName(device_name)
    setDeviceId(device_id)
  }, [device_name, device_id])

  const valueFormatter = (value) => `${value} Wh`;

  //const series=Object.keys(dataset).map(key=> ({ dataKey: "energy_consumption",color: '#a3e635', label:key, valueFormatter }))
  //        <h1 className="text-gray-800 text-base font-semibold font-[Inter]">{deviceName}</h1>
  return (
    <div className="size-full rounded-lg shadow-md flex flex-col">
      <div className="grid grid-cols-5 mx-3 my-2 items-center">
        <div className="flex flex-row gap-2 col-span-1">
          <div className="flex flex-col w-fit">

            <Label htmlFor="device" value="Energy consumption of" />
            <Select id="device" onChange={(event) => handleNameChange(event)} required>
              {
                devicesList
                  .filter(d => !["Sun", "Forecast"].includes(d.name))
                  .map(dev => (
                    <option id={dev.device_id} key={dev.device_id}>{dev.name}</option>
                  ))
              }
            </Select>
          </div>
        </div>
        <div className="flex flex-row gap-6 items-center justify-end flex-wrap col-span-4">
          <div className="flex flex-row gap-2 items-center">
            {group == "hourly" &&
              <DatePicker value={from} size='medium' className="w-40 focus:ring-0" label={'day'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => { setFrom(val); setTo(val) }}
                sx={sxDatePicker} 
              />
            }
            {group == "daily" &&
              <>
                <DatePicker value={from} size="small" className="w-40" label={'from'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setFrom(val)} 
                  sx={sxDatePicker}/>
                <span className="font-bold text-2xl">-</span>
                <DatePicker value={to} className="w-40" label={'to'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setTo(val)}
                sx={sxDatePicker}/>
              </>
            }
            {group == "monthly" &&
              <>
                <DatePicker value={from} className="w-40" label={'from'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setFrom(val.date(1)) }}
                sx={sxDatePicker}/>
                <span className="font-bold text-2xl">-</span>
                <DatePicker value={to} className="w-40" label={'to'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setTo(val.endOf("month")) }} 
                  sx={sxDatePicker}/>
              </>
            }
          </div>

          <div className="flex flex-row gap-2 items-center">
            {loading &&
              <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />
            }
            <Button.Group>
              <Button color="secondary" className={(group == "hourly" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                onClick={() => {
                  setGroup("hourly");
                  setFrom(dayjs().hour(0));
                  setTo(dayjs())
                }}>
                Hourly
              </Button>
              <Button color="secondary" className={(group == "daily" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                onClick={() => {
                  setGroup("daily");
                  setFrom(dayjs().subtract(7, "day"));
                  setTo(dayjs())
                }}>
                Daily
              </Button>
              <Button color="secondary" className={(group == "monthly" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                onClick={() => {
                  setGroup("monthly");
                  setFrom(dayjs().subtract(1, "month"));
                  setTo(dayjs())
                }}>
                Monthly
              </Button>
            </Button.Group>
          </div>

        </div>
      </div>
      <div className="pl-3 flex h-full items-center">
        <BarChart
          className=""
          dataset={dataset}
          xAxis={[{ scaleType: 'band', dataKey: 'date' }]}
          yAxis={[{ valueFormatter: valueFormatter }]}
          series={[{ dataKey: "energy_consumption", color: '#a3e635', valueFormatter }]}
          borderRadius={4}
          margin={{ left: 70 }}
          height={heightGraph}
          onItemClick={(event, params) => handleItemClick(params)}
          sx={sxGraph}
        />
      </div>
    </div>
  )
}
