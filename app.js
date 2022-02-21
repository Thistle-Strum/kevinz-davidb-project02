const wbApp = {};

// namespace variables established at initialization

//base url for the api call
wbApp.baseUrl = 'https://api.worldbank.org/v2/country';

//variable for the lastet year to get data from - currently hardcoded for 2020
wbApp.currentYear = "2020";

//array for storing the list of countries grabbed from the api
wbApp.countries = [];

//array for the country codes for the user selected countries
wbApp.selectedCountries = ["", ""];
// array for the country names
wbApp.selectedCountryNames = ["", ""];

//default indicators array - grab data for these 5 stats by default
wbApp.defaultIndicators = [
    "SP.POP.TOTL",  //total population
    "SP.DYN.LE00.IN", //life expectancy
    "NY.GDP.PCAP.CD", //gdp per capita
    "SE.ADT.LITR.ZS", //adult literacy rate
    "EN.ATM.CO2E.PC" //co2 emissions per capita
];

wbApp.countryList = function() {
    // On initialization make a call to wb to populate selector option elements 
    fetch('https://api.worldbank.org/v2/country/all/?format=json&per_page=300')
        .then(function(response) {           
         return response.json();
        })
        .then(function(jsonResult) { 
            // filter the countries from the jsonResult into the countries array
            wbApp.countries = jsonResult[1].filter( (countryObject)=> {
                return countryObject.region.value != "Aggregates" && countryObject.id != "TWN";
            });

            // populate selectors with names of countries
            const selector = document.querySelectorAll('select'); 
            for (let i=0;i < wbApp.countries.length; i++) {
                wbApp.createSelectOption(selector[0], i);
                wbApp.createSelectOption(selector[1], i);
            }
            // access user's selector values and retrieve country codes for api call
            selector[0].addEventListener('change', function() {
                // populate selectedCountries array with user's chosen countries
                wbApp.selectedCountryNames[0] = selector[0].value 
                for (let i=0;i < wbApp.countries.length; i++) {    
                    if (wbApp.countries[i].name === selector[0].value) {
                        // populate selectedCountries array with user's chosen country codes
                        wbApp.selectedCountries[0] = wbApp.countries[i].id; 
                    }
                }   
            });
            selector[1].addEventListener('change', function() {
                wbApp.selectedCountryNames[1] = selector[1].value 
                for (let i=0;i < wbApp.countries.length; i++) {
                    if (wbApp.countries[i].name === selector[1].value) {
                        wbApp.selectedCountries[1] = wbApp.countries[i].id;
                    }                     
                }   
            });
              
            // attach a click event listener to the form submit input
            const compare = document.querySelector('input[type="submit"]');              
            compare.addEventListener('click', function(event) {
                event.preventDefault();
                const alertMessage = document.querySelector('.error');
                alertMessage.innerHTML = "";
                // check the user selected two different countries before calling the api
                if(wbApp.selectedCountries[0] == "" || wbApp.selectedCountries[1] == "") {
                    alertMessage.textContent = "Please select two countries";
                } else if(wbApp.selectedCountries[0] == wbApp.selectedCountries[1]) {
                    alertMessage.textContent = "Please select two different countries"
                } else {
                    const previousResults = document.querySelector('.resulsA .indicatorData');
                    wbApp.callWorldBankApi(wbApp.selectedCountries, wbApp.defaultIndicators);
                }
            });
        });
};

// function to populate selector elements with country names
wbApp.createSelectOption = function(dropdownList, countryIndex)  {   
    const option = document.createElement('option')
    option.textContent = wbApp.countries[countryIndex].name
    dropdownList.appendChild(option);
};

