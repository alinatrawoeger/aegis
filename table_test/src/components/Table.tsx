import React, { useState, useEffect } from "react";

import styles from "./Table.module.css";

type TableProps = {
  data: any;
  rowsPerPage: number;
}

const Table: React.FC<TableProps> = ({ data, rowsPerPage }) => {
  const [page, setPage] = useState(1);
  const { slice, tableRange } = useTable(data, page, rowsPerPage);
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableRowHeader}>
            <th className={styles.tableHeader}>Country</th>
            <th className={styles.tableHeader}>Apdex</th>
            <th className={styles.tableHeader}>User actions</th>
            <th className={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((location) => (
            <tr className={styles.tableRowItems} key={location.id}>
              <td className={styles.tableCell}>{location.country}</td>
              <td className={styles.tableCell}>{location.apdex}</td>
              <td className={styles.tableCell}>{location.useractions}</td>
              <td className={styles.tableCell}> </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination pageRange={tableRange} slice={slice} setPage={setPage} page={page} />
    </>
  );
};

// -- calculations & functions

const calculatePageRange = (data: any, rowsPerPage: number): number[] => {
  const pageRange: number[] = [];
  const num = Math.ceil(data.length / rowsPerPage);
  let i = 1;
  for (let i = 1; i <= num; i++) {
    pageRange.push(i);
  }
  return pageRange;
}

const sliceData = (data: any, page: number, rowsPerPage: number): number[] => {
  return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
}

const useTable = (data: any, page: number, rowsPerPage: number) => {
  const [tableRange, setTableRange] = useState<Array<number>>([]);
  const [slice, setSlice] = useState<Array<any>>([]);

  useEffect(() => {
    const range  = calculatePageRange(data, rowsPerPage);
    setTableRange([...range]);

    const slice = sliceData(data, page, rowsPerPage);
    setSlice([...slice]);
  }, [data, setTableRange, page, setSlice]);

  return { slice, tableRange };
}

type TablePaginationProps = {
  pageRange: number[];
  setPage: any;
  page: number;
  slice: any;
}

const TablePagination: React.FC<TablePaginationProps> = ({ pageRange, setPage, page, slice }) => {
  useEffect(() => {
    if (slice.length < 1 && page !== 1) {
      setPage(page - 1);
    }
  }, [slice, page, setPage]);
  return (
    <div className={styles.tableFooter}>
      {pageRange.map((el: any, index: number) => (
        <button
          key={index}
          className={`${styles.button} ${
            page === el ? styles.activeButton : styles.inactiveButton
          }`}
          onClick={() => setPage(el)}
        >
          {el}
        </button>
      ))}
    </div>
  );
};  

// const prepareData = (data) => {

// }

export default Table;