import React, { useCallback, useEffect, useState } from "react";
import analyzeIcon from "./img/analyze.svg";
import arrowLeft from "./img/arrow_left.png";
import arrowLeftInactive from "./img/arrow_left_disabled.png";
import arrowRight from "./img/arrow_right.png";
import arrowRightInactive from "./img/arrow_right_disabled.png";
import styles from "./Table.module.css";

let rowsPerPage: number;

const columnHeaderNamesMap: Map<string, string> = new Map([
  ['apdex', 'Apdex'],
  ['useractions', 'User Actions'],
  ['loadactions', 'Load Actions'],
  ['xhractions', 'XHR Actions'],
  ['customactions', 'Custom Actions'],
  ['errors', 'Errors'],
]);


type TableProps = {
  data: any[];
  selectedMetric: string;
  filters: any[],
  onSetFilter: (value) => void;
  isIVolunteer: boolean; // distinguishes between DT and iVol table
}

const Table: React.FC<TableProps> = ( { data, selectedMetric, filters, onSetFilter, isIVolunteer } ) => {
  rowsPerPage = isIVolunteer ? 4 : 5;

  const [page, setPage] = useState(1);
  const { dataOnPage, tableRange } = useTable(data, page);
  const [ selectedFilters, setSelectedFilters ] = useState(filters);

  if (selectedFilters !== undefined && filters !== selectedFilters) {
    setSelectedFilters(filters);
  }

  const filterCallback = useCallback(
      (value) => {
          setSelectedFilters(value);
          onSetFilter(value);
      },
      [selectedFilters, onSetFilter],
  );
  
  return (
    <>
      {
        data.length > 0 
        ? <div>
            <TableContent dataOnPage={dataOnPage} selectedMetric={selectedMetric} isIVolunteer={isIVolunteer} selectedFilters={selectedFilters} setFilter={filterCallback} />
            <TablePagination pageRange={tableRange} dataOnPage={dataOnPage} setPage={setPage} page={page} /> 
        </div> 
        : <div className={styles.noData}>
            <span>No data available for this filter</span>
          </div>
      }
    </>
  );
}

const TableContent = ({ dataOnPage, selectedMetric, selectedFilters, setFilter, isIVolunteer }) => {
  let columnHeaders: string[];
  if (isIVolunteer) {
    columnHeaders = ['Taskname', 'Bundesland'];
  } else {
    if (selectedMetric === 'apdex') {
      columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'User actions'];
    } else if (selectedMetric === 'errors') {
      columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'Affected actions'];
    } else {
      columnHeaders = ['Location', columnHeaderNamesMap.get(selectedMetric), 'Total user actions'];
    }
  } 

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
              {isIVolunteer 
                ? <td className={`${styles.tableCell} ${styles.tableLink}`} onClick={() => clickOnTableRow(setFilter, dataRow, selectedFilters, isIVolunteer)}>{dataRow.taskname}</td>
                : <td className={`${styles.tableCell} ${styles.tableLink}`} onClick={() => clickOnTableRow(setFilter, dataRow, selectedFilters, isIVolunteer)}>{dataRow.location}</td> 
              }
              
              {!isIVolunteer 
                ? selectedMetric === 'useractions'
                  ? <td className={styles.tableCell}>{dataRow[selectedMetric]} / min</td> 
                  : selectedMetric === 'errors' 
                    ? <td className={styles.tableCell}>{dataRow[selectedMetric]} / min</td>
                    : <td className={styles.tableCell}>{dataRow[selectedMetric]}</td>
                : <td className={styles.tableCell}>{dataRow.address.region !== '' ? dataRow.address.region : '<n/a>'}</td>
              }
             
              {!isIVolunteer 
                ? selectedMetric === 'apdex' 
                  ? <td className={styles.tableCell}>{dataRow['useractions']} / min</td> 
                  : selectedMetric === 'errors' 
                    ? <td className={styles.tableCell}>{dataRow['affecteduseractions']} %</td>
                    : <td className={styles.tableCell}>{dataRow['totaluseractions']}</td>
                : ''}
              
              <td className={`${styles.tableCell} ${styles.tableLastCol}`}>
                <a href={isIVolunteer ? 'ivolunteer_-_taskdetails.html?taskId=' + dataRow.taskid : '#'}>
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
const useTable = (data: any, page: number) => {
  const [tableRange, setTableRange] = useState<Array<number>>([]);
  const [dataOnPage, setDataOnPage] = useState<Array<any>>([]);

  useEffect(() => {
    const range  = calculatePageRange(data, page);
    setTableRange([...range]);

    const dataOnPage = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    setDataOnPage([...dataOnPage]);
  }, [data, setTableRange, page, setDataOnPage]);

  return { dataOnPage, tableRange };
}

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

const clickOnTableRow = (setFilter, filterElement, filters, isIVolunteer) => {
    let newFilter;
    if (isIVolunteer) {
        newFilter = {
            "key": "taskid",
            "value": {
              "from": filterElement.taskid,
              "to": ""
            }
        }
    } else {
        let key;
        let elementParent = $('#table_tab1_title').parent();
        if (elementParent.hasClass('selected')) {
           key = $('#table_tab1_title').text().toLowerCase();
        } else {
            key = $('#table_tab2_title').text().toLowerCase();
        }
        newFilter = {
            "key": key,
            "value": filterElement.location
        }
    }

    for (let i = 0; i < filters.length; i++) {
        if (filters[i].key === newFilter.key) {
            filters.splice(i, 1);
        }
    }
    filters.push(newFilter);
    setFilter(filters);
}

export default Table;