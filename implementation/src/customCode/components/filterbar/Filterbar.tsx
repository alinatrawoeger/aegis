import React, { useEffect, useState } from "react";
import dtFilters from '../../data/dt_filters';
import iVolFilters from '../../data/ivol_filters.json';
import styles from "./Filterbar.module.css";
import FilterSuggestionPanel from "./FilterSuggestion";
import removeIcon from "./img/remove-icon.png";

type FilterbarProps = {
    isIVolunteer: boolean;
    onSelectedFilters: (value) => void;
    onFilterSuggestions: (value) => void;
}

const Filterbar: React.FC<FilterbarProps> = ( { isIVolunteer, onSelectedFilters, onFilterSuggestions} ) => {
    const [selectedFilters, setSelectedFilters] = useState(getTestFilters);

    // const memoizedCallback = useCallback(
    //     (value) => {
    //       setFilters(value);
    //       onSetFilters(value);
    //     },
    //     [filters, onSetFilters],
    //   );

    const filterSuggestions = useFilterSuggestions(isIVolunteer, selectedFilters, setSelectedFilters);

    return (
      <>
        <div className={styles.filterbar}>
            <div className={styles.filterStaticText}>Filtered by:</div>
            {selectedFilters.map((element: any) => (
                <FilterElement filterKey={element.key} filterValue={element.value} filters={selectedFilters} setFilters={setSelectedFilters}></FilterElement>
            ))}
            {selectedFilters.length > 0 
                ?   <div className={styles.filterElement} onClick={() => clearAllFilterElements(setSelectedFilters)}>
                        <span>Clear all</span>
                    </div>
                :   '<Click here to add a filter>'}
            <FilterSuggestionPanel suggestions={filterSuggestions}></FilterSuggestionPanel>
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

const getTestFilters = () => {
    return [
        {
            "key": "Greeting",
            "value": "hello"
        },
        {
            "key": "Figure",
            "value": "Law"
        },
        {
            "key": "Computer",
            "value": "Mac"
        }
    ];
}

const removeFilter = (filterKey: string, filters: any[], setFilterState: any) => {
    let newFilterList = filters.filter(el => el.key !== filterKey);
    setFilterState(newFilterList);
}

const clearAllFilterElements = (setFilterState) => {
    setFilterState([]);
}

const showFilterSuggestions = (isIVolunteer: boolean) => {
    if (isIVolunteer) {
        return iVolFilters[0];
    } else {
        return dtFilters[0];
    }
}

const useFilterSuggestions = (isIVolunteer: boolean, selectedFilters: any[], setSelectedFilters: any) => {
    let temp = showFilterSuggestions(isIVolunteer);
    const [filterSuggestions, setFilterSuggestions] = useState(temp);

    useEffect(() => {
            // check if selectedFilters contains a filter from filterSuggestions and remove it from filterSuggestions
            console.log("changed filter");

        }, [selectedFilters, setSelectedFilters]
    );

    return filterSuggestions;
}

const addFilter = () => {

}

export default Filterbar;