import React from "react";
import { FilterType, getFilterType } from "../../utils";
import styles from "./Filterbar.module.css";
import removeIcon from "./img/remove-icon.png";

const FilterElement = ( { filterKey, filterValue, removeFilter, isIVolunteer } ) => {
    const filterType = getFilterType(filterKey);
    return (
        <>
            <div className={`${styles.filterElement} ${isIVolunteer ? styles.filterElementIVol : styles.filterElementDt}`} key={filterKey} id={filterKey}>
                <div className={styles.filterTextPanel}>
                    <span className={styles.filterKey}>{filterKey}: </span>
                    {
                        filterType === FilterType.TEXT 
                        ?   <span className={styles.filterValue}>{filterValue}</span>
                        :   <span className={styles.filterValue}>{`${filterValue[0]} - ${filterValue[1]}`}</span>
                    }
                </div>
                <div className={styles.removeFilterBtn} onClick={() => removeFilter([filterKey, false])}>
                    <img src={removeIcon} className={styles.removeFilterBtn} alt='remove-filter'></img>
                </div>
            </div>
        </>
    )
}

export default FilterElement;