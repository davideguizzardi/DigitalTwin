import React, { useEffect, useState } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StyledButton } from "../Commons/StyledBasedComponents";

export function ConsumptionComparisonGraph({ device_name, device_id }) {
  const [date1, setDate1] = useState(dayjs())
  const [date2, setDate2] = useState(dayjs())
  const [dataset, setDataset] = useState([])
  const [group, setGroup] = useState("daily")
  const [loading, setLoading] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [devicesList, setDeviceList] = useState([])

  const { t } = useLaravelReactI18n()
  const heightGraph = window.innerHeight > 1000 ? 850 : 500
  const isDark = localStorage.getItem("darkMode") == "true"

  const sxDatePicker = {
    '.MuiInputBase-root': {
      color: isDark ? "white" : "black",
      "&:hover > .MuiOutlinedInput-notchedOutline": {
        border: "1px " + (isDark ? " white " : " black ") + " solid"
      }
    },
    '.MuiIconButton-root': {
      color: isDark ? "white" : "black"
    },
    '.MuiInputLabel-root': {
      color: isDark ? "white" : "black"
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
    }
  }


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
    const url = "http://127.0.0.1:8000/device?get_only_names=true"
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
      const concatDataset=data1.concat(data2)
      if(group!="hourly")
        concatDataset.map(item=>item.energy_consumption=item.energy_consumption/1000)
      setDataset(concatDataset)
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

  const valueFormatter = (value) => `${value.toFixed(2)} ${group=="hourly"? "Wh":"kWh"}`;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-center mx-6 my-2 gap-4">
        <div className="flex flex-col gap-2">


          <Label htmlFor="device" value={t("Energy consumption of")} />
          <Select id="device" defaultValue={"Entire House"} onChange={(event) => handleNameChange(event)} required>
            {
              devicesList
                .filter(d => !["Sun", "Forecast"].includes(d.name))
                .map(dev => (
                  <option id={dev.device_id} key={dev.device_id}>{dev.name}</option>
                ))
            }
          </Select>
        </div>
        <div className="flex flex-row gap-6 h-full items-end justify-end pt-1">
          <div className="flex flex-row gap-2 items-center dark:text-white">
            {group == "daily" &&
              <>
                <DatePicker value={date1} size="small" className="w-[146px]" label={t('Day') + ' 1'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setDate1(val)}
                  sx={sxDatePicker} />
                <span className="text-2xl">vs</span>
                <DatePicker value={date2} className="w-[146px]" label={t('Day') + ' 2'} views={['year', 'month', 'day']} format="DD-MM-YYYY" onChange={(val) => setDate2(val)}
                  sx={sxDatePicker} />
              </>
            }
            {group == "monthly" &&
              <>
                <DatePicker value={date1} className="w-[146px]" label={t('Month') + ' 1'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setDate1(val.date(1)) }}
                  sx={sxDatePicker} />
                <span className="text-2xl">vs</span>
                <DatePicker value={date2} className="w-[146px]" label={t('Month') + ' 2'} views={['year', 'month']} format="MM-YYYY" onChange={(val) => { setDate2(val.date(1)) }}
                  sx={sxDatePicker} />
              </>
            }
          </div>

          <div className="flex flex-col">
            <Label>{t("Consumption")}</Label>
            <div className="flex flex-row gap-2 items-center">
              {loading &&
                <Spinner className="fill-lime-400" aria-label="Loading" size="lg" />
              }
              <Button.Group>
                <StyledButton color="secondary" className={(group == "daily" ? "bg-lime-400" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                  onClick={() => {
                    setGroup("daily");
                    setDate1(dayjs().subtract(1, "day"));
                    setDate2(dayjs())
                  }}>
                  {t("Daily")}
                </StyledButton>
                <StyledButton color="secondary" className={(group == "monthly" ? "bg-lime-400 dark:text-black" : "bg-neutral-50 dark:bg-neutral-700 dark:text-white")}
                  onClick={() => {
                    setGroup("monthly");
                    setDate1(dayjs().subtract(1, "month").date(1));
                    setDate2(dayjs().date(1))
                  }}>
                  {t("Monthly")}
                </StyledButton>
              </Button.Group>
            </div>
          </div>

        </div>
      </div>
      <div className="pl-3 flex h-full items-center dark:text-white justify-center">
        {
          dataset.length > 0 ?
            <BarChart
              className=""
              dataset={dataset}
              xAxis={[{
                scaleType: 'band', dataKey: 'date', colorMap: {
                  type: 'ordinal',
                  colors: ['#a3e635', '#65A30D']
                }
              }]}
              yAxis={[{ valueFormatter: valueFormatter }]}
              series={[{ dataKey: "energy_consumption", valueFormatter }]}
              borderRadius={4}
              height={heightGraph}
              margin={{ left: 70 }}
              sx={sxGraph}
            />
            :
            <h1>{t("No data present")}</h1>
        }
      </div>
    </div>
  )
}
