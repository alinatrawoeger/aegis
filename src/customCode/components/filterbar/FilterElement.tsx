import React from "react";
import { FilterType, getFilterType, getIVolFilterName } from "../../utils";
import styles from "./Filterbar.module.css";
import removeIcon from "./img/remove-icon.png";

const FilterElement = ( { filterKey, filterValue, removeFilter, isIVolunteer } ) => {
    let filterType;
    if (filterKey === 'taskid' && filterValue.to === '') {
        filterType = FilterType.TEXT;
        filterValue = filterValue.from;
    } else {
        filterType = getFilterType(filterKey);
    }
    return (
        <>
            <div className={`${styles.filterElement} ${isIVolunteer ? styles.filterElementIVol : styles.filterElementDt}`} key={filterKey} id={`${filterKey}Filter`}>
                <div className={styles.filterTextPanel}>
                    <span className={styles.filterKey}>{isIVolunteer ? getIVolFilterName(filterKey) : filterKey}: </span>
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