wbApp.displayData = function(dataArray) {
    
    // get div containing the class .countryName
    const resultsACountryName = document.querySelector('.resultsA .countryName');
    // get div containing the class .indicatorData
    const resultsAIndicatorData = document.querySelector('.resultsA .indicatorData');
    const flagA = document.querySelector('.flagA')

    // clear previous results
     resultsACountryName.innerHTML = ''; 
     resultsAIndicatorData.innerHTML = ''; 
     flagA.innerHTML= '';
  
// get first country name from global variable
    const countryAName = wbApp.selectedCountryNames[0];
    // get first nested array from api call
    const countryAResults = dataArray[0];
    const flagAUrl = `https://countryflagsapi.com/png/${wbApp.selectedCountries[0]}`
   
    const flagAElement = document.createElement('img');
    flagAElement.src = flagAUrl;
    flagAElement.alt = `The national flag of ${wbApp.selectedCountryNames[0]}`;
    flagA.appendChild(flagAElement);

    // create a <p> to display country name in
    const resultAParagraphElement = document.createElement('p')
    // add first country to <p>
    resultAParagraphElement.textContent = `${countryAName}`;
    // using inline styling to add padding
    // resultAParagraphElement.style.padding = '25px 0';
    // append <p> to the element with a class of .resultsA
    resultsACountryName.appendChild(resultAParagraphElement)
  
// loop through data array result and display all property keys and values 
    countryAResults.forEach(function(result) { 
        // create a <p> to display country name in 
        const indicator1 = document.createElement('li');  
        const values1 = document.createElement('li');
        // new variable to hold reformatted values
        let newFloat = '';
        result.value.toLocaleString();
        
         // use a template literal to display property names and values separated by a colon        
        indicator1.textContent = `${result.name}`;

        // conditional used to reduce size of float values
        if (result.value  % 1 == 0 || typeof result.value  == 'string') {
            newFloat = result.value.toLocaleString();
            } else {
            newFloat = result.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            }

        values1.textContent = newFloat

        resultsAIndicatorData.appendChild(indicator1);
        resultsAIndicatorData.appendChild(values1);
    });

    const resultsBCountryName = document.querySelector('.resultsB .countryName');
    // get div containing the class .indicatorData
    const resultsBIndicatorData = document.querySelector('.resultsB .indicatorData');
    const flagB = document.querySelector('.flagB')
  
    // clear previous results
    resultsBCountryName.innerHTML = ''; 
    resultsBIndicatorData.innerHTML = ''; 
    flagB.innerHTML= '';

    const countryBName = wbApp.selectedCountryNames[1];
    const countryBResults = dataArray[1];
    const flagBUrl = `https://countryflagsapi.com/png/${wbApp.selectedCountries[1]}`
  
    const flagBElement = document.createElement('img');
    flagBElement.src = flagBUrl;
    flagBElement.alt = `The national flag of ${wbApp.selectedCountryNames[1]}`;
    flagB.appendChild(flagBElement);

    const resultBParagraphElement = document.createElement('p')
    resultBParagraphElement.textContent = `${countryBName}`;
    // resultBParagraphElement.style.padding = '25px 0'
    resultsBCountryName.appendChild(resultBParagraphElement)

    countryBResults.forEach(function(result) {   
        const indicator2 = document.createElement('li');  
        const values2 = document.createElement('li');
        let newFloat = '';
       
            if (result.value % 1 == 0 || typeof result.value == 'string') {
                newFloat = result.value.toLocaleString();
                    } else {
                        newFloat = result.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                    }
       
        indicator2.textContent = `${result.name}`
        values2.textContent = newFloat
      
        // listEl.textContent = `${result.name}: ${result.value}`
        resultsBIndicatorData.appendChild(indicator2);
        resultsBIndicatorData.appendChild(values2);
    });

// create two new variables for values to be compared in loop
    for(let i=2, valueIndex=0; i <=10, valueIndex <= 4; i += 2, valueIndex++) {
        // create variables for list and use template literals to loop through specific indexes 
        // for both countries
        const liElementA = document.querySelector(`.resultsA .indicatorData li:nth-child(${i})`);
        const liElementB = document.querySelector(`.resultsB .indicatorData li:nth-child(${i})`);
        // create variables for the  value properties
        const countryAValue = dataArray[0][valueIndex].value
        const countryAName = dataArray[0][valueIndex].name
        const countryBValue = dataArray[1][valueIndex].value
        const countryBName = dataArray[1][valueIndex].name
        
        // a conditional to highlight the larger values, overlook the "N/As", and target CO2 comparison
        if (typeof countryAValue !== 'string' && typeof countryBValue !== 'string') {       
            if (countryAName === "CO2 emissions (metric tons per capita)" & countryBName === "CO2 emissions (metric tons per capita)") {
                if (countryAValue > countryBValue) {       
                    liElementA.style.fontSize = '1.35rem';
                    liElementA.style.fontWeight = '600';
                    // liElementA.style.color = 'white';
                    liElementA.style.border = 'red solid 5px';
                    liElementA.style.paddingTop = '5px';            
                } else {               
                    liElementB.style.fontSize = '1.35rem'; 
                    liElementB.style.fontWeight = '600';
                    // liElementB.style.color = 'white';
                    liElementB.style.border = 'red solid 5px';
                    liElementB.style.paddingTop = '5px';    
                }   
            }   else if (countryAValue > countryBValue) {       
                liElementA.style.fontSize = '1.35rem';
                liElementA.style.fontWeight = '600';
                   
                } else {               
                    liElementB.style.fontSize = '1.35rem'; 
                    liElementB.style.fontWeight = '600';
                };                               
            }; 
        };                    
    };

