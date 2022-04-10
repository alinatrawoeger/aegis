export class ZoomLevel {
    static WORLD = new ZoomLevel(1);
    static CONTINENT = new ZoomLevel(3);
    static COUNTRY = new ZoomLevel(6);
    static REGION = new ZoomLevel(8);
    static CITY = new ZoomLevel(10);
    
    level: number;

    constructor(level: number) {
        this.level = level;
    }
}