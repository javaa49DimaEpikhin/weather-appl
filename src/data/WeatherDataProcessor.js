export class WeatherDataProcessor {
    #cityGeocodes;
    #baseUrl;
    #baseParams;

    constructor() {
        this.#cityGeocodes = [
            { city: "Haifa", latidude: 32.7940, longitude: 34.9896 },
            { city: "Tel-Aviv", latidude: 32.0853, longitude: 34.7818 },
            { city: "Rehovot", latidude: 31.8928, longitude: 34.8113 },
            { city: "Jerusalem", latidude: 31.7683, longitude: 35.2137 },
            { city: "Eilat", latidude: 31.258, longitude: 35.212 },
        ];
        this.#baseUrl = "https://api.open-meteo.com/v1/gfs?";
        this.#baseParams = "&hourly=temperature_2m&timezone=IST&";
    }
    getData(requestObject, fn) {
        const url = this.getUrl(requestObject);
        const limits = this.getHourLimits(requestObject);
        console.log(limits);
        const promiseResponse = fetch(url);
        this.processData(promiseResponse.then(response => response.json())).then(data => {
            const output = data.filter(e => {
                const hour = +(e.hour.slice(0, 2));
                return hour >= limits.hourMin && hour < limits.hourMax;
            })
            fn(output);
        });
    }
    getData1(requestObject) {
        const url = this.getUrl(requestObject);
        const promiseResponse = fetch(url);
        return this.processData(promiseResponse
            .then(response => response.json()));
    }

    getUrl(requestObject) {
        const cityRecords = this.#cityGeocodes.filter(record => {
            return requestObject.city == record.city;
        })
        const latidude = cityRecords[0].latidude;
        const longitude = cityRecords[0].longitude;
        const start_date = requestObject.dateFrom;
        const end_date = requestObject.dateTo;
        const url = `${this.#baseUrl}latitude=${latidude}&longitude=${longitude}${this.#baseParams}start_date=${start_date}&end_date=${end_date}`

        return url;
    }
    getHourLimits(requestObject) {
        return { hourMin: +requestObject.hourFrom, hourMax: +requestObject.hourTo };
    }
    processData(promiseData) {
        return promiseData.then(data => {
            return data.hourly.time.map((cur, index) => {
                const dateTime = cur.split("T");
                return {
                    date: dateTime[0],
                    hour: dateTime[1],
                    temperature: data.hourly.temperature_2m[index]
                }
            });
        })
    }
}
