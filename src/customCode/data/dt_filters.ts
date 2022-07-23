export default [ 
    {
        "continent": {
            "filterType": "text",
            "properties": {
                "AS": "Asia",
                "EU": "Europe",
                "NA": "North America",
            }
        },
        "country": {
            "filterType": "text",
            "properties": {
                "Europe": {
                    "AT": "Austria",
                    "BE": "Belgium",
                    "FR": "France",
                    "DE": "Germany",
                    "IT": "Italy",
                    "NO": "Norway",
                    "ES": "Spain",
                    "GB": "United Kingdom",
                },
                "North America": {
                    "CA": "Canada",
                    "MX": "Mexico",
                    "US": "United States",
                },
                "Asia": {
                    "JP": "Japan",

                },
            }
        },
        "region": {
            "filterType": "text",
            "properties": {
                "Europe": {
                    "France": {
                        "FR-A": "Alsace",
                    },
                    "Germany": {
                        "DE-BE": "Berlin",
                    },
                    "Italy": {
                        "IT-25": "Lombardy",
                    },
                    "United Kingdom": {
                        "GB-SCT": "Scotland",
                    },
                    "Austria": {
                        "AT-4": "Upper Austria",
                    },

                },
                "North America": {
                    "United States": {
                        "US-NY": "New York",
                    },
                }
            }
        },
        "city": {
            "filterType": "text",
            "properties": {
                "Europe": {
                    "Austria": {
                        "Upper Austria": [
                            {
                                "name": "Linz",
                                "latitude": 48.3069,
                                "longitude": 14.2858
                            },
                            {
                                "name": "Wels",
                                "latitude": 48.1654,
                                "longitude": 14.0366
                            },
                        ],
                        "Vienna": [
                            {
                                "name": "Wien",
                                "latitude": 48.2082,
                                "longitude": 16.3738
                            }
                        ]
                    },
                    "Germany": {
                        "Berlin": [
                            {
                                "name": "Berlin",
                                "latitude": 52.5200,
                                "longitude": 13.4050
                            }
                        ]
                    },
                },
                "North America": {
                    "United States": {
                        "New York": [
                            {
                                "name": "New York City",
                                "latitude": 40.7128,
                                "longitude": -74.0060
                            }
                        ]
                    }
                }
            }
        },
        "apdex": {
            "filterType": "range",
            "properties": {
                "Excellent": 1.00,
                "Very good": 0.90,
                "Good": 0.75,
                "Poor": 0.60,
                "Unacceptable": 0.5
            }
        }
    }
]