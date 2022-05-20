import React from 'react';
import styles from "./Filterbar.module.css";

const FilterSuggestionPanel = ( { suggestions } ) => {
    const keys = Object.keys(suggestions);
    return(
        <>
            {keys.map((filterKey: string) => (
                <FilterSuggestion key={filterKey} filterKey={filterKey} filterValues={suggestions[filterKey]} ></FilterSuggestion>
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
                    {filterKey !== 'regions' && filterKey !== 'cities'
                        ?   keys.map((valueKey: string) => (
                                <span>{filterValues[valueKey]}</span>
                            ))
                        :   <span>hi</span>
                    }
                </div>
            </div>
        </>
    );  
}

export default FilterSuggestionPanel;