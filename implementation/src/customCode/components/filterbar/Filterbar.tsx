import React, { useCallback, useState } from "react";
import styles from "./Filterbar.module.css";
import removeIcon from "./img/remove-icon.png";

type FilterbarProps = {
    isIVolunteer: boolean;
    existingFilters: []
    //onSetFilters: (value) => void;
}

const Filterbar: React.FC<FilterbarProps> = ( { isIVolunteer, existingFilters } ) => {
    const [filters, setFilters] = useState([]);

    let filterList = [

    ];

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
            <FilterElement filterKey='Greeting' filterValue='hi'></FilterElement>
            <div className={styles.filterElement} onClick={clearAllFilterElements}>
                <span>Clear all</span>
            </div>
        </div>
      </>
    );
};

type FilterElementProps = {
    filterKey: string;
    filterValue: string;
}

const FilterElement: React.FC<FilterElementProps> = ( { filterKey, filterValue } ) => {
    return (
        <>
            <div className={styles.filterElement}>
                <div className={styles.filterTextPanel}>
                    <span className={styles.filterKey}>{filterKey}: </span>
                    <span className={styles.filterValue}>{filterValue}</span>
                </div>
                <div className={styles.removeFilterBtn} onClick={removeFilter}>
                    <img src={removeIcon} className={styles.removeFilterBtn} alt='remove-filter'></img>
                </div>
            </div>
        </>
    )
}

function removeFilter() {
    console.log('removed this filter');
}

function clearAllFilterElements() {
    console.log('cleared!');
}

export default Filterbar;