import React, { useCallback, useEffect, useState } from "react";
import dt_filters from "../../data/dt_filters";
import styles from "./Filterbar.module.css";
import removeIcon from "./img/remove-icon.png";

type FilterbarProps = {
    isIVolunteer: boolean;
    existingFilters: any;
    //onSetFilters: (value) => void;
}

const Filterbar: React.FC<FilterbarProps> = ( { isIVolunteer, existingFilters } ) => {
    const [filters, setFilterState] = useState(existingFilters);

    // const memoizedCallback = useCallback(
    //     (value) => {
    //       setFilters(value);
    //       onSetFilters(value);
    //     },
    //     [filters, onSetFilters],
    //   );

    return (
      <>
        <div className={styles.filterbar}>
            <div className={styles.filterStaticText}>Filtered by:</div>
            {filters.map((element: any) => (
                <FilterElement filterKey={element.key} filterValue={element.value} filters={filters} setFilters={setFilterState}></FilterElement>
            ))}
            {filters.length > 0 
                ?   <div className={styles.filterElement} onClick={() => clearAllFilterElements(setFilterState)}>
                        <span>Clear all</span>
                    </div>
                :   '<Click here to add a filter>'}
        </div>
      </>
    );
};

type FilterElementProps = {
    filterKey: string;
    filterValue: string;
    filters: any[];
    setFilters: any;
}

const FilterElement: React.FC<FilterElementProps> = ( { filterKey, filterValue, filters, setFilters } ) => {
    return (
        <>
            <div className={styles.filterElement} key={filterKey} id={filterKey}>
                <div className={styles.filterTextPanel}>
                    <span className={styles.filterKey}>{filterKey}: </span>
                    <span className={styles.filterValue}>{filterValue}</span>
                </div>
                <div className={styles.removeFilterBtn} onClick={() => removeFilter(filterKey, filters, setFilters)}>
                    <img src={removeIcon} className={styles.removeFilterBtn} alt='remove-filter'></img>
                </div>
            </div>
        </>
    )
}

const removeFilter = (filterKey: string, filters: any[], setFilterState: any) => {
    console.log('removed this filter: ' + filterKey);

    // TODO properly delete one element
    let newFilterList = filters.filter(el => el.key !== filterKey);
    setFilterState(newFilterList);
}

const clearAllFilterElements = (setFilterState) => {
    console.log('all cleared!');
    setFilterState([]);
}

export default Filterbar;