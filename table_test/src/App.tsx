import React, { useState } from "react";

import countriesData from "./components/dt_database";
import Table from "./components/Table";

const App = () => {
  const [countries] = useState([...countriesData]);
  return (
    <div>
      <Table data={countries} rowsPerPage={5} />
    </div>
  );
};

export default App;
