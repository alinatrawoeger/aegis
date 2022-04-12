import React, { useState } from "react";
import Table from "./Table";

const TableComponent = (dataset: any[]) => {
  let convertedData = [];
  for (let el in dataset) {
    convertedData.push(dataset[el]);
  }

  const [locations] = useState([...convertedData]);
  return (
    <div>
      <Table data={locations} rowsPerPage={5} />
    </div>
  );
};

export default TableComponent;
