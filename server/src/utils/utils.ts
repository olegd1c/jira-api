export enum WeekType {
    paired = 0,
    unpaired = 1,
    all = 2
}

export function getWeekType(){
    const currentdate = new Date();
    const oneJan = new Date(currentdate.getFullYear(),0,1);
    const numberOfDays = Math.floor((+currentdate - +oneJan) / (24 * 60 * 60 * 1000));
    const result = Math.ceil(( currentdate.getDay() + 1 + numberOfDays) / 7);
  
    return result % 2;
  }