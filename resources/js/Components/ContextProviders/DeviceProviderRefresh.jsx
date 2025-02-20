import React, { createContext, useState, useEffect } from "react";
import { backend } from "../Commons/Constants";

export const DeviceContextRefresh = createContext();




export const DeviceProviderRefresh = ({ children }) => {
  const [deviceList, setDeviceList] = useState([]);
  const refreshFrequency=5*1000 //in milliseconds
  
  const fetchDevices = async () => {
    try {
      const response = await fetch(`${backend}/device`);
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDeviceList(data);
    } catch (err) {
      alert(err.message);
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
    <DeviceContextRefresh.Provider value={{ deviceList,fetchDevices}}>
      {children}
    </DeviceContextRefresh.Provider>
  );
};
