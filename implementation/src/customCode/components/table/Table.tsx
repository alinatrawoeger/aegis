import React, { useEffect, useState } from "react";
import styles from "./Table.module.css";
import analyzeIcon from "./img/analyze.svg";
import arrowLeft from "./img/arrow_left.png";
import arrowLeftInactive from "./img/arrow_left_disabled.png";
import arrowRight from "./img/arrow_right.png";
import arrowRightInactive from "./img/arrow_right_disabled.png";

let rowsPerPage: number;

type TableProps = {
  data: any[];
  columnHeaders: string[];
  isIVolunteer: boolean; // distinguishes between DT and iVol table
}

const Table: React.FC<TableProps> = ( { data, columnHeaders, isIVolunteer } ) => {
  rowsPerPage = isIVolunteer ? 4 : 5;

  const [locations] = useState([...data]);
  const [page, setPage] = useState(1);
  const { dataOnPage, tableRange } = useTable(locations, page);
  return (
    <>
      <TableContent dataOnPage={dataOnPage} columnHeaders={columnHeaders} isIVolunteer={isIVolunteer} />
      <TablePagination pageRange={tableRange} dataOnPage={dataOnPage} setPage={setPage} page={page} />
    </>
  );
}

const TableContent = ({ dataOnPage, columnHeaders, isIVolunteer }) => {
  return (
    <>
      <table className={`${styles.table} ${isIVolunteer ? styles.tableIvol : styles.tableDt}`}>
        <thead>
          <tr className={styles.tableRowHeader}>
            {columnHeaders.map((header) => (
              <th key={header} className={styles.tableHeader}>{header}</th>
            ))}
            <th className={styles.tableHeader}>Details</th>
          </tr>
        </thead>
        <tbody>
          {dataOnPage.map((dataRow) => (
            <tr className={styles.tableRowItems} key={isIVolunteer ? dataRow.taskid : dataRow.location}>
              <td className={`${styles.tableCell} ${styles.tableLink}`}>{isIVolunteer ? dataRow.taskname : dataRow.location}</td>
              <td className={styles.tableCell}>{isIVolunteer ? dataRow.taskid : dataRow.apdex}</td>
              {!isIVolunteer ?? <td className={styles.tableCell}>{dataRow.useractions}</td>}
              <td className={`${styles.tableCell} ${styles.tableLastCol}`}><a href="#">
                <img src={analyzeIcon} className={styles.analyzeBtn} />
                </a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

type TablePaginationProps = {
  pageRange: number[];
  setPage: any;
  page: number;
  dataOnPage: any;
}

const TablePagination: React.FC<TablePaginationProps> = ({ pageRange, setPage, page, dataOnPage }) => {
  useEffect(() => {
    if (dataOnPage.length < 1 && page !== 1) {
      setPage(page - 1);
    }
  }, [dataOnPage, page, setPage]);
  return (
    <div className={styles.tableFooter}>
      <button 
        key='prev' 
        className={`${styles.button} ${styles.arrowBtn} ${styles.arrowPrevBtn} ${ page === 1 ? styles.disabledButton : ''}`} 
        onClick={() => page > 1 ? setPage(page-1) : setPage(page)}>
        <img src={`${ page === 1 ? arrowLeftInactive : arrowLeft}`} height="16px" />
      </button>
      {pageRange.map((el: any, index: number) => (
        <button 
          key={index} 
          className={`${styles.button} ${ page === el ? styles.activeButton : styles.inactiveButton }`} 
          onClick={() => setPage(el)}> 
          {el}
        </button>
      ))}
      <button 
        key='next' 
        className={`${styles.button} ${styles.arrowBtn} ${styles.arrowNextBtn} ${ page === pageRange[pageRange.length-1] ? styles.disabledButton : ''}`} 
        onClick={() => page < pageRange[pageRange.length-1] ? setPage(page+1) : setPage(page)}>
        <img src={`${ page === pageRange[pageRange.length-1] ? arrowRightInactive : arrowRight}`} height="16px" />
      </button>
    </div>
  );
};


// -- calculations & functions

const calculatePageRange = (data: any, page: number): number[] => {
  const pageRange: any[] = [];
  const num = Math.ceil(data.length / rowsPerPage);
  let i = 1;
  if (num <= 3) { // show all numbers in pagination
    for (let i = 1; i <= num; i++) {
      pageRange.push(i);
    }
  } else { // show ellipsis between outermost page numbers
      pageRange.push(1);
      if (page > 2) {
        pageRange.push('...');
      }
      if (page != 1) {
        pageRange.push(page);
      }
      if (page < num-1) {
        pageRange.push('...');
      }
      if (page != num) {
        pageRange.push(num);
      }
  }
  return pageRange;
}

const getDataOnPage = (data: any, page: number): number[] => {
  return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
}

const useTable = (data: any, page: number) => {
  const [tableRange, setTableRange] = useState<Array<number>>([]);
  const [dataOnPage, setSlice] = useState<Array<any>>([]);

  useEffect(() => {
    const range  = calculatePageRange(data, page);
    setTableRange([...range]);

    const dataOnPage = getDataOnPage(data, page);
    setSlice([...dataOnPage]);
  }, [data, setTableRange, page, setSlice]);

  return { dataOnPage, tableRange };
}

export default Table;