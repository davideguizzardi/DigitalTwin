import React, { createContext, useState, useEffect } from "react";
import { apiFetch, removeType } from "../Commons/Constants";

export const DeviceContextRefresh = createContext();

const refreshFrequency = import.meta.env.DEVICE_REFRESH_FREQUENCY_MS || 3*1000;


export const DeviceProviderRefresh = ({ children }) => {
  const [deviceList, setDeviceList] = useState([]);
  const [connectionOk,setConnectionOk]=useState(true)
  const [isDemo,setIsDemo]=useState(false)
  
  const fetchDevices = async () => {
    try {
      const connectedDevices = await apiFetch(`/device`);
      const isUsingDemo = !connectedDevices;
      const response = connectedDevices ?? await apiFetch(`/virtual/device`);
      if (!response) throw new Error("Failed to fetch devices");
      const filtered_devices=response.filter(device=>!removeType.includes(device.device_class) && device.name.toLowerCase()!="backup").map(device=>device)
      setDeviceList(filtered_devices);
      setConnectionOk(true)
      setIsDemo(isUsingDemo)
    } catch (err) {
      setConnectionOk(false)
      setIsDemo(false)
    } 
  };

  
  useEffect(() => {
    fetchDevices();
   
    const interval = setInterval(() => {
      fetchDevices();
    }, refreshFrequency); 

    return () => clearInterval(interval);
  }, []);

  return (
    <DeviceContextRefresh.Provider value={{ deviceList,connectionOk,isDemo,fetchDevices}}>
      {children}
    </DeviceContextRefresh.Provider>
  );
};
