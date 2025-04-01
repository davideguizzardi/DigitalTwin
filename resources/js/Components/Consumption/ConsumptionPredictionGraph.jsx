import React, { useEffect, useState } from "react";
import { Spinner, Button, Select, Label } from "flowbite-react";
import { BarChart } from '@mui/x-charts/BarChart';
import { useLaravelReactI18n } from "laravel-react-i18n";

export function ConsumptionPredictionGraph({ url_in, future_steps, graphHeight = 0 }) {
  const [dataset, setDataset] = useState([])
  const [loading, setLoading] = useState(false)
  const [colorPast, setColorPast] = useState('#a3e635')
  const [colorFuture, setColorFuture] = useState('#65A30D')
  const heightGraph = graphHeight > 0 ? graphHeight : window.innerHeight > 1000 ? 800 : 550
  const { t } = useLaravelReactI18n()

  const getColor = (index) => {
    return index < future_steps ? colorPast : colorFuture; // First 12 elements: #a3e635, others: #65A30D
  };


  const fetchConsumption = async () => {
    let url = url_in
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (response) {
      const data = await response.json();
      setDataset(data)
    }
    setLoading(false)
  }


  //Loading new consumption data when data of the query change
  useEffect(() => {
    setLoading(true)
    fetchConsumption()
  }, [url_in])

  const valueFormatter = (value) => `${value} Wh`;

  return (
    <div className="size-full flex flex-col mt-2">
      {loading ?
        <Spinner className="fill-lime-400" aria-label="Loading" size="xl" />
        :
        <>
          <div className="pl-3 flex flex-col items-center relative">
            <div className="absolute pr-5 items-start -top-1 right-3">
              <div className="flex flex-col gap-2 items-start pl-5">
                <div className="flex flex-row gap-1 items-center" onMouseEnter={() => setColorFuture("#d0e3b6")} onMouseLeave={() => setColorFuture('#65A30D')}>
                  <div className="size-5 bg-lime-300 shadow-md rounded-sm" />
                  <h1 className="font-[Inter] text-gray-800 text-base">{t("Past real consumption")}</h1>
                </div>

                <div className="flex flex-row gap-1 items-center" onMouseEnter={() => setColorPast("#E3F7C2")} onMouseLeave={() => setColorPast('#a3e635')}>
                  <div className="size-5 bg-lime-600 shadow-md rounded-sm" />
                  <h1 className="font-[Inter] text-gray-800 text-base">{t("Future predicted consumption")}</h1>
                </div>
              </div>
            </div>


            <BarChart
              className=""
              dataset={dataset}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'date',
                  colorMap: {
                    type: 'ordinal',
                    // Instead of a static color array, we'll define colors for each bar dynamically
                    colors: dataset.map((_, index) => getColor(index)), // Assign color based on index
                  },
                },
              ]}
              yAxis={[{ valueFormatter: valueFormatter }]}
              series={[
                { dataKey: "energy_consumption", valueFormatter }
              ]}
              borderRadius={4}
              margin={{ left: 70 }}
              height={heightGraph}
            />
          </div>
        </>
      }
    </div>
  )
}

