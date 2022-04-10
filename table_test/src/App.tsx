import React, { useState } from "react";

import countriesData from "./components/dt_database";
import Table from "./components/Table";
import { ZoomLevel } from "./components/utils";

const App = () => {
  const { datasetPrimary, datasetSecondary } = prepareData(countriesData, 5);

  const [countries] = useState([...datasetPrimary]);
  const [regions] = useState([...datasetSecondary]);
  return (
    <div>
      <Table data={countries} rowsPerPage={5} />
      <Table data={regions} rowsPerPage={5} />
    </div>
  );
};

const prepareData = (data: any, zoomLevel: number) => {
  let tabTitles = getGeographicTableColumnHeaders(zoomLevel);
  let datasetPrimary = groupValuesPerLocation(data, tabTitles[0]);
  let datasetSecondary = groupValuesPerLocation(data, tabTitles[1]);

  return {datasetPrimary, datasetSecondary};
}

const getGeographicTableColumnHeaders = (zoomLevel: number): string[] => {
  if (zoomLevel <= ZoomLevel.CONTINENT.level) {
      return ['continent', 'country'];
  } else {
      return ['country', 'region'];
  }
  // TODO add handling for Region/City when data has been expanded
}

const groupValuesPerLocation = (data: any, locationKey: string) => {
  let groupedValuesMap: any[] = [];
  for (let i = 0; i < data.length; i++) {
      let curElement = data[i];
      let location = curElement[locationKey as keyof typeof curElement];
      
      if (location != undefined) {
        if (groupedValuesMap[location] === undefined) { // add new element
            groupedValuesMap[location] = [curElement];
        } else { // add new value to existing one
            let value: any[] = groupedValuesMap[location];
            value.push(curElement);
            groupedValuesMap[location] = value;
        }
      }
  }

  // calculate new values per grouping
  let newValues: any[] = [];
  for (let location in groupedValuesMap) {
    let value = groupedValuesMap[location];

    let newValuesPerLocation: { [key: string]: any } = {};
    newValuesPerLocation['location'] = location;
    for (let key in value[0]) {
        if (typeof value[0][key] === 'number') {
            let sum = 0;
            for (let i = 0; i < value.length; i++) {
                sum += value[i][key];
            }
            let avg = sum / value.length;

            newValuesPerLocation[key] = avg.toFixed(2);;
        }
    }
    
    newValues.push(newValuesPerLocation);
  }

  newValues.sort(function(a, b){
    return b.apdex - a.apdex;
  });

  return newValues;
}

export default App;