//call the world bank api to get data for a selected country and indicator
wbApp.callWorldBankApi = function(countries, indicators) {
    //construct the api url
    //TODO - remove setApiUrl function and use the built in Url object constructor instead
    const url = wbApp.setApiUrl(countries, indicators);
    //make the api call
    fetch(url)
        .then( function(response) {
            return response.json();
        })
        .then( function(jsonResponse) {
            //create an object that holds the values we want as properties and return it
            const processedData = wbApp.getIndicatorValues(jsonResponse, countries, wbApp.currentYear);
            //display the processed data using a function
            wbApp.displayData(processedData);
        });
};

//create the api url based on the selected indicator(s)
wbApp.setApiUrl = function(countryIds, indicatorIds) {
    //create a string of country IDs separated by ;
    const countryString = countryIds.join(';');
    //create a string of indicator IDs separated by ;
    const indicatorString = indicatorIds.join(';');
    //construct the api url - get the indicator values for the past 5 years, filling in any null values with the most recent value from the past five years
    const queryUrl = `${wbApp.baseUrl}/${countryString}/indicator/${indicatorString}?source=2&mrv=10&gapfill=Y&per_page=300&format=json`;
    return queryUrl;
};

//get the indicator values from the array returned by the api
//countryIsoCodes is the array of country IDs used in the api call
wbApp.getIndicatorValues = function(dataArray, countryIsoCodes, year) {
    //put the values inside an array of two arrays, one for each country
    const indicatorValues = [[], []];
    //get the latest indicator data from the api response
    const indicatorArray = dataArray[1].filter( (indicatorItem)=> {
        return indicatorItem.date == year;
    });
    indicatorArray.forEach( (item) => {
        const indicatorObject = {};
        indicatorObject.country = item.country.value; //This is the name of the country
        indicatorObject.countryCode = item.countryiso3code; //This is the iso code for the country - the api uses this to search for countries
        indicatorObject.name = item.indicator.value; //This is the name of the indicator in plain terms. e.g. "Population, Total"
        //check if there is a value for the indicator - set the value to n/a in the output array if the value given by the api is null
        if(item.value == null) {
            indicatorObject.value = "N/A";
        } else {
            indicatorObject.value = item.value;
        }
        
        //push the indicator data into the corresponding country array
        if (indicatorObject.countryCode == countryIsoCodes[0]) {
            indicatorValues[0].push(indicatorObject);
        } else if (indicatorObject.countryCode == countryIsoCodes[1]){
            indicatorValues[1].push(indicatorObject);
        }
    });

    return indicatorValues;
};

wbApp.init = function() {
    wbApp.countryList();
};

wbApp.init();