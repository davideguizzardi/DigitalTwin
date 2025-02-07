import { useState, useEffect } from "react";
import { Tabs } from "flowbite-react";

import { LineChart } from "@mui/x-charts";
import { StyledDiv } from "../Commons/StyledBasedComponents";

import { DAYS } from "../Commons/DataFormatter";

import { backend } from "../Commons/Constants";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { SuggestionsDisplay } from "./SuggestionDisplay";
import { ConflicsDisplay } from "./ConflictsDisplay";
import AutomationStats from "./AutomationStats";

import { useLaravelReactI18n } from "laravel-react-i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

const THRESHOLD=2300

export function AutomationSimulation({ automation_to_simulate }) {
  const {t}=useLaravelReactI18n()
  const [updatedStateMatrix, setUpdatedStateMatrix] = useState({})
  const [automationToAdd, setAutomationToAdd] = useState("")
  const [powerMatrix, setPowerMatrix] = useState([])
  const [monthlyCost, setMonthlyCost] = useState(-1)
  const [maxCost, setMaxCost] = useState(-1)
  const [minCost, setMinCost] = useState(-1)
  const [energyConsumption, setEnergyConsumption] = useState(0)
  const [powerDrawn, setPowerDrawn] = useState(0)

  const [conflictsList, setConflictsList] = useState([])
  const [suggestionsList, setSuggestionsList] = useState([])

  useEffect(() => {
    setAutomationToAdd(automation_to_simulate)
  }, [automation_to_simulate])

  useEffect(() => {
    if (automationToAdd != "")
      simulateMatrixAddition()
  }, [automationToAdd])



  const simulateMatrixAddition = async () => {
    let body = {}
    body["automation"] = JSON.parse(automationToAdd)

    const response = await fetch(`${backend}${"/automation/simulate"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const updated_matrix = await response.json();
      setUpdatedStateMatrix(updated_matrix["state_matrix"])

      const startOfDay = new dayjs().startOf("day");

      var power_matrix = Object.keys(updated_matrix["cumulative_power_matrix"])
        .reduce((accumulator, day) => {
          accumulator[day] = updated_matrix["cumulative_power_matrix"][day]
            .filter((e, i) => i % 10 == 0)
            .map((e, i) => (
              {
                "power": e,
                "date": startOfDay.add(i * 10, "minutes")
              }));
          return accumulator
        }, {})

      setPowerMatrix(power_matrix)
      setConflictsList(updated_matrix["conflicts"])
      setSuggestionsList(updated_matrix["suggestions"])
      setMonthlyCost(updated_matrix["automation"]["monthly_cost"])
      setMaxCost((updated_matrix["automation"]["maximum_cost_per_run"]))
      setMinCost(updated_matrix["automation"]["minimum_cost_per_run"])

      setPowerDrawn(updated_matrix["automation"]["average_power_drawn"])
      setEnergyConsumption(updated_matrix["automation"]["energy_consumption"])
    }
    else {
      alert("Error")
    }

  }

  const value_formatter = (value) => `${value.toFixed(2)} W`

  const date_formatter = (dateTimeNat) => {
    const dateTime = dayjs(dateTimeNat);
    return dateTime.format("HH:mm");
  };

  return (
    <StyledDiv className="flex flex-col gap-5">
      <div className="">
        <h1 className="font-[Inter] font-light text-2xl mb-4">{t("simulationTitle")}</h1>
        <AutomationStats
          monthlyCost={monthlyCost}
          minCost={minCost}
          maxCost={maxCost}
          powerDrawn={powerDrawn}
          energyConsumption={energyConsumption}


        /> 
      </div>
      {
        conflictsList.length > 0 &&
        <ConflicsDisplay conflicts_list={conflictsList} />
      }
      {suggestionsList.length > 0 &&
        <SuggestionsDisplay suggestion_list={suggestionsList} />
      }

      <div>
        <h1 className="font-[Inter] font-light text-2xl">Daily simulation</h1>
        {Object.keys(updatedStateMatrix).length > 0 &&
          <Tabs aria-label="Default tabs" variant="default">
            {
              Object.keys(updatedStateMatrix).map(day => (
                <Tabs.Item title={t(DAYS[day])}>
                  <div className="flex flex-col px-3">
                    <div className="flex flex-col col-span-4">
                      {Object.keys(powerMatrix).length > 0 &&
                        <div className="flex flex-row">
                          <LineChart
                            dataset={powerMatrix[day]}
                            xAxis={[{ dataKey: 'date', scaleType: "time", valueFormatter: date_formatter }]}
                            yAxis={[{
                              colorMap: {
                                type: 'piecewise',
                                thresholds: [THRESHOLD],
                                colors: ["#a3e635", 'red'],
                              }
                            }]}
                            series={[{
                              dataKey: "power", color: "#a3e635", valueFormatter: value_formatter,
                            }]}
                            width={800}
                            height={500}
                            sx={{
                              '& .MuiLineElement-root': {
                                strokeWidth: 4
                              },
                              '& .MuiMarkElement-root': {
                                display: 'none'
                              }
                            }}
                          />
                        </div>
                      }
                    </div>
                  </div>
                </Tabs.Item>
              ))
            }
          </Tabs>
        }
      </div>

    </StyledDiv >
  )
}