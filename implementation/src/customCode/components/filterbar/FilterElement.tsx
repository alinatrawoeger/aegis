import removeIcon from "./img/remove-icon.png";
import styles from "./Filterbar.module.css";
import React from "react";

const FilterElement = ( { filterKey, filterValue, removeFilter } ) => {
    return (
        <>
            <div className={styles.filterElement} key={filterKey} id={filterKey}>
                <div className={styles.filterTextPanel}>
                    <span className={styles.filterKey}>{filterKey}: </span>
                    <span className={styles.filterValue}>{filterValue}</span>
                </div>
                <div className={styles.removeFilterBtn} onClick={() => removeFilter(filterKey)}>
                    <img src={removeIcon} className={styles.removeFilterBtn} alt='remove-filter'></img>
                </div>
            </div>
        </>
    )
}

export default FilterElement;