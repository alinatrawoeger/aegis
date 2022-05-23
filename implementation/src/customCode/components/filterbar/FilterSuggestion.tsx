import React from 'react';
import styles from "./Filterbar.module.css";

const FilterSuggestionPanel = ( { suggestions, isIVolunteer } ) => {
    const keys = getFilters(suggestions);
    let values = getFilterSuggestions(isIVolunteer, suggestions);

    return(
        <>
            {keys.map((filterKey: string) => (
                <FilterSuggestion key={filterKey} filterKey={filterKey} filterValues={values[filterKey]} ></FilterSuggestion>
            ))}
        </>
    );
}

const FilterSuggestion = ( { filterKey, filterValues } ) => {
    const keys = Object.keys(filterValues);
    return (
        <>
            <div className={styles.suggestionsPanel}>
                <div className={styles.suggestionFiltername}>{filterKey}:</div>
                <div className={styles.suggestionValuesPanel}>
                    {
                        keys.map((valueKey: string) => (
                            <div className={styles.suggestionValueElement}>{filterValues[valueKey]}</div>
                        ))
                    }
                </div>
            </div>
        </>
    );  
}


/**
 * get FilterKeys as a first step
 * 
 * @param suggestions
 * @returns 
 */
const getFilters = (suggestions) => {
    return Object.keys(suggestions);
}

/**
 * get all FilterValues. 
 * Also, handle multi-levelled hierarchies in filter values (e.g. regions/cities)
 * 
 * @param isIVolunteer 
 */
const getFilterSuggestions = (isIVolunteer: boolean, suggestions: any) => {
    const keys = getFilters(suggestions);
    let values = {};
    if (isIVolunteer) {
        values = suggestions;
    } else {
        for (let i = 0; i < keys.length; i++) {
            const filterKey = keys[i];
            if (filterKey === 'regions') {
                let tempValues = {};
                for (let countryKey in suggestions[filterKey]) {
                    for (let regionKey in suggestions[filterKey][countryKey]) {
                        tempValues[regionKey] = suggestions[filterKey][countryKey][regionKey]; 
                    }
                }
                values[filterKey] = tempValues;
            } else if (filterKey === 'cities') {
                let tempValues = {};
                for (let countryKey in suggestions[filterKey]) {
                    for (let regionKey in suggestions[filterKey][countryKey]) {
                        for (let cityIndex = 0; cityIndex < suggestions[filterKey][countryKey][regionKey].length; cityIndex++) {
                            tempValues[regionKey + "/" + cityIndex] = suggestions[filterKey][countryKey][regionKey][cityIndex].name; 
                        }
                    }
                }
                values[filterKey] = tempValues;
            } else {
                values[filterKey] = suggestions[filterKey];
            }
        }
    }

    return values;
}

export default FilterSuggestionPanel;